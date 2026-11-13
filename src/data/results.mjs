// Each drawing is a separate document. Only the selected document is rendered.
const modules = import.meta.glob('../../content/public/results/*.json', { eager: true, import: 'default' });

export const drawings = Object.values(modules).sort(
  (a, b) => a.order - b.order,
);

export const drawingPath = (drawing) => `/results/${drawing.slug}/`;
