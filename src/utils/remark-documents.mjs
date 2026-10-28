import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { visit } from 'unist-util-visit';
import { implementationPath, implementationSourceId } from './document-path.mjs';
import { implementationAssetPath } from './document-assets.mjs';
import { attachmentKey, attachmentPreviewHtml } from './attachment-previews.mjs';

const directory = fileURLToPath(new URL('../../documents/implementation/', import.meta.url));
const escapeHtml = (text) => text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const localReference = (node) => {
  node.data = {
    ...node.data,
    hName: 'span',
    hProperties: { ...node.data?.hProperties, href: null, title: `Источник не включён в этот раздел: ${node.url}` },
  };
};

// This plugin only changes the document collection, never other site Markdown.
export default function remarkDocuments() {
  return (tree, file) => {
    const relative = path.relative(directory, String(file.path || ''));
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return;
    const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');
    let diagram = 0;
    const definitions = new Map();
    visit(tree, 'definition', (node) => definitions.set(node.identifier, node));

    visit(tree, (node, index, parent) => {
      if (node.type === 'code' && node.lang === 'mermaid') {
        const label = `Схема ${++diagram}`;
        parent.children[index] = {
          type: 'html',
          value: `<figure class="document-diagram"><figcaption>${label}</figcaption><p class="diagram-status" role="status">Схема загружается. Текст доступен ниже.</p><div class="diagram-viewport" tabindex="0" role="region" aria-label="${label}"></div><details class="diagram-source" open><summary>Текст схемы</summary><pre tabindex="0"><code>${escapeHtml(node.value)}</code></pre></details></figure>`,
        };
      }

      // Resolve reference syntax without modifying the supplied Markdown file.
      if (node.type === 'linkReference' || node.type === 'imageReference') {
        const definition = definitions.get(node.identifier);
        if (!definition) return;
        node.type = node.type === 'linkReference' ? 'link' : 'image';
        node.url = definition.url;
        node.title = definition.title;
      }
      if (!['link', 'image'].includes(node.type) || !node.url) return;
      if (/^[a-z]:[\\/]/i.test(node.url)) {
        localReference(node);
        return;
      }
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(node.url)) return;
      if (node.url.startsWith('/')) {
        node.url = base + node.url;
        return;
      }
      if (node.type === 'image') return;
      const [, pathname, suffix] = node.url.match(/^([^?#]*)(.*)$/);
      if (!/\.md$/i.test(pathname)) {
        const relativeAsset = path.posix.join(path.posix.dirname(relative.split(path.sep).join('/')), decodeURIComponent(pathname));
        const asset = implementationAssetPath(relativeAsset);
        if (asset) { node.url = base + asset + suffix; return; }
        // Source files next to the original document are not public site assets.
        if (/\.[a-z\d]+$/i.test(pathname)) localReference(node);
        return;
      }
      const target = path.resolve(path.dirname(String(file.path)), decodeURIComponent(pathname));
      const targetRelative = path.relative(directory, target);
      const id = implementationSourceId(targetRelative.split(path.sep).join('/').replace(/\.md$/i, ''));
      if (targetRelative.startsWith('..') || path.isAbsolute(targetRelative) || !existsSync(path.join(directory, id + '.md'))) {
        localReference(node);
        return;
      }
      node.url = base + implementationPath(id) + suffix;
    });

    // Add read-only projections after the original paragraphs, once per file.
    const seenAttachments = new Set();
    const insertions = [];
    visit(tree, 'paragraph', (node, index, parent) => {
      const html = [];
      visit(node, 'link', (link) => {
        const key = attachmentKey(link.url);
        if (!key || seenAttachments.has(key)) return;
        seenAttachments.add(key);
        const label = [];
        visit(link, 'text', (text) => label.push(text.value));
        html.push(attachmentPreviewHtml(key, label.join(''), base));
      });
      if (html.length) insertions.push({ parent, index, html: html.join('') });
    });
    for (const { parent, index, html } of insertions.reverse()) parent.children.splice(index + 1, 0, { type: 'html', value: html });
  };
}
