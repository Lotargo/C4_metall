import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { parseFrontmatter } from '@astrojs/markdown-remark';

const root = process.cwd();
const dist = path.join(root,'dist');
const base = (process.env.BASE_PATH || '').replace(/\/$/,'');
const read = async file => readFile(file,'utf8');
async function files(directory) {
  const entries=await readdir(directory,{withFileTypes:true});
  return (await Promise.all(entries.map(entry=>entry.isDirectory()?files(path.join(directory,entry.name)):[path.join(directory,entry.name)]))).flat();
}
const icons=JSON.parse(await read(path.join(root,'src/data/metall-icons.json')));
const overview=await files(path.join(root,'content/public/overview'));
const ids=new Set();
for(const file of overview) {
  const {frontmatter:d}=parseFrontmatter(await read(file));
  assert(!ids.has(d.id),'Duplicate overview section');ids.add(d.id);
  assert(d.id&&d.nav&&d.title&&d.summary&&d.updated,'Incomplete overview section');
  assert(!Number.isNaN(Date.parse(d.updated)),'Invalid review date');
  for(const icon of [d.icon,...(d.cards||[]).map(c=>c.icon),...(d.roles||[]).map(r=>r.icon)]) assert(icons[icon],`Unknown icon in ${path.basename(file)}`);
}
const modelExamples=JSON.parse(await read(path.join(root,'content/public/models/examples.json')));
assert(modelExamples.length>=2,'At least two model examples must be available');
const allowedFace=new Set(['vertices','indices','surface','radius','minor_radius','bounds_mm','normal','origin','axis','area_mm2']);
const allowedModel=new Set(['id','title','label','summary','whole','section','size','volume','limitations','measurements']);
const allowedMeasurement=new Set(['group','label','value','prefix','suffix','unit','anchor','points']);
const point=p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite);
for(const model of modelExamples) {
  for(const key of Object.keys(model)) assert(allowedModel.has(key),'Unexpected model metadata: '+key);
  for(const key of ['title','label','summary','size','volume','limitations']) assert(model[key],`Incomplete model description: ${key}`);
  const measurementData=JSON.parse(await read(path.join(root,'public',model.measurements)));
  assert.deepEqual(Object.keys(measurementData).sort(),['items','note']);
  assert(measurementData.items.length>0,'Model measurements are required');
  for(const item of measurementData.items) {
    for(const key of Object.keys(item)) assert(allowedMeasurement.has(key),'Non-display measurement metadata');
    assert(item.group&&item.label&&Number.isFinite(item.value)&&point(item.anchor),'Invalid model measurement');
    if(item.points)assert(item.points.length===2&&item.points.every(point),'Invalid dimension endpoints');
  }
  for(const url of [model.whole,model.section]) {
    const data=JSON.parse(await read(path.join(root,'public',url)));
    assert.deepEqual(Object.keys(data).sort(),['bounds','edges','faces']);
    assert.equal(data.bounds.length,6);assert(data.bounds.every(Number.isFinite));
    assert(data.faces.length>0&&data.edges.length>0,'Empty display geometry');
    for(const face of data.faces) {
      for(const key of Object.keys(face)) assert(allowedFace.has(key),'Non-display metadata in a model');
      assert.equal(face.vertices.length%3,0);assert.equal(face.indices.length%3,0);
      assert(face.vertices.every(Number.isFinite));
      assert(face.indices.every(v=>Number.isInteger(v)&&v>=0&&v<face.vertices.length/3));
    }
  }
}
for(const file of await files(path.join(root,'public/models'))) assert(file.endsWith('.json'),'Only 3D display data is allowed: original drawings must stay private');
const resultFiles=(await files(path.join(root,'content/public/results'))).filter(f=>f.endsWith('.json'));
assert(resultFiles.length>=3,'Keep at least three current drawing examples');
for(const file of resultFiles) {
  const result=JSON.parse(await read(file));
  const pictures=result.sections.flatMap(s=>s.evidence||[]);
  assert.equal(pictures.length,3,'Keep one screenshot for each stage: passport, route, estimate');
  assert.equal(new Set(pictures.map(p=>p.src)).size,3,'Stage screenshots must be distinct');
  for(const stage of ['passport','route','estimate']) {
    const sections=result.sections.filter(s=>s.id===stage);
    assert.equal(sections.length,1,`Missing or duplicate result stage: ${stage}`);
    assert.equal(sections[0].evidence?.length,1,`Keep one complete screenshot of ${stage}`);
    const picture=sections[0].evidence[0];
    assert(picture.src.startsWith('/results/current/')&&!picture.src.includes('..'));
    assert(picture.alt&&picture.caption,'Describe the stage and provenance');
    await stat(path.join(root,'public',picture.src));
  }
}
const built=await files(dist);
const forbidden=[
  /\b[A-Z]:[\\/](?:projects|users|работа)[\\/]/i,
  /metall-dev-2|metall_mvp|mvp[\\/]src|mvp[\\/]instructions|splav-parser|stock-selection|machining-calc|cad-metall/i,
  /(?:\.evidence|03-reports|01-current)[\\/]/i,
  /\b(?:ROUTE_PLANNER|TIME_ESTIMATION|BLANK_PREPARATION|READING_V2_AGENT_PROMPT|compact_round\.py|dev_stack\.py)\b/,
  /(?:href|src)=["'][^"']*(?:\/it\/|architecture\.json|\/instructions\/)/i,
  /\/api\/(?:parts|analyze|upload)|\/v1\/(?:operations|calculate)/,
  /(?:sourceFile|originalMarkdown)\s*["']?\s*:/,
];
let assets=0,pages=0,links=0;
const html=new Map();
for(const file of built) {
  const relative=path.relative(dist,file).split(path.sep).join('/');
  assert(!/^(?:it\/|instructions\/|architecture\.json$|cycle\/|screenshots\/|(?:voksa|plan)\/(?!index\.html$)|documents\/)/.test(relative),'Retired private asset in output: '+relative);
  assert(!/\.(?:map|py|md|sql|sqlite|db|xlsx|gz|step)$/i.test(relative),'Non-public artifact in output: '+relative);
  if(!/\.(?:html|js|css|json|svg|txt)$/i.test(file)) {assets++;continue;}
  const text=await read(file);
  for(const pattern of forbidden) assert(!pattern.test(text),'Private information in output: '+relative+' ('+pattern.source+')');
  if(file.endsWith('.html')) {html.set(file,text);pages++;}else assets++;
}
const exists=async file=>{try{return await stat(file);}catch{return undefined;}};
for(const [file,text] of html) {
  for(const match of text.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    let url=match[1].replaceAll('&amp;','&');
    if(!url||/^(?:[a-z]+:|\/\/)/i.test(url))continue;
    const [pathname,hash]=url.split('#');
    let target=file;
    if(pathname) {
      assert(!base||pathname===base||pathname.startsWith(base+'/'),'Wrong base prefix: '+url);
      const local=base&&pathname.startsWith(base)?pathname.slice(base.length):pathname;
      target=path.join(dist,decodeURIComponent(local.split('?')[0]));
      const info=await exists(target);
      assert(info,'Broken public asset or page: '+url);
      if(info.isDirectory()) target=path.join(target,'index.html');
      assert(await exists(target),'Missing index: '+url);
    }
    if(hash&&html.has(target)) {
      const id=decodeURIComponent(hash);
      // Empty viewer links are filled when the dialog is opened.
      assert(html.get(target).includes(`id="${id}"`),'Broken section link: '+url);
    }
    links++;
  }
  for(const match of text.matchAll(/<script[^>]*id="editor-seed"[^>]*>([\s\S]*?)<\/script>/g)) {
    const seed=JSON.parse(match[1]);
    assert(!('originalMarkdown' in seed)&&!('sourceFile' in seed),'Private seed metadata');
    assert(seed.storageId!==seed.documentId,'Reader plans must use a new isolated shared draft');
  }
  for(const match of text.matchAll(/<script[^>]*data-model-data[^>]*>([\s\S]*?)<\/script>/g)) {
    const examples=JSON.parse(match[1]);
    for(const example of examples) {
      const source=modelExamples.find(model=>model.id===example.id);
      assert(source,'Unknown browser model');
      for(const key of ['whole','section','measurements'])assert.equal(example[key],base+source[key],'Wrong model asset base prefix');
      assert(!('drawing' in example),'Original drawings must not enter browser metadata');
    }
  }
}
console.log(JSON.stringify({status:'passed',sections:ids.size,drawings:resultFiles.length,models:modelExamples.length,pages,assets,links,base:base||'/'}));
