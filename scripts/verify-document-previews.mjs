import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import catalog from '../src/data/document-attachments.json' with { type: 'json' };

for (const [key, asset] of Object.entries(catalog.assets)) {
  const bytes = await readFile(new URL('../public/documents/implementation/' + key, import.meta.url));
  if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) {
    throw new Error(`Attachment preview is stale: ${key}. Rebuild with scripts/build-document-previews.py.`);
  }
}
console.log(`Verified ${Object.keys(catalog.assets).length} attachment preview source hashes`);
