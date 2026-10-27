import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const implementation = defineCollection({
  loader: glob({
    base: './documents/implementation',
    pattern: '**/*.md',
    // Render in the page build so a malformed document fails the build visibly.
    deferRender: true,
    // Preserve filenames so relative Markdown links and nested folders agree.
    generateId: ({ entry }) => entry.replace(/\.md$/i, ''),
  }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    order: z.number().default(100),
  }),
});

export const collections = { implementation };
