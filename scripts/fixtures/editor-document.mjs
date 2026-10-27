import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { importMarkdown } from '../../src/editor/markdown.mjs';
import { validateDocument } from '../../src/editor/schema.mjs';
import { createDocumentStore } from '../document-store.mjs';

// Test-only rich content. Not imported by the app, Vite plugin or document catalogue.
export const sourceFile = 'documents/implementation/16-ПЛАН_ИНЖЕНЕРНЫХ_РАСЧЁТОВ_2026-10-27.md';
const formulas = '\n\n---\n\n## Контрольные формулы\n\nКонтрольная формула: $v = \\pi d n / 1000$.\n\n$$\nt = \\frac{L}{n \\cdot f}\n$$\n';
const contentTag = (document) => createHash('sha256').update(JSON.stringify(document)).digest('hex');

export async function initialTestDocument(root, base = '') {
  const original = await readFile(path.join(root, sourceFile), 'utf8');
  const document = validateDocument(importMarkdown(original + formulas, { resolveLink: (url) => {
    if (/^(?:https?:|mailto:|#)/i.test(url)) return url;
    if (url.startsWith('/')) return base + url;
    return null;
  } }));
  return {
    format: 1, sourceFile, sourceSha256: createHash('sha256').update(original).digest('hex'),
    originalMarkdown: original, savedAt: null, document, etag: contentTag(document),
  };
}

export function createTestStore(root, { directory, base = '' }) {
  return createDocumentStore({ directory, initial: () => initialTestDocument(root, base) });
}
