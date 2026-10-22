// Each drawing is a separate document. Only the selected document is rendered.
const modules = import.meta.glob('./results/*.mjs', { eager: true, import: 'default' });
const order = ['drive-shaft', 'steel-copper', 'pc-shaft'];

export const drawings = Object.values(modules).sort(
  (a, b) => order.indexOf(a.slug) - order.indexOf(b.slug),
);

export const drawingPath = (drawing) => `/results/${drawing.slug}/`;
