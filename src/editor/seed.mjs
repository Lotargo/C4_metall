import { createHash } from 'node:crypto';
import path from 'node:path';
import { parseFrontmatter } from '@astrojs/markdown-remark';
import { importMarkdown } from './markdown.mjs';
import { validateDocument } from './schema.mjs';
import { implementationPath, implementationSourceId } from '../utils/document-path.mjs';
import { implementationAssetPath } from '../utils/document-assets.mjs';
import { headingSlug } from './heading.mjs';

export const contentTag = (document) => createHash('sha256').update(JSON.stringify(document)).digest('hex');

export function implementationSeed({ id, markdown, documentIds, base = '', title }) {
  const known = new Set(documentIds);
  const { content, frontmatter } = parseFrontmatter(markdown);
  const resolvedTitle = title || frontmatter.title || id.split('/').pop();
  const imported = importMarkdown(content, { resolveLink: (url) => {
    if (/^(?:https?:|mailto:|#)/i.test(url)) return url;
    if (url.startsWith('/')) return base + url;
    const [, pathname, suffix] = url.match(/^([^?#]*)(.*)$/);
    const relative = path.posix.normalize(path.posix.join(path.posix.dirname(id), decodeURIComponent(pathname)));
    if (!/\.md$/i.test(pathname)) {
      const asset = implementationAssetPath(relative);
      return asset ? base + asset + suffix : null;
    }
    const target = implementationSourceId(relative.replace(/\.md$/i, ''));
    return known.has(target) ? base + implementationPath(target) + suffix : null;
  } });
  if (!imported.content.some((node) => node.type === 'heading' && node.attrs.level === 1)) imported.content.unshift({
    type: 'heading', attrs: { level: 1, id: headingSlug(resolvedTitle) }, content: [{ type: 'text', text: resolvedTitle }],
  });
  const document = validateDocument(imported);
  return {
    format: 1, documentId: id, title: resolvedTitle,
    sourceFile: `documents/implementation/${id}.md`,
    sourceSha256: createHash('sha256').update(markdown).digest('hex'),
    originalMarkdown: markdown, savedAt: null, document, etag: contentTag(document),
  };
}
