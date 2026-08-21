import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import qiankun from 'vite-plugin-qiankun';

export default defineConfig({
  plugins: [
      vue(), 
      tailwindcss(), 
      qiankun('gnail-admin', {
        useDevMode: true  // 开发环境必须开启
      })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 8081,        // 必须和主应用 entry 一致
    cors: true,        // 防止跨域问题
    host: '0.0.0.0' ,// 暴露内网ip
  }
})
