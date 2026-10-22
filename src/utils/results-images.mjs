import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const publicRoot = resolve(process.cwd(), 'public');
const sizes = new Map();

export function resultImageSize(src) {
  if (!src.startsWith('/results/') || src.includes('..')) throw new Error(`Invalid result image: ${src}`);
  if (!sizes.has(src)) {
    const bytes = readFileSync(resolve(publicRoot, `.${src}`));
    if (bytes.length < 24 || bytes.toString('ascii', 1, 4) !== 'PNG' || bytes.toString('ascii', 12, 16) !== 'IHDR') {
      throw new Error(`Expected PNG result evidence: ${src}`);
    }
    sizes.set(src, { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) });
  }
  return sizes.get(src);
}
