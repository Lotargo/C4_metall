import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { implementationSeed } from '../src/editor/seed.mjs';
import { createDocumentStore } from './document-store.mjs';

export async function implementationFiles(root) {
  const files = new Map();
  async function walk(directory, prefix = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relative = prefix + entry.name;
      if (entry.isDirectory()) await walk(path.join(directory, entry.name), relative + '/');
      else if (entry.isFile() && entry.name.endsWith('.md')) files.set(relative.slice(0, -3), path.join(directory, entry.name));
    }
  }
  await walk(path.join(root, 'documents/implementation'));
  return files;
}

export function createImplementationStores(root, { base = '', directory = path.join(root, '.local/implementation') } = {}) {
  const stores = new Map();
  return async (id) => {
    const files = await implementationFiles(root);
    // Resolve only catalogue entries. Never turn an arbitrary request into a path.
    if (!files.has(id)) return undefined;
    if (!stores.has(id)) {
      stores.set(id, createDocumentStore({
        directory: path.join(directory, createHash('sha256').update(id).digest('hex')),
        initial: async () => implementationSeed({
          id, markdown: await readFile(files.get(id), 'utf8'), documentIds: [...files.keys()], base,
        }),
      }));
    }
    return stores.get(id);
  };
}
