import { env } from 'node:process'
import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

function resolveBasePath() {
  const configuredBase = env.VITE_BASE_PATH

  if (configuredBase) {
    const normalizedBase = configuredBase.startsWith('/') ? configuredBase : `/${configuredBase}`
    return normalizedBase.endsWith('/') ? normalizedBase : `${normalizedBase}/`
  }

  if (env.GITHUB_ACTIONS === 'true') {
    const repositoryName = env.GITHUB_REPOSITORY?.split('/').at(-1)

    if (repositoryName)
      return `/${repositoryName}/`
  }

  return '/'
}

// https://vite.dev/config/
export default defineConfig({
  base: resolveBasePath(),
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      imports: ['vue', 'vue-router'],
      dts: 'types/auto-imports.d.ts',
    }),
    Components({
      dirs: ['src/components'],
      dts: 'types/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
