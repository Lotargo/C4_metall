import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getSchema } from '@tiptap/core';
import { EditorState } from '@tiptap/pm/state';
import { closeHistory } from '@tiptap/pm/history';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { editorExtensions, validateDocument } from '../src/editor/schema.mjs';
import { preservedContent, importMarkdown } from '../src/editor/markdown.mjs';
import { initialTestDocument, createTestStore, sourceFile } from './fixtures/editor-document.mjs';
import { DocumentChanged } from './document-store.mjs';
import { recentHistoryPlugins, recentActions, undoRecent, redoRecent } from '../src/editor/history.mjs';
import { createImplementationStores, implementationFiles } from './implementation-store.mjs';
import { implementationSeed } from '../src/editor/seed.mjs';
import { readDocumentRequest, DocumentTooLarge } from './editor-request.mjs';
import { encodeCloudDocument, decodeCloudDocument, assertCurrentDocument, DocumentConflict } from '../src/editor/cloud-document.mjs';

const root = process.cwd();
const originalBytes = await readFile(path.join(root, sourceFile));
const seed = await initialTestDocument(root);
const protectedBefore = preservedContent(seed.document);

test('cloud JSON survives UTF-8 transport and both site bases with all rich document structures intact', async () => {
  const rootSeed = implementationSeed({ id: '16-ПЛАН_ИНЖЕНЕРНЫХ_РАСЧЁТОВ_2026-10-27', markdown: originalBytes.toString('utf8'),
    documentIds: ['16-ПЛАН_ИНЖЕНЕРНЫХ_РАСЧЁТОВ_2026-10-27'], base: '' });
  // The test fixture contains inline and block LaTeX, in addition to
  // all actual tables/Mermaid/code/metadata in the source plan.
  const document = structuredClone(seed.document);
  document.content.push({ type: 'paragraph', content: [{ type: 'text', text: 'Пробелы  и кириллица ✓',
    marks: [{ type: 'link', attrs: { href: '/implementation/example/#раздел' } }] }] });
  const first = await encodeCloudDocument(document);
  const record = { ...first, format: 1, documentId: rootSeed.documentId, sourceSha256: rootSeed.sourceSha256,
    updatedAt: { toDate: () => new Date('2026-10-27T00:00:00Z') } };
  const atPages = await decodeCloudDocument(record, rootSeed, '/C4_metall');
  assert.equal(atPages.document.content.at(-1).content[0].marks[0].attrs.href, '/C4_metall/implementation/example/#раздел');
  const second = await encodeCloudDocument(atPages.document, '/C4_metall');
  assert.deepEqual(second, first);
  const reopened = await decodeCloudDocument({ ...record, ...second }, rootSeed);
  assert.deepEqual(reopened.document, validateDocument(document));
  assert.deepEqual(preservedContent(reopened.document).math, protectedBefore.math);
  assert.deepEqual(preservedContent(reopened.document).tables, protectedBefore.tables);
  assert.deepEqual(preservedContent(reopened.document).mermaid, protectedBefore.mermaid);
  assert.equal(reopened.savedAt, '2026-10-27T00:00:00.000Z');
  await assert.rejects(decodeCloudDocument({ ...record, contentJson: record.contentJson + ' ' }, rootSeed));
  await assert.rejects(decodeCloudDocument({ ...record, documentId: 'other' }, rootSeed));
  await assert.rejects(encodeCloudDocument({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'я'.repeat(450_000) }] }] }), RangeError);
});

test('cloud transaction compares the original etag on every retry and rejects a stale editor', () => {
  assert.doesNotThrow(() => assertCurrentDocument(null, seed.etag, seed));
  assert.doesNotThrow(() => assertCurrentDocument({ etag: 'first' }, 'first', seed));
  assert.throws(() => assertCurrentDocument({ etag: 'second' }, 'first', seed), DocumentConflict);
  assert.throws(() => assertCurrentDocument(null, 'first', seed), DocumentConflict);
});

test('the complete current plan imports, including hidden HTML and exact source links', () => {
  const ast = unified().use(remarkParse).use(remarkGfm).parse(originalBytes.toString('utf8'));
  const expected = { tables: 0, mermaid: [], links: [], metadata: [] };
  const visit = (node) => {
    if (node.type === 'table') expected.tables++;
    if (node.type === 'code' && node.lang === 'mermaid') expected.mermaid.push(node.value);
    if (node.type === 'link') expected.links.push(node.url);
    if (node.type === 'html') expected.metadata.push(node.value);
    node.children?.forEach(visit);
  };
  visit(ast);
  assert.equal(expected.tables, 14);
  assert.equal(protectedBefore.tables.length, expected.tables);
  assert.deepEqual(protectedBefore.mermaid, expected.mermaid);
  assert.deepEqual(protectedBefore.links.map((link) => link.originalHref), expected.links);
  assert.deepEqual(protectedBefore.metadata.map((item) => item.source), expected.metadata);
  assert.equal(protectedBefore.metadata.filter((item) => item.anchor).length, 13);
  assert.deepEqual(protectedBefore.math, [
    { type: 'mathInline', latex: 'v = \\pi d n / 1000' },
    { type: 'mathBlock', latex: 't = \\frac{L}{n \\cdot f}' },
  ]);
});

test('real editor transactions, JSON disk save and a new store preserve tables, formula sources, Mermaid, links and metadata', async () => {
  const schema = getSchema(editorExtensions());
  let state = EditorState.create({ schema, doc: schema.nodeFromJSON(seed.document) });
  let position;
  state.doc.descendants((node, pos) => {
    if (position === undefined && node.type.name === 'paragraph' && node.textContent) position = pos + 1;
  });
  const inserted = 'Проверка  двух пробелов. ';
  const transaction = state.tr.insertText(inserted, position);
  for (const mark of [schema.marks.bold.create(), schema.marks.italic.create(), schema.marks.underline.create(), schema.marks.highlight.create({ color: '#ffe18c' }), schema.marks.textStyle.create({ color: 'var(--editor-red)' })]) {
    transaction.addMark(position, position + inserted.length, mark);
  }
  state = state.apply(transaction);
  await mkdir(path.join(root, 'outputs'), { recursive: true });
  const directory = await mkdtemp(path.join(root, 'outputs/editor-test-'));
  const store = createTestStore(root, { directory });
  const saved = await store.save(state.doc.toJSON(), seed.etag);
  assert.ok(saved.etag !== seed.etag);
  assert.ok(!('revision' in saved));
  assert.deepEqual(preservedContent(saved.document), protectedBefore);
  const reopened = await createTestStore(root, { directory }).load();
  assert.deepEqual(reopened, saved);
  const rebuilt = schema.nodeFromJSON(reopened.document);
  rebuilt.check();
  const changedText = rebuilt.nodeAt(position);
  assert.ok(changedText.text.startsWith(inserted));
  assert.deepEqual(changedText.marks.map((mark) => mark.type.name).sort(), ['bold', 'highlight', 'italic', 'textStyle', 'underline'].sort());
  assert.equal(reopened.originalMarkdown, originalBytes.toString('utf8'));
  assert.deepEqual(await readFile(path.join(root, sourceFile)), originalBytes);
  assert.deepEqual(await readdir(directory), ['current.json']);
});

test('one current document is saved, and a stale client cannot silently overwrite a changed document', async () => {
  const directory = await mkdtemp(path.join(root, 'outputs/editor-conflict-'));
  const store = createTestStore(root, { directory });
  const changed = structuredClone(seed.document);
  changed.content[1].content[0].text += ' Проверка общего документа.';
  const results = await Promise.allSettled([store.save(changed, seed.etag), store.save(changed, seed.etag)]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.ok(results.find((result) => result.status === 'rejected').reason instanceof DocumentChanged);
  const current = await store.load();
  await assert.rejects(store.save({ type: 'doc', content: [{ type: 'missingNode' }] }, current.etag));
  assert.deepEqual(await store.load(), current);
  const next = await store.save(seed.document, current.etag);
  assert.deepEqual(next.document, seed.document);
  assert.deepEqual(await readdir(directory), ['current.json']);
});

test('malformed document structures are rejected', () => {
  assert.throws(() => validateDocument({ type: 'doc', content: [{ type: 'missingNode' }] }));
  assert.throws(() => validateDocument({ type: 'doc', content: [{ type: 'table', content: [] }] }));
});

test('exactly the last 20 independent actions can be undone and redone, including after library pruning', () => {
  const schema = getSchema(editorExtensions());
  for (const count of [21, 45]) {
    let state = EditorState.create({ schema, doc: schema.node('doc', null, [schema.node('paragraph')]), plugins: recentHistoryPlugins() });
    const dispatch = (transaction) => { state = state.apply(transaction); };
    const parts = Array.from({ length: count }, (_, index) => `[${index}]`);
    for (const part of parts) dispatch(closeHistory(state.tr.insertText(part, state.doc.content.size - 1)));
    assert.deepEqual(recentActions(state), { undo: 20, redo: 0 });
    for (let index = 0; index < 20; index++) assert.equal(undoRecent(state, dispatch), true);
    assert.equal(undoRecent(state, dispatch), false);
    assert.equal(state.doc.textContent, parts.slice(0, -20).join(''));
    assert.deepEqual(recentActions(state), { undo: 0, redo: 20 });
    for (let index = 0; index < 20; index++) assert.equal(redoRecent(state, dispatch), true);
    assert.equal(redoRecent(state, dispatch), false);
    assert.equal(state.doc.textContent, parts.join(''));
    assert.deepEqual(recentActions(state), { undo: 20, redo: 0 });
    assert.ok(undoRecent(state, dispatch));
    dispatch(closeHistory(state.tr.insertText(' Новое действие', state.doc.content.size - 1)));
    assert.equal(redoRecent(state, dispatch), false);
    assert.equal(recentActions(state).undo, 20);
  }
});

test('typing groups into an action, metadata does not consume an action, and undo/redo preserve rich content', () => {
  const schema = getSchema(editorExtensions());
  let state = EditorState.create({ schema, doc: schema.nodeFromJSON(seed.document), plugins: recentHistoryPlugins() });
  const dispatch = (transaction) => { state = state.apply(transaction); };
  const original = state.doc.toJSON();
  for (const character of ' Текст') dispatch(state.tr.insertText(character, 2).setTime(1000));
  assert.equal(recentActions(state).undo, 1);
  dispatch(state.tr.setMeta('addToHistory', false));
  assert.equal(recentActions(state).undo, 1);
  assert.ok(undoRecent(state, dispatch));
  assert.deepEqual(state.doc.toJSON(), original);
  assert.ok(redoRecent(state, dispatch));
  assert.deepEqual(preservedContent(validateDocument(state.doc.toJSON())), protectedBefore);
});

test('the main plan imports the actual source, without trial text or test formulas', async () => {
  const files = await implementationFiles(root);
  const id = path.basename(sourceFile, '.md');
  const main = implementationSeed({ id, markdown: originalBytes.toString('utf8'), documentIds: [...files.keys()] });
  assert.equal(main.documentId, id);
  assert.equal(main.originalMarkdown, originalBytes.toString('utf8'));
  assert.equal(preservedContent(main.document).math.length, 0);
  assert.equal(preservedContent(main.document).tables.length, 14);
  assert.equal(preservedContent(main.document).mermaid.length, 1);
  assert.equal(preservedContent(main.document).links.length, 59);
  assert.ok(!JSON.stringify(main.document).includes('Контрольные формулы'));
  assert.ok(!JSON.stringify(main.document).includes('Проверка  редактора.'));
  const plain = implementationSeed({ id: 'Без заголовка', markdown: 'Обычный текст.', documentIds: ['Без заголовка'] });
  assert.equal(plain.document.content[0].type, 'heading');
  assert.equal(plain.document.content[0].content[0].text, 'Без заголовка');
  assert.equal(plain.document.content[1].content[0].text, 'Обычный текст.');
});

test('main documents have independent saved contents, preserve rich formats and resolve nested links on either base path', async () => {
  const directory = await mkdtemp(path.join(root, 'outputs/main-editor-'));
  await mkdir(path.join(directory, 'documents/implementation/nested'), { recursive: true });
  const first = '---\ntitle: Первый\n---\n# Первый\n\n[Второй](nested/second.md#section)\n\n![Схема](/image.png)\n\n- [x] Принято\n- [ ] В работе\n\n$a^2$\n\n```mermaid\nflowchart LR\n A --> B\n```\n';
  const second = '# Второй\n\n[Первый](../first.md)\n\n| A | B |\n| - | - |\n| 1 | 2 |\n';
  await writeFile(path.join(directory, 'documents/implementation/first.md'), first);
  await writeFile(path.join(directory, 'documents/implementation/nested/second.md'), second);
  for (const base of ['', '/C4_metall']) {
    const storeFor = createImplementationStores(directory, { base, directory: path.join(directory, base ? 'base-state' : 'root-state') });
    assert.equal(await storeFor('../../outside'), undefined);
    assert.equal(await storeFor('missing'), undefined);
    const a = await storeFor('first');
    const b = await storeFor('nested/second');
    const initialA = await a.load();
    const initialB = await b.load();
    assert.equal(initialA.title, 'Первый');
    assert.equal(initialA.document.content[0].type, 'heading');
    assert.equal(preservedContent(initialA.document).links[0].href, base + '/implementation/nested/second/#section');
    assert.equal(preservedContent(initialB.document).links[0].href, base + '/implementation/first/');
    assert.equal(initialA.document.content.find((node) => node.type === 'taskList').content[0].attrs.checked, true);
    const changed = structuredClone(initialA.document);
    changed.content[0].content[0].text += ' изменён';
    const saved = await a.save(changed, initialA.etag);
    assert.deepEqual((await b.load()).document, initialB.document);
    assert.deepEqual((await (await storeFor('first')).load()).document, saved.document);
    assert.deepEqual(preservedContent(saved.document), preservedContent(initialA.document));
    assert.equal((await a.load()).document.content.find((node) => node.type === 'taskList').content[0].attrs.checked, true);
    assert.deepEqual(saved.document.content.find((node) => node.type === 'paragraph' && node.content?.[0]?.type === 'image'),
      initialA.document.content.find((node) => node.type === 'paragraph' && node.content?.[0]?.type === 'image'));
    assert.equal(await readFile(path.join(directory, 'documents/implementation/first.md'), 'utf8'), first);
  }
});

test('HTTP request decoding preserves UTF-8 when Cyrillic characters cross network chunk boundaries', async () => {
  const payload = { document: seed.document, baseEtag: seed.etag, text: 'Вспомогательное время · расчёты → 🛠️' };
  const bytes = Buffer.from(JSON.stringify(payload));
  for (const [size, expected] of [[1, { text: payload.text }], [3, { text: payload.text }], [65536, payload]]) {
    const encoded = Buffer.from(JSON.stringify(expected));
    async function* chunks() { for (let offset = 0; offset < encoded.length; offset += size) yield encoded.subarray(offset, offset + size); }
    assert.deepEqual(await readDocumentRequest(chunks()), expected);
  }
  async function* oversized() { yield bytes; }
  await assert.rejects(readDocumentRequest(oversized(), bytes.length - 1), DocumentTooLarge);
});
