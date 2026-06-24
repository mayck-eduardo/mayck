import { defineConfig } from 'astro/config';

export default defineConfig({
  outDir: 'dist',
  build: {
    format: 'file',
  },
  vite: {
    ssr: {
      noExternal: ['@studio-freight/lenis'],
    },
  },
});
