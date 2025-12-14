import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import istanbul from 'vite-plugin-istanbul'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    vueDevTools(),
    // Add code coverage instrumentation in e2e mode
    mode === 'e2e' &&
      istanbul({
        include: 'src/*',
        exclude: ['node_modules', 'cypress', 'src/mocks'],
        extension: ['.js', '.ts', '.vue'],
        requireEnv: false,
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
