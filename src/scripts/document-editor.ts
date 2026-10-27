import { Editor, type JSONContent } from '@tiptap/core';
import katex from 'katex';
import { editorExtensions } from '../editor/schema.mjs';
import { headingSlug } from '../editor/heading.mjs';
import { sitePath } from '../utils/site-path.mjs';
import { EditorState } from '@tiptap/pm/state';
import firebaseConfig from '../data/firebase.json';
import { createFirebaseStore } from '../editor/firebase-store.mjs';
import { DocumentConflict, DocumentAccessDenied } from '../editor/cloud-document.mjs';

type Snapshot = { documentId: string; title: string; imageAssets?: Record<string, string>; document: JSONContent; etag: string; sourceSha256: string; savedAt: string | null };
type Draft = { document: JSONContent; etag?: string; sourceSha256: string };
const host = document.querySelector<HTMLElement>('#editor')!;
const status = document.querySelector<HTMLElement>('[data-editor-status]')!;
const undoButton = document.querySelector<HTMLButtonElement>('[data-editor-undo]')!;
const redoButton = document.querySelector<HTMLButtonElement>('[data-editor-redo]')!;
const menu = document.querySelector<HTMLElement>('#format-menu')!;
const recovery = document.querySelector<HTMLElement>('[data-editor-recovery]')!;
const toc = document.querySelector<HTMLElement>('[data-editor-toc]')!;
const seed: Snapshot = JSON.parse(document.querySelector('#editor-seed')!.textContent!);
const endpoint = sitePath('/api/implementation/document') + '?id=' + encodeURIComponent(seed.documentId);
let draftKey = `pp-implementation-editor-v1:${sitePath('/')}:${seed.documentId}`;
let cloud: Awaited<ReturnType<typeof createFirebaseStore>> | undefined;
let canEdit = false;
let loaded = false;
let pendingRemote: Snapshot | undefined;
let snapshot = seed;
let sharedAvailable = true;
let dirty = false;
let blocked = false;
let timer: ReturnType<typeof setTimeout>;
let saving: Promise<void> | undefined;
let retryDelay = 1500;
let sequence = 0;
let editor: Editor;
let diagramId = 0;
let diagramQueue = Promise.resolve();
const diagramRenders = new Set<() => void>();

function showStatus(text: string, error = false) {
  status.textContent = text;
  status.dataset.state = error ? 'error' : 'normal';
}
function rememberDraft() {
  try {
    localStorage.setItem(draftKey, JSON.stringify({ document: editor.getJSON(), etag: snapshot.etag, sourceSha256: snapshot.sourceSha256 }));
    return true;
  } catch { showStatus('Не удалось создать аварийную копию. Ожидается автосохранение.', true); }
  return false;
}
function forgetDraft() { try { localStorage.removeItem(draftKey); } catch {} }
function readDraft(): Draft | undefined { try { return JSON.parse(localStorage.getItem(draftKey) || 'null') || undefined; } catch { return undefined; } }
function showConflict(message: string) {
  blocked = true;
  recovery.hidden = false;
  recovery.querySelector('[data-editor-recovery-message]')!.textContent = message;
  showStatus('Документ изменён в другом окне. Ваши правки в браузере.', true);
  editor?.setEditable(false, false);
  updateHistoryButtons();
}

async function save() {
  clearTimeout(timer);
  if (saving) return saving;
  if (!dirty || blocked || !canEdit || (cloud && !loaded)) return;
  if (!sharedAvailable) {
    if (rememberDraft()) { dirty = false; showStatus('Сохранено в этом браузере'); }
    return;
  }
  const submittedSequence = sequence;
  const submittedBaseEtag = snapshot.etag;
  const submittedBaseSavedAt = snapshot.savedAt;
  const submitted = editor.getJSON();
  showStatus('Сохраняется…');
  saving = (async () => {
    let successful = false;
    let retryAllowed = true;
    try {
      let result;
      if (cloud) result = await cloud.save(submitted, snapshot.etag, snapshot.sourceSha256);
      else {
        const response = await fetch(endpoint, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ document: submitted, baseEtag: snapshot.etag }),
        });
        if (response.status === 409) throw new DocumentConflict('document-changed');
        if (!response.ok) throw new Error('save');
        result = await response.json();
      }
      snapshot = { ...snapshot, ...result, document: submitted };
      dirty = submittedSequence !== sequence;
      successful = true;
      retryDelay = 1500;
      if (!dirty) { forgetDraft(); recovery.hidden = true; showStatus('Сохранено'); }
      else rememberDraft();
    } catch (error) {
      rememberDraft();
      if (error instanceof DocumentConflict) showConflict('В другом окне документ уже изменён. Скачайте свою копию перед открытием сохранённого документа.');
      else if (error instanceof RangeError) {
        retryAllowed = false;
        recovery.hidden = false;
        recovery.querySelector('[data-editor-recovery-message]')!.textContent = 'Документ превышает размер для общего хранения. Скачайте свою копию или сократите документ.';
        showStatus('Документ слишком большой. Правки остаются в браузере.', true);
      } else if (error instanceof DocumentAccessDenied || (error as { code?: string })?.code === 'permission-denied') {
        blocked = true;
        editor.setEditable(false, false);
        showStatus('Нет права на сохранение. Ваши правки остаются в браузере.', true);
        recovery.hidden = false;
        recovery.querySelector('[data-editor-recovery-message]')!.textContent = 'Доступ к редактированию изменился. Скачайте свою копию перед обновлением страницы.';
        updateHistoryButtons();
      } else showStatus('Нет связи. Правки в браузере; сохранение повторится автоматически.', true);
    } finally {
      saving = undefined;
      if (pendingRemote) {
        const remote = pendingRemote; pendingRemote = undefined;
        if (remote.etag !== submittedBaseEtag || remote.savedAt !== submittedBaseSavedAt) receiveRemote(remote);
      }
      if (dirty && !blocked && canEdit && retryAllowed) {
        timer = setTimeout(() => void save(), successful ? 500 : retryDelay);
        if (!successful) retryDelay = Math.min(30000, retryDelay * 2);
      }
    }
  })();
  return saving;
}

function updateToc() {
  const fragment = document.createDocumentFragment();
  const used = new Set<string>();
  let transaction = editor.state.tr;
  editor.state.doc.descendants((node, position) => {
    if (node.type.name !== 'heading') return;
    let id = node.attrs.id as string;
    if (!id || used.has(id)) {
      const base = headingSlug(node.textContent);
      id = base;
      let duplicate = 1;
      while (used.has(id)) id = `${base}-${duplicate++}`;
      transaction = transaction.setNodeMarkup(position, undefined, { ...node.attrs, id }).setMeta('addToHistory', false);
    }
    used.add(id);
    if (node.attrs.level !== 2 && node.attrs.level !== 3) return;
    const item = document.createElement('li');
    if (node.attrs.level === 3) item.className = 'toc-subheading';
    const link = document.createElement('a');
    link.href = `#${id}`;
    link.dataset.documentToc = id;
    link.textContent = node.textContent;
    item.append(link);
    fragment.append(item);
  });
  toc.replaceChildren(fragment);
  window.dispatchEvent(new Event('documentcontentchange'));
  if (transaction.docChanged) editor.view.dispatch(transaction);
}

function mathView(node: { attrs: { latex: string } }, inline: boolean) {
  const dom = document.createElement(inline ? 'span' : 'div');
  dom.className = inline ? 'editor-math-inline' : 'editor-math-block';
  dom.dataset.math = inline ? 'inline' : 'block';
  dom.contentEditable = 'false';
  dom.innerHTML = katex.renderToString(node.attrs.latex, { displayMode: !inline, throwOnError: false, trust: false, output: 'htmlAndMathml' });
  return { dom, ignoreMutation: () => true };
}
function imageView(node: { attrs: { src: string; alt: string; title?: string } }) {
  const dom = document.createElement('img');
  const src = node.attrs.src;
  const relative = decodeURIComponent(new URL(src, `https://documents.invalid/${seed.documentId}.md`).pathname.slice(1));
  dom.src = seed.imageAssets?.[relative] || (src.startsWith('/') ? sitePath(src) : src);
  dom.alt = node.attrs.alt;
  if (node.attrs.title) dom.title = node.attrs.title;
  return { dom };
}
function mermaidView(node: { attrs: { source: string } }) {
  const dom = document.createElement('figure');
  dom.className = 'editor-mermaid';
  dom.contentEditable = 'false';
  const caption = document.createElement('figcaption');
  caption.textContent = 'Схема';
  const viewport = document.createElement('div');
  viewport.textContent = 'Схема загружается…';
  viewport.tabIndex = 0;
  viewport.setAttribute('aria-label', 'Схема плана');
  dom.append(caption, viewport);
  let active = true;
  const render = () => {
    diagramQueue = diagramQueue.then(async () => {
      if (!active) return;
      try {
        const { default: mermaid } = await import('mermaid');
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', suppressErrorRendering: true,
          theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default', fontFamily: 'IBM Plex Sans, Arial, sans-serif' });
        const { svg } = await mermaid.render(`editor-diagram-${++diagramId}`, node.attrs.source);
        if (!active) return;
        viewport.innerHTML = svg;
        const diagram = viewport.querySelector('svg')!;
        diagram.style.width = `${diagram.viewBox.baseVal.width}px`;
        dom.dataset.rendered = 'true';
      } catch { if (active) viewport.textContent = 'Не удалось отобразить схему. Её исходник сохранён в документе.'; }
    });
  };
  diagramRenders.add(render);
  render();
  return { dom, ignoreMutation: () => true, destroy: () => { active = false; diagramRenders.delete(render); } };
}
window.addEventListener('themechange', () => diagramRenders.forEach((render) => render()));

let selection: { from: number; to: number } | undefined;
function closeMenu(focus = false) {
  menu.hidden = true;
  if (focus) editor.commands.focus();
}
function openMenu(x?: number, y?: number, keyboard = false) {
  if (!editor.isEditable) return;
  const current = editor.state.selection;
  selection = { from: current.from, to: current.to };
  menu.querySelectorAll<HTMLButtonElement>('[data-command]').forEach((button) => {
    const command = button.dataset.command;
    if (button.hasAttribute('aria-pressed')) button.setAttribute('aria-pressed', String(command === 'h2' || command === 'h3'
      ? editor.isActive('heading', { level: Number(command[1]) }) : editor.isActive(command!)));
  });
  menu.hidden = false;
  const point = editor.view.coordsAtPos(current.from);
  menu.style.left = `${Math.max(12, Math.min(x ?? point.left, innerWidth - menu.offsetWidth - 12))}px`;
  menu.style.top = `${Math.max(12, Math.min(y ?? point.bottom + 6, innerHeight - menu.offsetHeight - 12))}px`;
  if (keyboard) menu.querySelector<HTMLButtonElement>('button')!.focus({ preventScroll: true });
}
menu.addEventListener('pointerdown', (event) => event.preventDefault());
menu.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!button || !selection) return;
  const chain = editor.chain().focus().setTextSelection(selection);
  const command = button.dataset.command;
  if (button.dataset.highlight) chain.setHighlight({ color: button.dataset.highlight }).run();
  else if (button.dataset.color) chain.setColor(button.dataset.color).run();
  else if (command === 'bold') chain.toggleBold().run();
  else if (command === 'italic') chain.toggleItalic().run();
  else if (command === 'underline') chain.toggleUnderline().run();
  else if (command === 'strike') chain.toggleStrike().run();
  else if (command === 'paragraph') chain.setParagraph().run();
  else if (command === 'h2' || command === 'h3') chain.setHeading({ level: command === 'h2' ? 2 : 3 }).run();
  else if (command === 'unhighlight') chain.unsetHighlight().run();
  else if (command === 'uncolor') chain.unsetColor().run();
  else if (command === 'clear') chain.unsetAllMarks().run();
  closeMenu(true);
});
menu.addEventListener('keydown', (event) => {
  const buttons = [...menu.querySelectorAll<HTMLButtonElement>('button')];
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
  if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
      : (index + (event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length;
    buttons[next].focus();
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !menu.hidden) { event.preventDefault(); closeMenu(true); }
  if (event.defaultPrevented || !editor?.isEditable || event.altKey || (!event.ctrlKey && !event.metaKey)) return;
  if (event.code === 'KeyZ' || event.code === 'KeyY') {
    event.preventDefault();
    closeMenu();
    if (event.code === 'KeyY' || event.shiftKey) editor.commands.redo();
    else editor.commands.undo();
  }
});
document.addEventListener('pointerdown', (event) => { if (!menu.contains(event.target as Node)) closeMenu(); });
window.addEventListener('resize', () => closeMenu());
window.addEventListener('scroll', () => closeMenu(), { passive: true });
function updateHistoryButtons() {
  if (!editor) return;
  undoButton.disabled = !editor.isEditable || !editor.can().undo();
  redoButton.disabled = !editor.isEditable || !editor.can().redo();
}
undoButton.addEventListener('click', () => editor.chain().focus().undo().run());
redoButton.addEventListener('click', () => editor.chain().focus().redo().run());
window.addEventListener('online', () => { if (dirty && !blocked) void save(); });

function setDocument(documentContent: JSONContent) {
  // Remote snapshots start a fresh local history; Ctrl+Z must never undo someone
  // else's saved content or reintroduce a document replaced by a remote update.
  editor.view.updateState(EditorState.create({ schema: editor.schema,
    doc: editor.schema.nodeFromJSON(documentContent), plugins: editor.state.plugins }));
  updateToc();
  updateHistoryButtons();
}
function receiveRemote(remote: Snapshot) {
  if (saving) { pendingRemote = remote; return; }
  loaded = true;
  if (remote.etag === snapshot.etag) {
    snapshot = { ...snapshot, savedAt: remote.savedAt };
    editor.setEditable(canEdit && !blocked, false);
    updateHistoryButtons();
    if (!blocked && !dirty) showStatus(canEdit ? (snapshot.savedAt ? 'Сохранено' : 'Готово к редактированию')
      : 'Подключение к общему документу…');
    if (dirty && canEdit && !blocked) { clearTimeout(timer); timer = setTimeout(() => void save(), 1000); }
    return;
  }
  if (dirty) { showConflict('Появились изменения другого редактора. Ваши правки сохранены в браузере; скачайте свою копию перед открытием общего документа.'); return; }
  snapshot = remote;
  setDocument(remote.document);
  editor.setEditable(canEdit && !blocked, false);
  showStatus(canEdit ? 'Документ обновлён' : 'Подключение к общему документу…');
}

async function start() {
  let online = true;
  try {
    if (firebaseConfig.projectId) {
      cloud = await createFirebaseStore(firebaseConfig, seed, sitePath('/').replace(/\/$/, ''));
      canEdit = cloud.access.canEdit;
      const initialAccess = { ...cloud.access };
      draftKey = `pp-firebase-editor-v1:${firebaseConfig.projectId}:${seed.documentId}:${initialAccess.uid || 'reader'}`;
      cloud.onAccess((next: { uid: string; canEdit: boolean }) => {
        if (next.uid === initialAccess.uid && next.canEdit === initialAccess.canEdit) return;
        if (dirty) {
          rememberDraft(); canEdit = false; closeMenu(); editor?.setEditable(false, false); updateHistoryButtons();
          showConflict('Доступ к редактированию изменился. Скачайте свою копию перед обновлением страницы.');
        } else location.reload();
      });
      snapshot = await cloud.load();
      loaded = true;
    } else {
      canEdit = true;
      const response = await fetch(endpoint, { cache: 'no-store' });
      const jsonResponse = response.headers.get('content-type')?.includes('application/json');
      if ([404, 405, 501].includes(response.status) || !jsonResponse) sharedAvailable = false;
      if (!response.ok || !jsonResponse) throw new Error('load');
      snapshot = await response.json();
      loaded = true;
    }
  } catch { online = false; }
  let documentContent = snapshot.document;
  const draft = canEdit ? readDraft() : undefined;
  if (draft && JSON.stringify(draft.document) !== JSON.stringify(snapshot.document)) {
    documentContent = draft.document;
    dirty = true;
    if (sharedAvailable && (draft.sourceSha256 !== snapshot.sourceSha256 || draft.etag !== snapshot.etag)) {
      showConflict('В браузере есть неподтверждённые правки, а сохранённый документ уже изменён. Скачайте свою копию перед открытием сохранённого документа.');
    }
  } else if (draft) forgetDraft();
  host.replaceChildren();
  editor = new Editor({
    element: host, extensions: editorExtensions({ math: mathView, mermaid: mermaidView, image: imageView }), content: documentContent,
    editable: canEdit && !blocked && (!cloud || loaded),
    enableContentCheck: true,
    editorProps: {
      attributes: { role: 'textbox', 'aria-label': 'Редактор плана реализации', 'aria-multiline': 'true', spellcheck: 'false' },
      handleDOMEvents: {
        click: (_view, event) => {
          const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
          if (!link || (editor.isEditable && !event.ctrlKey && !event.metaKey)) return false;
          event.preventDefault();
          const href = link.getAttribute('href')!;
          if (href.startsWith('#')) {
            const target = document.getElementById(decodeURIComponent(href.slice(1)));
            target?.scrollIntoView();
            if (target) history.pushState(null, '', href);
          } else window.open(link.href, '_blank', 'noopener,noreferrer');
          return true;
        },
        contextmenu: (view, event) => {
          if (!editor.isEditable) return false;
          event.preventDefault();
          const hit = view.posAtCoords({ left: event.clientX, top: event.clientY });
          const current = editor.state.selection;
          // Native right-click doesn't always move ProseMirror's caret. Preserve
          // a selected range inside it, otherwise target the clicked paragraph.
          if (hit && (current.empty || hit.pos < current.from || hit.pos > current.to)) editor.commands.setTextSelection(hit.pos);
          openMenu(event.clientX, event.clientY);
          return true;
        },
        keydown: (_view, event) => {
          if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
            event.preventDefault(); openMenu(undefined, undefined, true); return true;
          }
          if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); void save(); return true; }
          return false;
        },
      },
    },
    onUpdate: ({ transaction }) => {
      if (!canEdit || transaction.getMeta('addToHistory') === false) return;
      dirty = true;
      sequence++;
      rememberDraft();
      if (!blocked && canEdit) { showStatus('Есть несохранённые правки'); clearTimeout(timer); timer = setTimeout(() => void save(), 1000); }
      updateToc();
    },
    onTransaction: updateHistoryButtons,
  });
  updateToc();
  host.setAttribute('aria-busy', 'false');
  updateHistoryButtons();
  if (!blocked) showStatus(cloud && !online ? 'Нет связи с общим документом. Доступен просмотр.'
    : cloud && !canEdit ? 'Подключение к общему документу…'
    : !sharedAvailable ? (dirty ? 'Восстановлены правки из этого браузера' : 'Правки сохраняются в этом браузере')
    : !online ? 'Нет связи с сервером. Правки сохранятся в браузере.'
    : dirty ? 'Восстановлены несохранённые правки' : snapshot.savedAt ? 'Сохранено' : 'Готово к редактированию', !online && sharedAvailable);
  if (!sharedAvailable) dirty = false;
  if (dirty && !blocked && online) timer = setTimeout(() => void save(), 750);
  cloud?.watch(receiveRemote, () => {
    if (dirty) rememberDraft();
    loaded = false; editor.setEditable(false, false); updateHistoryButtons();
    showStatus('Не удалось получить общий документ. Доступен просмотр.', true);
  });
}

document.querySelector('[data-editor-download]')!.addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify({ ...snapshot, document: editor.getJSON() }, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'plan-draft.json'; link.click(); URL.revokeObjectURL(url);
});
document.querySelector('[data-editor-server]')!.addEventListener('click', () => {
  clearTimeout(timer);
  // This explicit recovery action discards the local draft. beforeunload must
  // not immediately recreate it and send the user back into the same conflict.
  dirty = false;
  forgetDraft();
  location.reload();
});
window.addEventListener('beforeunload', (event) => { if (dirty) { rememberDraft(); event.preventDefault(); } });
void start().catch(() => { showStatus('Не удалось открыть редактор документа.', true); host.setAttribute('aria-busy', 'false'); });
