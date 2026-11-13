import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const implementation = defineCollection({
  loader: glob({
    base: './content/public/plans',
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

const documentation = defineCollection({
  loader: glob({
    base: './content/public/documentation',
    pattern: '*.md',
    deferRender: true,
    generateId: ({ entry }) => entry.replace(/\.md$/i, ''),
  }),
});

const overview = defineCollection({
  loader: glob({ base: './content/public/overview', pattern: '*.md', deferRender: true }),
  schema: z.object({
    id: z.string(), order: z.number(), nav: z.string(), eyebrow: z.string(), title: z.string(), summary: z.string(),
    icon: z.string(), status: z.enum(['supported', 'evolving', 'review']), updated: z.string(),
    kind: z.enum(['process', 'cards', 'roles']).default('cards'),
    cards: z.array(z.object({ title: z.string(), text: z.string(), icon: z.string() })).default([]),
    steps: z.array(z.object({ title: z.string(), text: z.string(), who: z.enum(['human', 'model', 'code']) })).default([]),
    roles: z.array(z.object({ title: z.string(), name: z.string(), stage: z.string(), kind: z.enum(['llm', 'code']), icon: z.string(), when: z.string(), input: z.string(), output: z.string(), limits: z.string() })).default([]),
  }),
});

const modelArticle = defineCollection({
  loader: glob({ base: './content/public/models', pattern: '*.md', deferRender: true }),
  schema: z.object({ title: z.string(), summary: z.string(), updated: z.string() }),
});

const publicArticles = defineCollection({
  loader: glob({ base: './content/public/articles', pattern: '*.md', deferRender: true }),
  schema: z.object({ title: z.string(), summary: z.string(), updated: z.string() }),
});

export const collections = { implementation, documentation, overview, modelArticle, publicArticles };
