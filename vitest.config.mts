import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

const root = __dirname

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      app: root,
      src: resolve(root, 'src'),
      '@src': resolve(root, 'src'),
      components: resolve(root, 'src/components'),
  layouts: resolve(root, 'src/layouts'),
  pages: resolve(root, 'src/pages'),
  assets: resolve(root, 'src/assets'),
  stores: resolve(root, 'src/stores'),
    },
  },
  test: {
    environment: 'happy-dom',
    include: [
      'src/**/*.vitest.{test,spec}.ts',
      'test/vitest/__tests__/**/*.{test,spec}.ts',
    ],
  },
})
