import { resolve } from 'node:path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

const root = __dirname
// The aliases the Quasar build provided; kept so imports did not have to change.
const alias = {
  app: root,
  src: resolve(root, 'src'),
  '@src': resolve(root, 'src'),
  components: resolve(root, 'src/components'),
  layouts: resolve(root, 'src/layouts'),
  pages: resolve(root, 'src/pages'),
  assets: resolve(root, 'src/assets'),
  stores: resolve(root, 'src/stores'),
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias },
    build: {
      outDir: 'out/main',
      lib: { entry: resolve(root, 'src-electron/electron-main.ts') },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias },
    build: {
      outDir: 'out/preload',
      lib: { entry: resolve(root, 'src-electron/electron-preload.ts') },
      rollupOptions: {
        // sandboxed preload scripts must be CommonJS; .cjs because package.json says "type": "module"
        output: { format: 'cjs', entryFileNames: '[name].cjs' },
      },
    },
  },
  renderer: {
    root,
    publicDir: resolve(root, 'public'),
    resolve: { alias },
    plugins: [
      vue(),
      tailwindcss(),
      VueI18nPlugin({ include: [resolve(root, 'src/i18n/**')] }),
    ],
    build: {
      outDir: 'out/renderer',
      rollupOptions: { input: resolve(root, 'index.html') },
    },
  },
})
