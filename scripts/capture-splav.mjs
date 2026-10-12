import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const manifest=JSON.parse(await readFile('.evidence/manifest.json','utf8'));
for(const file of ['splav-parser/internal/storage/sqlite.go','splav-parser/internal/storage/properties.go','splav-parser/cmd/splav-parser/main.go']) {
 const bytes=execFileSync('git',['show',manifest.head+':'+file],{cwd:manifest.root,env:{...process.env,GIT_OPTIONAL_LOCKS:'0'}});
 const current=await readFile(path.join(manifest.root,file));
 if(bytes.toString().replace(/\r\n/g,'\n')!==current.toString().replace(/\r\n/g,'\n'))throw Error('Committed Go source differs from working tree: '+file);
 await mkdir(path.dirname('.evidence/source/'+file),{recursive:true});
 await writeFile('.evidence/source/'+file,bytes);
 const record={path:file,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,basis:'committed HEAD '+manifest.head};
 const i=manifest.files.findIndex(f=>f.path===file);if(i<0)manifest.files.push(record);else manifest.files[i]=record;
}
manifest.supplementalSourceNote='Three Go files from the same captured HEAD; normalized contents verified equal to the working tree. Original Python/TypeScript snapshot unchanged.';
await writeFile('.evidence/manifest.json',JSON.stringify(manifest,null,2));
console.log('Three committed Splav sources captured; working tree matches.');
