import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig } from 'vite'

const hasSentryAuth = Boolean(process.env.SENTRY_AUTH_TOKEN)

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    // 仅在配置了 SENTRY_AUTH_TOKEN 时启用（即 CI 构建时），开发环境不生效
    ...(hasSentryAuth
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            sourcemaps: {
              filesToDeleteAfterUpload: ['**/*.map'],
            },
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // 避开 admin(8081)/backend(8080)/Nuxt blog(3000)，宿主用 8082
    port: 8082,
    host: '0.0.0.0',
    cors: true,
  },
  build: {
    sourcemap: 'hidden',
  },
})
