import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig } from 'vite'
import qiankun from 'vite-plugin-qiankun'

const hasSentryAuth = Boolean(process.env.SENTRY_AUTH_TOKEN)

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    tailwindcss(),
    qiankun('gnail-admin', {
      useDevMode: true, // 开发环境必须开启
    }),
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
    port: 8081, // 必须和主应用 entry 一致
    cors: true, // 防止跨域问题
    host: '0.0.0.0', // 暴露内网ip
  },
  build: {
    sourcemap: 'hidden',
  },
})
