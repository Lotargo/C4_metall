import { validateDocument } from './schema.mjs';

export const MAX_CLOUD_CONTENT_BYTES = 900_000;
export class DocumentConflict extends Error {}
export class DocumentAccessDenied extends Error {}

export async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

// A saved plan is shared by the root site and GitHub Pages. Store root-relative
// links, and apply the current site's base only when opening it in the editor.
export function documentForBase(document, base = '', store = false) {
  const result = structuredClone(document);
  const prefix = base.replace(/\/$/, '');
  const visit = (node) => {
    const link = (attrs, key) => {
      const value = attrs?.[key];
      if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || !prefix) return;
      attrs[key] = store
        ? value === prefix ? '/' : value.startsWith(prefix + '/') ? value.slice(prefix.length) : value
        : value === prefix || value.startsWith(prefix + '/') ? value : prefix + value;
    };
    node.marks?.filter((mark) => mark.type === 'link').forEach((mark) => link(mark.attrs, 'href'));
    // Image source attributes remain source-relative: imageView resolves them.
    node.content?.forEach(visit);
  };
  visit(result);
  return result;
}

export async function encodeCloudDocument(document, base = '') {
  const contentJson = JSON.stringify(documentForBase(validateDocument(document), base, true));
  if (new TextEncoder().encode(contentJson).byteLength > MAX_CLOUD_CONTENT_BYTES) throw new RangeError('document-too-large');
  return { contentJson, etag: await sha256(contentJson) };
}

export async function decodeCloudDocument(data, seed, base = '') {
  if (data.format !== 1 || data.documentId !== seed.documentId || typeof data.contentJson !== 'string'
    || new TextEncoder().encode(data.contentJson).byteLength > MAX_CLOUD_CONTENT_BYTES
    || await sha256(data.contentJson) !== data.etag || !/^[a-f0-9]{64}$/.test(data.sourceSha256)) throw new Error('invalid-cloud-document');
  const document = documentForBase(validateDocument(JSON.parse(data.contentJson)), base);
  return { ...seed, document, etag: data.etag, sourceSha256: data.sourceSha256,
    savedAt: data.updatedAt?.toDate?.().toISOString() || null };
}

export function assertCurrentDocument(current, expectedEtag, seed) {
  if ((current ? current.etag : seed.etag) !== expectedEtag) throw new DocumentConflict('document-changed');
}
