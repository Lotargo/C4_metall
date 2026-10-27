import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { visit } from 'unist-util-visit';
import { implementationPath } from './document-path.mjs';

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
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(node.url)) return;
      if (node.url.startsWith('/')) {
        node.url = base + node.url;
        return;
      }
      if (node.type === 'image') return;
      const [, pathname, suffix] = node.url.match(/^([^?#]*)(.*)$/);
      if (!/\.md$/i.test(pathname)) {
        // Source files next to the original document are not public site assets.
        if (/\.[a-z\d]+$/i.test(pathname)) localReference(node);
        return;
      }
      const target = path.resolve(path.dirname(String(file.path)), decodeURIComponent(pathname));
      const targetRelative = path.relative(directory, target);
      if (targetRelative.startsWith('..') || path.isAbsolute(targetRelative) || !existsSync(target)) {
        localReference(node);
        return;
      }
      const id = targetRelative.split(path.sep).join('/').replace(/\.md$/i, '');
      node.url = base + implementationPath(id) + suffix;
    });
  };
}
