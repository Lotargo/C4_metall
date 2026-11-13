import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const publicRoot = resolve(process.cwd(), 'public');
const sizes = new Map();

export function resultImageSize(src) {
  if (!src.startsWith('/results/') || src.includes('..')) throw new Error(`Invalid result image: ${src}`);
  if (!sizes.has(src)) {
    const bytes = readFileSync(resolve(publicRoot, `.${src}`));
    if (bytes.toString('ascii', 1, 4) === 'PNG' && bytes.toString('ascii', 12, 16) === 'IHDR') {
      sizes.set(src, { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) });
    } else if (bytes[0] === 0xff && bytes[1] === 0xd8) {
      let offset = 2;
      while (offset < bytes.length) {
        if (bytes[offset] !== 0xff) break;
        const marker = bytes[offset + 1];
        const length = bytes.readUInt16BE(offset + 2);
        if ([0xc0, 0xc1, 0xc2].includes(marker)) {
          sizes.set(src, { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) });
          break;
        }
        offset += length + 2;
      }
    }
    if (!sizes.has(src)) throw new Error(`Unsupported result evidence image: ${src}`);
  }
  return sizes.get(src);
}
