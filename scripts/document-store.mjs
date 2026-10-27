import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { validateDocument } from '../src/editor/schema.mjs';

const contentTag = (document) => createHash('sha256').update(JSON.stringify(document)).digest('hex');

export class DocumentChanged extends Error {}

export function createDocumentStore({ directory, initial }) {
  const currentPath = path.join(directory, 'current.json');
  let queue = Promise.resolve();
  async function load() {
    try {
      const value = JSON.parse(await readFile(currentPath, 'utf8'));
      const { revision: _legacyRevision, etag: _storedTag, ...snapshot } = value;
      const document = validateDocument(value.document);
      return { ...snapshot, document, etag: contentTag(document) };
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      return initial();
    }
  }
  async function saveUnlocked(document, baseEtag) {
    const current = await load();
    if (baseEtag !== current.etag) throw new DocumentChanged('Документ уже изменён в другом окне. Ваша правка сохранена локально.');
    const validated = validateDocument(document);
    const next = { ...current, savedAt: new Date().toISOString(), document: validated, etag: contentTag(validated) };
    await mkdir(directory, { recursive: true });
    // One current document, replaced atomically. No saved-version archive.
    const temporary = path.join(directory, `${randomUUID()}.tmp`);
    await writeFile(temporary, JSON.stringify(next));
    await rename(temporary, currentPath);
    return next;
  }
  return {
    load,
    save(document, baseEtag) {
      const result = queue.then(() => saveUnlocked(document, baseEtag));
      queue = result.catch(() => {});
      return result;
    },
  };
}
