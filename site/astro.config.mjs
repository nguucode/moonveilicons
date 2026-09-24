import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Served by GitHub Pages as a project site under the ontheshore.biz user site.
export default defineConfig({
  site: 'https://ontheshore.biz',
  base: '/moonveilicons',
  build: { format: 'file' },
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
