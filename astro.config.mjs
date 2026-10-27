import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkDocuments from './src/utils/remark-documents.mjs';
import implementationEditorPlugin from './scripts/implementation-editor-plugin.mjs';
export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || undefined,
  base: process.env.BASE_PATH || '/',
  devToolbar: { enabled: false },
  vite: { plugins: [implementationEditorPlugin()] },
  markdown: {
    processor: unified({
      shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
      remarkPlugins: [remarkMath, remarkDocuments],
      rehypePlugins: [[rehypeKatex, { throwOnError: false, trust: false }]],
    }),
  },
});
