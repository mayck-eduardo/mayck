import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        wip: resolve(__dirname, 'wip.html'),
        blog: resolve(__dirname, 'blog.html'),
        txt: resolve(__dirname, 'txt.html'),
        evofit: resolve(__dirname, 'evofit.html'),
        estoque: resolve(__dirname, 'estoque.html'),
        'station-magic': resolve(__dirname, 'station-magic.html'),
      },
    },
  },
})
