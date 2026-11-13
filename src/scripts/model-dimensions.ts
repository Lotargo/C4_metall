import * as THREE from 'three';

export type ModelMeasurement = {
  group:string; label:string; value:number; prefix:string; suffix:string; unit:string;
  anchor:[number,number,number]; points?:[[number,number,number],[number,number,number]];
};
export type ModelMeasurements = { note:string; items:ModelMeasurement[] };
const numbers=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:3,useGrouping:false});
export const measurementText=(item:ModelMeasurement)=>`${item.prefix}${numbers.format(item.value)}${item.suffix}`;
const ns='http://www.w3.org/2000/svg';
const svgNode=(name:string,attrs:Record<string,string|number>={},text?:string)=> {
  const element=document.createElementNS(ns,name);
  for(const [key,value] of Object.entries(attrs))element.setAttribute(key,String(value));
  if(text!==undefined)element.textContent=text;
  return element;
};

// Display-only annotations. Model building instructions never enter this layer.
export class ModelDimensionOverlay {
  readonly svg:SVGSVGElement;
  constructor(private stage:HTMLElement) {
    this.svg=svgNode('svg',{'class':'model-dimension-overlay','aria-hidden':'true'}) as SVGSVGElement;
    this.svg.setAttribute('hidden','');stage.append(this.svg);
  }
  hide() { this.svg.setAttribute('hidden',''); }
  draw(items:ModelMeasurement[],camera:THREE.Camera,transform:THREE.Matrix4,center:THREE.Vector3,active:number) {
    const width=this.stage.clientWidth,height=this.stage.clientHeight;
    if(!items.length||width<60||height<60) {this.hide();return;}
    this.svg.removeAttribute('hidden');this.svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    camera.updateMatrixWorld();
    const project=(point:[number,number,number])=> {
      const p=new THREE.Vector3(...point).sub(center).applyMatrix4(transform).project(camera);
      return {x:(p.x+1)*width/2,y:(1-p.y)*height/2};
    };
    const content=document.createDocumentFragment();
    const defs=svgNode('defs'),marker=svgNode('marker',{id:'model-dimension-arrow',viewBox:'0 0 10 10',refX:5,refY:5,markerWidth:5,markerHeight:5,orient:'auto-start-reverse'});
    marker.append(svgNode('path',{d:'M1 1 9 5 1 9',fill:'none',stroke:'var(--dimension-ink)','stroke-width':1.2}));defs.append(marker);content.append(defs);
    const annotations=items.map((item,i)=>({item,index:i,side:0,anchor:project(item.anchor),points:item.points?.map(project),text:`${String(i+1).padStart(2,'0')}  ${measurementText(item)}`,y:0}));
    [...annotations].sort((a,b)=>a.anchor.x-b.anchor.x||a.index-b.index).forEach((a,i)=>{a.side=i<Math.ceil(items.length/2)?0:1;});
    for(const side of [0,1]) {
      const lane=annotations.filter(a=>a.side===side).sort((a,b)=>a.anchor.y-b.anchor.y||a.index-b.index);
      const gap=Math.min(25,(height-38)/Math.max(lane.length,1));
      const start=(height-gap*(lane.length-1))/2;
      lane.forEach((a,i)=>{a.y=start+i*gap;});
    }
    for(const a of annotations) {
      const selected=a.index===active;
      const g=svgNode('g',{'class':'model-dimension-annotation'+(selected?' is-selected':''),'data-measurement-index':a.index});
      g.append(svgNode('title',{},`${a.item.group}: ${a.item.label} — ${measurementText(a.item)} ${a.item.unit}`));
      const labelWidth=Math.max(67,Math.min(width<500?100:128,a.text.length*6+16));
      const x=a.side===0?10:width-labelWidth-10;
      const edge=a.side===0?x+labelWidth:x;
      let target=a.anchor;
      if(a.points) {
        const [p,q]=a.points,dx=q.x-p.x,dy=q.y-p.y,length=Math.hypot(dx,dy);
        if(length>16) {
          const sign=a.side===0?-1:1;
          const nx=-dy/length*sign*10,ny=dx/length*sign*10;
          const first={x:p.x+nx,y:p.y+ny},last={x:q.x+nx,y:q.y+ny};
          g.append(svgNode('path',{d:`M${p.x} ${p.y}L${first.x} ${first.y}M${q.x} ${q.y}L${last.x} ${last.y}`,'class':'model-dimension-extension'}));
          g.append(svgNode('line',{x1:first.x,y1:first.y,x2:last.x,y2:last.y,'class':'model-dimension-line','marker-start':'url(#model-dimension-arrow)','marker-end':'url(#model-dimension-arrow)'}));
          target={x:(first.x+last.x)/2,y:(first.y+last.y)/2};
        }
      }
      g.append(svgNode('path',{d:`M${target.x} ${target.y}L${edge+(a.side===0?9:-9)} ${a.y}L${edge} ${a.y}`,'class':'model-dimension-leader'}));
      g.append(svgNode('rect',{x,y:a.y-10,width:labelWidth,height:20,rx:4,'class':'model-dimension-label'}));
      g.append(svgNode('text',{x:x+labelWidth/2,y:a.y+3.5,'text-anchor':'middle','class':'model-dimension-text'},a.text));
      content.append(g);
    }
    this.svg.replaceChildren(content);
  }
}

export function fillMeasurementList(host:HTMLElement,measurements:ModelMeasurements,onSelect:(index:number)=>void) {
  const groups=new Map<string,HTMLElement>();
  const fragment=document.createDocumentFragment();
  measurements.items.forEach((item,index)=> {
    let list=groups.get(item.group);
    if(!list) {
      const group=document.createElement('section');group.className='model-dimension-group';
      const heading=document.createElement('h4');heading.textContent=item.group;
      list=document.createElement('ul');group.append(heading,list);fragment.append(group);groups.set(item.group,list);
    }
    const li=document.createElement('li'),button=document.createElement('button');button.type='button';
    button.className='model-dimension-row';button.dataset.measurement=String(index);button.setAttribute('aria-pressed','false');
    const ordinal=document.createElement('span');ordinal.className='measurement-ordinal';ordinal.textContent=String(index+1).padStart(2,'0');
    const label=document.createElement('span');label.textContent=item.label;
    const value=document.createElement('strong');value.textContent=measurementText(item)+' '+item.unit;
    button.append(ordinal,label,value);button.addEventListener('click',()=>onSelect(index));li.append(button);list.append(li);
  });
  host.replaceChildren(fragment);
}
