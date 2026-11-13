import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ModelDimensionOverlay, fillMeasurementList, measurementText, type ModelMeasurements } from './model-dimensions';
import { installModelDialog } from './model-dialog';

type Face = { vertices:number[]; indices:number[]; surface:string; radius?:number; minor_radius?:number; area_mm2?:number };
type GeometryData = { bounds:number[]; faces:Face[]; edges:number[] };
type Example = { id:string; title:string; label:string; summary:string; whole:string; section:string; size:string; volume:string; limitations:string; measurements:string };

const root = document.querySelector<HTMLElement>('[data-model-viewer]');
if (root) {
  installModelDialog(root);
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    startViewer(root).catch(() => {
      const message = root.querySelector<HTMLElement>('[data-model-message]')!;
      message.hidden = false;
      message.textContent = 'Интерактивный просмотр недоступен. Описание примеров и их размеры доступны ниже в статье.';
      root.dataset.modelError = 'true';
    });
  }, { rootMargin: '200px' });
  observer.observe(root);
}

async function startViewer(root:HTMLElement) {
  const examples = JSON.parse(root.querySelector('[data-model-data]')!.textContent!) as Example[];
  const stage = root.querySelector<HTMLElement>('[data-model-stage]')!;
  const message = root.querySelector<HTMLElement>('[data-model-message]')!;
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000,0);
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute('aria-label','Интерактивная 3D-модель. Стрелки — вращение, плюс и минус — масштаб, 0 — вписать.');
  stage.append(renderer.domElement);
  const dimensionOverlay=new ModelDimensionOverlay(stage);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1,1,1,-1,.01,10000);
  camera.up.set(0,0,1);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.screenSpacePanning = true;
  controls.minZoom = .25;
  controls.maxZoom = 20;
  const group = new THREE.Group();
  group.rotation.y = Math.PI/2;
  scene.add(group);
  scene.add(new THREE.HemisphereLight(0xf3f7ff,0x516374,2.4));
  for (const [position,intensity] of [[[2,-3,4],3.1],[[-2,2,1],2],[[0,3,-2],1]] as [number[],number][]) {
    const light = new THREE.DirectionalLight(0xffffff,intensity);
    light.position.set(...position as [number,number,number]); scene.add(light);
  }
  let grid:THREE.GridHelper | undefined;
  let edgeLines:THREE.LineSegments | undefined;
  let faceMeshes:THREE.Mesh<THREE.BufferGeometry,THREE.MeshStandardMaterial>[] = [];
  let data:GeometryData;
  let measurements:ModelMeasurements|undefined,dimensionsVisible=false,activeDimension=-1;
  const modelCenter=new THREE.Vector3();
  let index=0, selected=-1, section=false, edges=true, gridVisible=true, loading=false;
  let extent=100, fitHeight=100, view='iso', loadVersion=0;
  let frame=0, visible=true;
  const cache = new Map<string,Promise<GeometryData>>();
  const measurementCache=new Map<string,Promise<ModelMeasurements>>();
  const q = <T extends HTMLElement=HTMLElement>(selector:string) => root.querySelector<T>(selector)!;
  const qa = (selector:string) => Array.from(root.querySelectorAll<HTMLElement>(selector));
  const number = (v:number) => v.toLocaleString('ru-RU',{maximumFractionDigits:2});
  function invalidate() {
    if (frame || !visible || document.hidden) return;
    frame = requestAnimationFrame(() => {
      frame=0;renderer.render(scene,camera);
      if(dimensionsVisible&&measurements&&!loading) dimensionOverlay.draw(measurements.items,camera,group.matrixWorld,modelCenter,activeDimension);
      else dimensionOverlay.hide();
    });
  }
  controls.addEventListener('change', invalidate);
  controls.addEventListener('start', () => { qa('[data-view]').forEach(b=>b.setAttribute('aria-pressed','false')); });
  new IntersectionObserver(([entry]) => { visible=entry.isIntersecting; if (visible) invalidate(); }).observe(stage);
  document.addEventListener('visibilitychange',invalidate);
  function theme() {
    const dark=document.documentElement.dataset.theme==='dark';
    for (const mesh of faceMeshes) {
      mesh.material.color.setHex(mesh.userData.faceIndex===selected ? 0x80b7dd : dark ? 0x8196a7 : 0x8da5b7);
    }
    if(edgeLines) (edgeLines.material as THREE.LineBasicMaterial).color.setHex(dark?0x283f51:0x314e65);
    invalidate();
  }
  new MutationObserver(theme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  function resize() {
    const width=stage.clientWidth, height=stage.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width,height,false);
    const aspect=width/height;
    if(faceMeshes.length) {
      camera.updateMatrixWorld();
      const projectedBounds=new THREE.Box3().setFromObject(group).applyMatrix4(camera.matrixWorldInverse);
      const projectedSize=projectedBounds.getSize(new THREE.Vector3());
      fitHeight=Math.max(projectedSize.y,projectedSize.x/aspect,extent*.02)*1.25;
    }
    const range=fitHeight*(dimensionsVisible?1.4:1);
    camera.left=-range*aspect/2; camera.right=range*aspect/2;
    camera.top=range/2; camera.bottom=-range/2;
    camera.updateProjectionMatrix(); invalidate();
  }
  new ResizeObserver(resize).observe(stage);
  root.addEventListener('model-layout-changed',()=>{visible=true;resize();});
  function setView(name:string,reset=true) {
    view=name;
    const directions:Record<string,number[]> = {iso:[1.3,section?2:-2,1.3],front:[0,section?1:-1,0],top:[0,0,1],side:[1,0,0]};
    const direction=new THREE.Vector3(...directions[name] as [number,number,number]).normalize();
    camera.up.set(0,0,1);
    if (name==='top') camera.up.set(0,1,0);
    controls.target.set(0,0,0);
    camera.position.copy(direction.multiplyScalar(extent*3));
    if(reset) camera.zoom=1;
    camera.near=extent/1000; camera.far=extent*20;
    camera.lookAt(0,0,0); camera.updateProjectionMatrix(); controls.update();
    qa('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===name)));
    resize();
  }
  function fit() {
    const bounds=new THREE.Box3().setFromObject(group);
    const size=bounds.getSize(new THREE.Vector3());
    extent=Math.max(size.x,size.y,size.z,1);
    setView(view);
  }
  function clearModel() {
    for(const child of [...group.children]) {
      group.remove(child);
      const object=child as THREE.Mesh;
      object.geometry?.dispose();
      if(Array.isArray(object.material)) object.material.forEach(m=>m.dispose());
      else object.material?.dispose();
    }
    if(grid) { scene.remove(grid); grid.geometry.dispose(); (grid.material as THREE.Material).dispose(); }
    faceMeshes=[]; selected=-1; edgeLines=undefined;
  }
  function selectFace(faceIndex:number) {
    if(!data?.faces.length || loading) return;
    selected=((faceIndex%data.faces.length)+data.faces.length)%data.faces.length;
    const face=data.faces[selected];
    const types:Record<string,string>={plane:'Плоскость',cylinder:'Цилиндрическая поверхность',cone:'Коническая поверхность',sphere:'Сферическая поверхность',torus:'Тороидальная поверхность',bspline:'Криволинейная поверхность'};
    q('[data-face-title]').textContent=`Грань ${selected+1} из ${data.faces.length} · ${types[face.surface]??'Поверхность'}`;
    const list=q('[data-face-values]'); list.replaceChildren();
    const add=(label:string,value:string)=> { const row=document.createElement('div'); const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=value;row.append(dt,dd);list.append(row); };
    if(Number.isFinite(face.radius)) add('Радиус',number(face.radius!)+' мм');
    if(Number.isFinite(face.minor_radius)) add('Малый радиус',number(face.minor_radius!)+' мм');
    if(Number.isFinite(face.area_mm2)) add('Площадь',number(face.area_mm2!)+' мм²');
    if(!list.children.length) add('Осмотр','Поверхность выделена на модели');
    theme();
  }
  function showDimensions(show:boolean) {
    dimensionsVisible=show;
    root.classList.toggle('model-shows-dimensions',show);
    root.dataset.dimensionsVisible=String(show);
    q('[data-model-action="dimensions"]').setAttribute('aria-pressed',String(show));
    q('[data-measurement-selection]').hidden=!show;
    q('#model-dimensions').hidden=!show;
    resize();
  }
  function selectDimension(selectedIndex:number) {
    if(!measurements)return;
    activeDimension=selectedIndex;
    const item=measurements.items[selectedIndex];
    q('[data-measurement-label]').textContent=`${item.label} · ${measurementText(item)} ${item.unit}`;
    qa('[data-measurement]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.measurement)===selectedIndex)));
    invalidate();
  }
  async function load() {
    const version=++loadVersion; loading=true;
    q<HTMLButtonElement>('[data-model-action="dimensions"]').disabled=true;
    const example=examples[index];
    message.hidden=false;message.textContent='Загружаем модель…';
    root.dataset.loading='true';
    qa('[data-model-id]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.modelId===example.id)));
    for(const [key,value] of Object.entries({title:example.title,label:example.label,summary:example.summary,size:example.size,volume:example.volume,limit:example.limitations})) q('[data-model-'+key+']').textContent=value;
    q('[data-model-action="section"]').setAttribute('aria-pressed',String(section));
    q('[data-face-title]').textContent='Выберите грань на модели';q('[data-face-values]').replaceChildren();
    q('[data-fullscreen-title]').textContent=example.title;
    q('[data-measurement-label]').textContent='Выберите значение в списке размеров';
    try {
      const url=section?example.section:example.whole;
      if(!cache.has(url)) cache.set(url,fetch(url).then(r=>{if(!r.ok) throw new Error('Model unavailable');return r.json();}));
      if(!measurementCache.has(example.measurements))measurementCache.set(example.measurements,fetch(example.measurements).then(r=>{if(!r.ok)throw new Error('Measurements unavailable');return r.json();}));
      const [geometry,dimensionData]=await Promise.all([cache.get(url)!,measurementCache.get(example.measurements)!]);
      if(version!==loadVersion) return;
      clearModel(); data=geometry;
      const b=data.bounds, center=new THREE.Vector3((b[0]+b[3])/2,(b[1]+b[4])/2,(b[2]+b[5])/2);
      modelCenter.copy(center);measurements=dimensionData;activeDimension=-1;
      fillMeasurementList(q('[data-measurement-list]'),measurements,selectDimension);
      q('[data-measurement-count]').textContent=String(measurements.items.length);
      q('[data-measurement-note]').textContent=measurements.note;
      root.dataset.measurementCount=String(measurements.items.length);
      root.style.setProperty('--model-dimension-height',Math.max(360,Math.ceil(measurements.items.length/2)*25+40)+'px');
      data.faces.forEach((face,i)=> {
        const geom=new THREE.BufferGeometry();
        geom.setAttribute('position',new THREE.Float32BufferAttribute(face.vertices,3));
        geom.setIndex(face.indices); geom.translate(-center.x,-center.y,-center.z); geom.computeVertexNormals();
        const material=new THREE.MeshStandardMaterial({color:0x8da5b7,metalness:.38,roughness:.43,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
        const mesh=new THREE.Mesh(geom,material); mesh.userData.faceIndex=i; group.add(mesh);faceMeshes.push(mesh);
      });
      const edgeGeometry=new THREE.BufferGeometry();
      edgeGeometry.setAttribute('position',new THREE.Float32BufferAttribute(data.edges,3));
      edgeGeometry.translate(-center.x,-center.y,-center.z);
      edgeLines=new THREE.LineSegments(edgeGeometry,new THREE.LineBasicMaterial({color:0x314e65,transparent:true,opacity:.72}));edgeLines.visible=edges;group.add(edgeLines);
      const worldBounds=new THREE.Box3().setFromObject(group), size=worldBounds.getSize(new THREE.Vector3());
      const span=Math.max(size.x,size.y,size.z);
      grid=new THREE.GridHelper(span*1.5,20,0x7891a6,0x8a9ba9);grid.rotation.x=Math.PI/2;grid.position.z=-size.z/2-span*.04;grid.visible=gridVisible;
      (grid.material as THREE.Material).transparent=true;(grid.material as THREE.Material).opacity=.2;scene.add(grid);
      loading=false;root.dataset.loading='false';root.dataset.activeModel=example.id;root.dataset.modelSection=String(section);root.dataset.faceCount=String(data.faces.length);
      delete root.dataset.modelError;
      q<HTMLButtonElement>('[data-model-action="dimensions"]').disabled=false;
      message.hidden=true;showDimensions(dimensionsVisible);fit();theme();
    } catch {
      if(version!==loadVersion)return;
      loading=false;root.dataset.loading='false';root.dataset.modelError='true';
      message.textContent='Модель не загрузилась. Выберите другой пример или обновите страницу.';
    }
  }
  function zoom(factor:number) { camera.zoom=THREE.MathUtils.clamp(camera.zoom*factor,.25,20);camera.updateProjectionMatrix();invalidate(); }
  qa('[data-model-id]').forEach(button=>button.addEventListener('click',()=>{index=examples.findIndex(e=>e.id===button.dataset.modelId);section=false;view='iso';void load();}));
  qa('[data-view]').forEach(button=>button.addEventListener('click',()=>{ if(loading)return; view=button.dataset.view!; fit(); }));
  qa('[data-model-action]').forEach(button=>button.addEventListener('click',()=>{
    const action=button.dataset.modelAction;
    if(action==='dimensions'&&!loading)showDimensions(!dimensionsVisible);
    if(action==='section'){section=!section;void load();}
    if(action==='fit'&&!loading)fit();
    if(action==='in')zoom(1.25);if(action==='out')zoom(1/1.25);
    if(action==='edges'){edges=!edges;if(edgeLines)edgeLines.visible=edges;button.setAttribute('aria-pressed',String(edges));invalidate();}
    if(action==='grid'){gridVisible=!gridVisible;if(grid)grid.visible=gridVisible;button.setAttribute('aria-pressed',String(gridVisible));invalidate();}
  }));
  q('[data-face-next]').addEventListener('click',()=>selectFace(selected+1));
  q('[data-face-prev]').addEventListener('click',()=>selectFace(selected<0?data.faces.length-1:selected-1));
  const raycaster=new THREE.Raycaster();let downX=0,downY=0;
  renderer.domElement.addEventListener('pointerdown',e=>{downX=e.clientX;downY=e.clientY;});
  renderer.domElement.addEventListener('pointerup',e=>{
    if(loading||Math.hypot(e.clientX-downX,e.clientY-downY)>5)return;
    const bounds=renderer.domElement.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((e.clientX-bounds.left)/bounds.width*2-1,-(e.clientY-bounds.top)/bounds.height*2+1),camera);
    const hit=raycaster.intersectObjects(faceMeshes)[0];if(hit)selectFace(hit.object.userData.faceIndex);
  });
  renderer.domElement.addEventListener('keydown',e=>{
    if(loading)return;
    if(['+','=','-','0'].includes(e.key)){e.preventDefault();if(e.key==='0')fit();else zoom(e.key==='-'?1/1.2:1.2);return;}
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
    e.preventDefault();
    const offset=camera.position.clone().sub(controls.target);
    const horizontal=e.key==='ArrowLeft'||e.key==='ArrowRight';
    const axis=horizontal?camera.up:new THREE.Vector3().crossVectors(offset,camera.up).normalize();
    offset.applyAxisAngle(axis,(e.key==='ArrowLeft'||e.key==='ArrowUp'?1:-1)*Math.PI/18);
    camera.position.copy(controls.target).add(offset);camera.lookAt(controls.target);controls.update();invalidate();
    qa('[data-view]').forEach(b=>b.setAttribute('aria-pressed','false'));
  });
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();message.hidden=false;message.textContent='Просмотр приостановлен. Обновите страницу, чтобы загрузить модель заново.';});
  resize();await load();
}
