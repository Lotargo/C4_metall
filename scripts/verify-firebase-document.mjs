import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { implementationFiles, createImplementationStores } from './implementation-store.mjs';
import { sha256, decodeCloudDocument } from '../src/editor/cloud-document.mjs';
import { preservedContent } from '../src/editor/markdown.mjs';

const config = JSON.parse(await readFile(new URL('../src/data/firebase.json', import.meta.url), 'utf8'));
const files = await implementationFiles(process.cwd());
const store = await createImplementationStores(process.cwd())([...files.keys()][0]);
const seed = await store.load();
const key = await sha256(seed.documentId);
const response = await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/implementationDocuments/${key}`, { signal: AbortSignal.timeout(20000) });
assert.equal(response.status, 200);
const raw = await response.json();
const data = Object.fromEntries(Object.entries(raw.fields).map(([key, value]) => [key, value.stringValue ?? value.timestampValue ?? (value.integerValue !== undefined ? Number(value.integerValue) : null)]));
const reopened = await decodeCloudDocument(data, seed);
assert.deepEqual(reopened.document, seed.document, 'Live cloud document must match the complete original after removing test edits');
assert.deepEqual(preservedContent(reopened.document), preservedContent(seed.document));
const protectedData = preservedContent(reopened.document);
const result = { projectId: config.projectId, contentBytes: new TextEncoder().encode(data.contentJson).byteLength,
  tables: protectedData.tables.length, mermaid: protectedData.mermaid.length, links: protectedData.links.length,
  math: protectedData.math.length, sourceUnchanged: true, completeDocumentMatches: true, etag: data.etag, updatedAt: data.updatedAt };
await mkdir('outputs/firebase-editor-2026-10-27', { recursive: true });
await writeFile('outputs/firebase-editor-2026-10-27/document-roundtrip.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
