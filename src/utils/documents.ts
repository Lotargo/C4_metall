import { getCollection, render, type CollectionEntry } from 'astro:content';

export async function getImplementationDocuments() {
  const entries = await getCollection('implementation');
  return Promise.all(entries.sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id, 'ru', { numeric: true })).map(async (entry) => {
    const { headings } = await render(entry);
    return {
      entry,
      title: entry.data.title || headings.find((heading) => heading.depth === 1)?.text || entry.id.split('/').pop()!,
    };
  }));
}

export type ImplementationDocument = CollectionEntry<'implementation'>;
