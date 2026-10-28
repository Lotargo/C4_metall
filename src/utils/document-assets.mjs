import path from 'node:path';
import { existsSync, statSync } from 'node:fs';
// Astro bundles this module for static generation, so import.meta.url no longer
// points into src/. Resolve public attachments from the selected project root.
const directory = path.resolve(process.cwd(), 'public/documents/implementation');

export function implementationAssetPath(relative) {
  const normalized = path.posix.normalize(relative);
  if (normalized.startsWith('../') || path.posix.isAbsolute(normalized)) return null;
  const file = path.resolve(directory, normalized);
  const within = path.relative(directory, file);
  if (within.startsWith('..') || path.isAbsolute(within) || !existsSync(file) || !statSync(file).isFile()) return null;
  return '/documents/implementation/' + normalized.split('/').map(encodeURIComponent).join('/');
}
