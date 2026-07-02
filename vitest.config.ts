import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '#imports': fileURLToPath(new URL('./src/testing/importsMock.ts', import.meta.url)),
      '#app': fileURLToPath(new URL('./src/testing/importsMock.ts', import.meta.url))
    }
  }
})
