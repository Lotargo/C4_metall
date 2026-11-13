import { getCollection, type CollectionEntry } from 'astro:content';

const catalogue = [
  { id: 'architecture', title: 'Работа с деталью', description: 'Путь от чертежа к результатам и решениям технолога.' },
  { id: 'agent-service', title: 'Роли ИИ и технолога', description: 'Задачи участников и границы ответственности.' },
  { id: 'formulas', title: 'Расчётные величины', description: 'Геометрия, время, стоимость и проверка актуальности.' },
];

export type DocumentationEntry = CollectionEntry<'documentation'>;

export async function getDocumentationDocuments() {
  const entries = await getCollection('documentation');
  return catalogue.map((item) => {
    const entry = entries.find((document) => document.id === item.id);
    if (!entry) throw new Error(`Не найден документ: ${item.id}`);
    return { ...item, entry };
  });
}

export const documentationPath = (id: string) => `/documentation/${id}/`;
