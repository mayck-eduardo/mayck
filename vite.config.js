import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/mayck/', 
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        wip: resolve(__dirname, 'wip.html'),
        blog: resolve(__dirname, 'blog.html'), // Adicionado
        txt: resolve(__dirname, 'txt.html'), // Adicionado
      },
    },
  },
})
