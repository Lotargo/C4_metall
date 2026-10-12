import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { sourceSpecs, nodes, diagrams, steps, agents, storageGroups, artifactsList } from '../src/data/architecture.mjs';
const manifest=JSON.parse(await readFile('.evidence/manifest.json','utf8'));
const read=p=>readFile('.evidence/source/'+p,'utf8');
const hash=x=>createHash('sha256').update(x).digest('hex');
const sources={};
for(const [id,[path,start,end,title]] of Object.entries(sourceSpecs)) {
  const raw=await read(path);
  const lines=raw.split(/\r?\n/);
  if(start<1||end>lines.length||end<start) throw Error('Invalid source range '+id+' '+lines.length);
  const captured=manifest.files.find(f=>f.path===path);
  if(hash(Buffer.from(raw))!==captured.sha256) throw Error('Snapshot mismatch '+path);
  sources[id]={id,path,start,end,title,sha256:captured.sha256,basis:captured.basis||'working-tree snapshot',excerpt:lines.slice(start-1,end).join('\n')};
}
// Parse schema declarations as text. Never import the product or open its databases.
function block(text,start) {
  let depth=0, quote='',escaped=false;
  for(let i=start;i<text.length;i++) {
    const c=text[i];
    if(quote) {if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c===quote)quote='';continue;}
    if(c==='"'||c==="'") {quote=c;continue;}
    if(c==='(')depth++;
    if(c===')'&&--depth===0) return text.slice(start,i+1);
  }
  throw Error('Unbalanced schema block');
}
const schemaFiles=[
 'mvp/src/metall_mvp/db/repository.py',
 'mvp/src/metall_mvp/db/editable_nsi.py',
 'mvp/src/metall_mvp/db/tolerances.py',
 'mvp/src/metall_mvp/db/reference_catalog_parts/schema.py',
 'mvp/src/metall_mvp/workflows/route_jobs.py',
 'mvp/src/metall_mvp/workflows/route_review.py'
];
const tables={};
for(const path of schemaFiles) {
  const raw=await read(path);
  for(const match of raw.matchAll(/\bTable\(\s*["']([^"']+)["']/g)) {
    const content=block(raw,raw.indexOf('(',match.index));
    const fields=[];
    for(const col of content.matchAll(/Column\(\s*["']([^"']+)["']/g)) {
      const declaration=block(content,content.indexOf('(',col.index));
      const after=declaration.slice(declaration.indexOf(col[1])+col[1].length+1).replace(/^\s*,\s*/,'');
      const type=after.match(/^([A-Za-z]+(?:\([^)]*\))?)/)?.[1]||'';
      const primary=/primary_key\s*=\s*True/.test(declaration);
      fields.push({name:col[1],type,nullable:!primary&&!/nullable\s*=\s*False/.test(declaration),primary,foreign:declaration.match(/ForeignKey\(\s*["']([^"']+)/)?.[1]||null});
    }
    tables[match[1]]={name:match[1],path,line:raw.slice(0,match.index).split('\n').length,fields};
  }
}
const machinePath='mvp/src/metall_mvp/domain/machine_passports.py';
const machineSource=await read(machinePath);
const ddl = [...machineSource.matchAll(/db\.execute\(\s*((?:"[^"\n]*"\s*)+)\)/g)].map(m=>({sql:[...m[1].matchAll(/"([^"\n]*)"/g)].map(x=>x[1]).join(''),line:machineSource.slice(0,m.index).split('\n').length}));
for(const {sql,line} of ddl) {
 const name=sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
 if(!name)continue;
 const fields=sql.slice(sql.indexOf('(')+1,sql.lastIndexOf(')')).split(/,(?![^()]*\))/).map(f=>f.trim()).filter(f=>!/^FOREIGN|^UNIQUE/.test(f)).map(f=>({name:f.match(/^\w+/)?.[0],type:f.match(/^\w+\s+(\w+)/)?.[1],primary:/PRIMARY KEY/.test(f),nullable:!/NOT NULL|PRIMARY KEY/.test(f),foreign:f.match(/REFERENCES ([\w()]+)/)?.[1]||null}));
 tables[name]={name,path:machinePath,line,fields};
}
for(const path of ['splav-parser/internal/storage/sqlite.go','splav-parser/internal/storage/properties.go']) {
 const raw=await read(path);
 for(const m of raw.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)\s*\(([\s\S]*?)\n\);/g)) {
  const body=m[2],primary=body.match(/PRIMARY KEY\(([^)]*)\)/)?.[1].split(',').map(x=>x.trim())||[];
  const fields=body.split('\n').map(x=>x.trim().replace(/,$/,'')).filter(x=>/^[a-z_]+\s+(?:INTEGER|REAL|TEXT|BLOB)/.test(x)).map(f=>{const name=f.match(/^\w+/)[0],isPrimary=/PRIMARY KEY/.test(f)||primary.includes(name);return {name,type:f.match(/^\w+\s+(\w+)/)[1],primary:isPrimary,nullable:!/NOT NULL/.test(f)&&!isPrimary,foreign:f.match(/REFERENCES ([\w()]+)/)?.[1]||null};});
  tables[m[1]]={name:m[1],path,line:raw.slice(0,m.index).split('\n').length,fields};
 }
}
for(const g of storageGroups) for(const table of g.tables) if(!tables[table]) throw Error('Missing table '+table);
const inspected=[...new Set(Object.values(sources).map(s=>s.path))];
const audit={head:manifest.head,branch:manifest.branch,capturedAt:manifest.completedAt,timezone:'Asia/Yakutsk',workingTree:manifest.workingTree,supplementalSourceNote:manifest.supplementalSourceNote||null,changedDuringCapture:manifest.changedDuringCapture,filesInSnapshot:manifest.files.length,referencedFiles:inspected.length,sourceCount:Object.keys(sources).length,verification:'Source inspection only; no recognition or engineering acceptance performed',files:manifest.files.filter(f=>inspected.includes(f.path))};
const result={audit,sources,tables,nodes,diagrams,steps,agents,storageGroups,artifactsList};
await mkdir('src/data',{recursive:true});
await mkdir('public',{recursive:true});
await writeFile('src/data/evidence.json',JSON.stringify(result,null,2));
await writeFile('public/architecture.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({sources:Object.keys(sources).length,referencedFiles:inspected.length,tables:Object.keys(tables).length}));
