import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { attachmentKey, attachmentPreviewHtml } from '../utils/attachment-previews.mjs';

// View-only widgets: attachments never enter the saved document or undo history.
export function attachmentPreviewEntries(doc) {
  const seen = new Set();
  const entries = [];
  doc.descendants((node, position) => {
    if (node.type.name !== 'paragraph') return;
    node.descendants((child) => {
      for (const mark of child.marks) {
        if (mark.type.name !== 'link') continue;
        const key = attachmentKey(mark.attrs.originalHref || mark.attrs.href);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        let label = '';
        node.descendants((text) => {
          if (text.isText && text.marks.some((candidate) => candidate.eq(mark))) label += text.text;
        });
        entries.push({ key, label, position: position + node.nodeSize });
      }
    });
    return false;
  });
  return entries;
}

export function createAttachmentPreviewPlugin({ base = '' } = {}) {
  const pluginKey = new PluginKey('attachmentPreviews');
  const decorations = (doc) => DecorationSet.create(doc, attachmentPreviewEntries(doc).map(({ key, label, position }) =>
    Decoration.widget(position, (view) => {
      const container = view.dom.ownerDocument.createElement('div');
      container.innerHTML = attachmentPreviewHtml(key, label, base);
      return container.firstElementChild;
    }, { key: key + label, side: -1, stopEvent: () => true, ignoreSelection: true })));
  return new Plugin({
    key: pluginKey,
    state: { init: (_, state) => decorations(state.doc), apply: (transaction, previous) => transaction.docChanged ? decorations(transaction.doc) : previous },
    props: { decorations: (state) => pluginKey.getState(state) },
  });
}
