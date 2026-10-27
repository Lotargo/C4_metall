import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { headingSlug } from './heading.mjs';

// Import the Markdown AST, before the viewing pipeline rewrites links or diagrams.
// Unknown syntax fails visibly instead of disappearing during conversion.
export function importMarkdown(markdown, { resolveLink = (url) => url } = {}) {
  const tree = unified().use(remarkParse).use(remarkGfm).use(remarkMath).parse(markdown);
  const definitions = new Map();
  const slugs = new Map();
  const collect = (node) => {
    if (node.type === 'definition') definitions.set(node.identifier, node);
    node.children?.forEach(collect);
  };
  collect(tree);
  const text = (value, marks = []) => value ? [{ type: 'text', text: value, ...(marks.length ? { marks } : {}) }] : [];
  const metaAttrs = (value) => ({ source: value, anchor: value.match(/^<a\s+id=["']([^"']+)["']/i)?.[1] || null });
  const inline = (nodes = [], marks = []) => nodes.flatMap((node) => {
    switch (node.type) {
      case 'text': return text(node.value.replace(/\r?\n/g, ' '), marks);
      case 'image':
      case 'imageReference': {
        const image = node.type === 'imageReference' ? definitions.get(node.identifier) : node;
        if (!image) throw new Error(`Не найдено изображение: ${node.identifier}`);
        return [{ type: 'image', attrs: { src: image.url, alt: node.alt || '', title: image.title || null } }];
      }
      case 'inlineCode': return text(node.value, [...marks, { type: 'code' }]);
      case 'strong': return inline(node.children, [...marks, { type: 'bold' }]);
      case 'emphasis': return inline(node.children, [...marks, { type: 'italic' }]);
      case 'delete': return inline(node.children, [...marks, { type: 'strike' }]);
      case 'break': return [{ type: 'hardBreak' }];
      case 'inlineMath': return [{ type: 'mathInline', attrs: { latex: node.value } }];
      case 'html': return [{ type: 'sourceInline', attrs: metaAttrs(node.value) }];
      case 'link':
      case 'linkReference': {
        const link = node.type === 'linkReference' ? definitions.get(node.identifier) : node;
        if (!link) throw new Error(`Не найдено определение ссылки: ${node.identifier}`);
        return inline(node.children, [...marks, { type: 'link', attrs: {
          href: resolveLink(link.url), originalHref: link.url,
          title: link.title || (resolveLink(link.url) ? null : `Источник не включён в раздел: ${link.url}`),
          target: null, rel: null,
        } }]);
      }
      default: throw new Error(`Неподдерживаемый элемент Markdown: ${node.type}`);
    }
  });
  const paragraph = (content) => ({ type: 'paragraph', ...(content.length ? { content } : {}) });
  const block = (node) => {
    switch (node.type) {
      case 'root': {
        const content = node.children.filter((n) => n.type !== 'definition').map(block);
        return { type: 'doc', content: content.length ? content : [paragraph([])] };
      }
      case 'paragraph': return paragraph(inline(node.children));
      case 'heading': {
        const content = inline(node.children);
        const slug = headingSlug(content.map((n) => n.text || '').join(''));
        const duplicate = slugs.get(slug) || 0;
        slugs.set(slug, duplicate + 1);
        return { type: 'heading', attrs: { level: node.depth, id: slug + (duplicate ? `-${duplicate}` : '') }, content };
      }
      case 'blockquote': return { type: 'blockquote', content: node.children.map(block) };
      case 'list': {
        if (node.children.some((item) => typeof item.checked === 'boolean')) return {
          type: 'taskList', content: node.children.map((item) => ({
            type: 'taskItem', attrs: { checked: item.checked === true }, content: item.children.map(block),
          })),
        };
        return {
        type: node.ordered ? 'orderedList' : 'bulletList',
        ...(node.ordered ? { attrs: { start: node.start || 1 } } : {}), content: node.children.map(block),
        };
      }
      case 'listItem': return { type: 'listItem', content: node.children.map(block) };
      case 'thematicBreak': return { type: 'horizontalRule' };
      case 'code': return node.lang === 'mermaid'
        ? { type: 'mermaidBlock', attrs: { source: node.value } }
        : { type: 'codeBlock', attrs: { language: node.lang || null }, ...(node.value ? { content: text(node.value) } : {}) };
      case 'math': return { type: 'mathBlock', attrs: { latex: node.value } };
      case 'html': return { type: 'sourceBlock', attrs: metaAttrs(node.value) };
      case 'table': return { type: 'table', content: node.children.map((row, index) => ({
        type: 'tableRow', content: row.children.map((cell, column) => ({
          type: index === 0 ? 'tableHeader' : 'tableCell', attrs: { textAlign: node.align[column] || null },
          content: [paragraph(inline(cell.children))],
        })),
      })) };
      default: throw new Error(`Неподдерживаемый элемент Markdown: ${node.type}`);
    }
  };
  return block(tree);
}

// Used by preservation tests: compare actual content and attributes, not counts alone.
export function preservedContent(document) {
  const result = { tables: [], math: [], mermaid: [], links: [], metadata: [], code: [] };
  const visit = (node) => {
    if (node.type === 'table') result.tables.push(node);
    if (node.type === 'mathInline' || node.type === 'mathBlock') result.math.push({ type: node.type, latex: node.attrs.latex });
    if (node.type === 'mermaidBlock') result.mermaid.push(node.attrs.source);
    if (node.type === 'sourceInline' || node.type === 'sourceBlock') result.metadata.push(node.attrs);
    if (node.type === 'codeBlock') result.code.push(node);
    for (const mark of node.marks || []) if (mark.type === 'link') result.links.push({ text: node.text, ...mark.attrs });
    node.content?.forEach(visit);
  };
  visit(document);
  return result;
}
