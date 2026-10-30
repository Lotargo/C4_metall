import { Node, Extension, mergeAttributes, getSchema } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { TableKit } from '@tiptap/extension-table';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import { RecentHistory } from './history.mjs';
import { TaskItem, TaskList } from '@tiptap/extension-list';

const sourceNode = (inline) => Node.create({
  name: inline ? 'sourceInline' : 'sourceBlock',
  group: inline ? 'inline' : 'block', inline, atom: true, selectable: false,
  addAttributes: () => ({ source: { default: '' }, anchor: { default: null } }),
  parseHTML: () => [{ tag: `[data-source-node="${inline ? 'inline' : 'block'}"]`, getAttrs: (el) => ({ source: el.getAttribute('data-source') || '', anchor: el.id || null }) }],
  renderHTML: ({ node }) => [inline ? 'span' : 'div', {
    'data-source-node': inline ? 'inline' : 'block', 'data-source': node.attrs.source,
    ...(node.attrs.anchor ? { id: node.attrs.anchor, class: 'editor-source-anchor' } : { hidden: '' }),
    contenteditable: 'false', 'aria-hidden': 'true',
  }],
});

const formulaNode = (inline, views) => Node.create({
  name: inline ? 'mathInline' : 'mathBlock', group: inline ? 'inline' : 'block', inline, atom: true,
  addAttributes: () => ({ latex: { default: '' } }),
  parseHTML: () => [{ tag: `[data-math="${inline ? 'inline' : 'block'}"]`, getAttrs: (el) => ({ latex: el.getAttribute('data-latex') }) }],
  renderHTML: ({ node }) => [inline ? 'span' : 'div', {
    'data-math': inline ? 'inline' : 'block', 'data-latex': node.attrs.latex,
    class: inline ? 'editor-math-inline' : 'editor-math-block',
  }, node.attrs.latex],
  ...(views?.math ? { addNodeView() { return ({ node }) => views.math(node, inline); } } : {}),
});

export function editorExtensions(views) {
  return [
    StarterKit.configure({ undoRedo: false, link: { openOnClick: false, autolink: false, HTMLAttributes: { target: null, rel: null } } }),
    RecentHistory,
    TaskList, TaskItem.configure({ nested: true }),
    TableKit.configure({ table: { resizable: false } }),
    Highlight.configure({ multicolor: true }), TextStyle, Color,
    Extension.create({
      name: 'sourceAttributes',
      addGlobalAttributes: () => [
        { types: ['heading', 'paragraph'], attributes: { id: { default: null, keepOnSplit: false } } },
        { types: ['link'], attributes: { originalHref: {
          default: null, parseHTML: (el) => el.getAttribute('data-original-href'),
          renderHTML: (attrs) => ({
            ...(attrs.originalHref ? { 'data-original-href': attrs.originalHref } : {}),
            ...(/\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i.test(attrs.href || attrs.originalHref || '')
              ? { tabindex: '0', 'aria-haspopup': 'dialog' } : {}),
          }),
        } } },
        { types: ['tableCell', 'tableHeader'], attributes: { textAlign: {
          default: null, parseHTML: (el) => el.style.textAlign || null,
          renderHTML: (attrs) => attrs.textAlign ? { style: `text-align: ${attrs.textAlign}` } : {},
        } } },
      ],
    }),
    sourceNode(false), sourceNode(true), formulaNode(false, views), formulaNode(true, views),
    Node.create({
      name: 'image', group: 'inline', inline: true, atom: true, draggable: true,
      addAttributes: () => ({ src: { default: '' }, alt: { default: '' }, title: { default: null } }),
      parseHTML: () => [{ tag: 'img[src]' }],
      renderHTML: ({ HTMLAttributes }) => ['img', HTMLAttributes],
      ...(views?.image ? { addNodeView() { return ({ node }) => views.image(node); } } : {}),
    }),
    Node.create({
      name: 'mermaidBlock', group: 'block', atom: true,
      addAttributes: () => ({ source: { default: '' } }),
      parseHTML: () => [{ tag: 'figure[data-mermaid]', getAttrs: (el) => ({ source: el.getAttribute('data-mermaid') }) }],
      renderHTML: ({ node, HTMLAttributes }) => ['figure', mergeAttributes(HTMLAttributes, { 'data-mermaid': node.attrs.source }), ['figcaption', {}, 'Схема']],
      ...(views?.mermaid ? { addNodeView() { return ({ node }) => views.mermaid(node); } } : {}),
    }),
  ];
}

export function validateDocument(json) {
  const document = getSchema(editorExtensions()).nodeFromJSON(json);
  document.check();
  return JSON.parse(JSON.stringify(document.toJSON()));
}
