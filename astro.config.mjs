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
  integrations: [{
    name: 'command-scoped-vite-cache',
    hooks: {
      'astro:config:setup': ({ command, updateConfig }) => {
        // Astro builds also optimize dependencies. Keep their cache separate
        // from a running dev server so its published module hashes stay valid.
        updateConfig({ vite: { cacheDir: `node_modules/.vite/${command}` } });
      },
    },
  }],
  vite: { plugins: [implementationEditorPlugin()] },
  markdown: {
    processor: unified({
      shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
      remarkPlugins: [remarkMath, remarkDocuments],
      rehypePlugins: [[rehypeKatex, { throwOnError: false, trust: false }]],
    }),
  },
});
