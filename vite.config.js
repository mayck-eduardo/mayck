import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        wip: resolve(__dirname, 'wip.html'),
        notas: resolve(__dirname, 'notas.html'),
        admin: resolve(__dirname, 'admin.html'),
        nota: resolve(__dirname, 'nota.html'),
        evofit: resolve(__dirname, 'evofit.html'),
        estoque: resolve(__dirname, 'estoque.html'),
        contador: resolve(__dirname, 'contador.html'),
        'station-magic': resolve(__dirname, 'station-magic.html'),
        cifrador: resolve(__dirname, 'cifrador.html'),
        'cifrador-mobile': resolve(__dirname, 'cifrador-mobile.html'),
        daytracker: resolve(__dirname, 'daytracker.html'),
        banda: resolve(__dirname, 'banda.html'),
      },
    },
  },
})
