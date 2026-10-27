import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { sha256 } from '../src/editor/cloud-document.mjs';
import { implementationFiles, createImplementationStores } from './implementation-store.mjs';

const config = JSON.parse(await readFile(new URL('../src/data/firebase.json', import.meta.url), 'utf8'));
const files = await implementationFiles(process.cwd());
const stores = createImplementationStores(process.cwd());
const store = await stores([...files.keys()][0]);
const seed = await store.load();
const key = await sha256(seed.documentId);
const endpoint = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents`;
const request = async (path, init) => {
  const response = await fetch(endpoint + path, { ...init, signal: AbortSignal.timeout(20000) });
  const body = await response.json();
  return { status: response.status, code: body.error?.status || null, body };
};
const read = await request(`/implementationDocuments/${key}`);
assert.ok([200, 404].includes(read.status), `Public read: ${read.status} ${read.code}`);
const results = { projectId: config.projectId, publicRead: read.status };
for (const [name, route, init] of [
  ['publicListDenied', '/implementationDocuments'],
  ['membershipReadDenied', '/planEditors/unauthenticated-check'],
  ['publicWriteDenied', `/implementationDocuments/${'0'.repeat(64)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { format: { integerValue: '1' } } }) }],
  ['selfGrantDenied', '/planEditors/unauthenticated-check', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { enabled: { booleanValue: true } } }) }],
]) {
  const result = await request(route, init);
  assert.equal(result.status, 403, `${name}: ${result.status} ${result.code}`);
  results[name] = true;
}
await mkdir('outputs/firebase-editor-2026-10-27', { recursive: true });
await writeFile('outputs/firebase-editor-2026-10-27/public-access.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results));
