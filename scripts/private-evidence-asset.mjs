import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Retired evidence is retained locally and must never be copied back to public/.
export async function readEvidenceAsset(relative) {
  const root = process.cwd();
  const candidates = [path.join(root,'public',relative),path.join(root,'outputs/content-refresh-2026-11-13/retired/public',relative)];
  for(const file of candidates) {
    try { return await readFile(file); } catch(error) { if(error.code!=='ENOENT') throw error; }
  }
  throw new Error('Missing local evidence asset: '+relative);
}
