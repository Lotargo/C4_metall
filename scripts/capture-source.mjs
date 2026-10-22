import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root = 'F:/projects/metall-dev-2';
const dest = path.resolve('.evidence/source');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', env: {...process.env, GIT_OPTIONAL_LOCKS:'0'} }).trim();
const sha = b => createHash('sha256').update(b).digest('hex');
const files = [];
async function walk(rel) {
  for (const entry of await readdir(path.join(root, rel), {withFileTypes:true})) {
    if (entry.name === '__pycache__') continue;
    const name = path.posix.join(rel, entry.name);
    if (entry.isDirectory()) await walk(name);
    else if (/\.(py|ts|tsx|md|json|toml)$/.test(name)) {
      const bytes = await readFile(path.join(root,name));
      await mkdir(path.dirname(path.join(dest,name)),{recursive:true});
      await writeFile(path.join(dest,name),bytes);
      files.push({path:name,sha256:sha(bytes),bytes:bytes.length});
    }
  }
}
await mkdir('.evidence',{recursive:true});
const startedAt = new Date().toISOString();
const head = git('rev-parse','HEAD');
const status = git('status','--porcelain','-uall');
const capturedPaths = ['mvp/src/metall_mvp','mvp/instructions','mvp/skills','web/src','docs/agents'];
// Describe the captured scope itself; unrelated QA notes elsewhere do not change it.
const scopedStatus = git('status','--porcelain','-uall','--',...capturedPaths);
for (const dir of capturedPaths) await walk(dir);
let changed = [];
for(const f of files) if(sha(await readFile(path.join(root,f.path)))!==f.sha256) changed.push(f.path);
const workingTree = scopedStatus ? 'includes uncommitted files' : 'captured paths clean; equal to HEAD';
const manifest={root,head,branch:git('branch','--show-current'),startedAt,completedAt:new Date().toISOString(),workingTree,capturedPaths,files,changedDuringCapture:changed};
await writeFile('.evidence/manifest.json',JSON.stringify(manifest,null,2));
await writeFile('.evidence/git-status.txt',status+'\n');
console.log(JSON.stringify({head,files:files.length,changedDuringCapture:changed,startedAt}));
if(changed.length) process.exitCode=1;
