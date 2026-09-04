import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n'
import { bootstrapMonitoring } from 'monitoring'
import { startQiankun } from './qiankun/index'
import './style.css'

const app = createApp(App)

// 先初始化监控（捕获挂载/启动阶段的错误；主应用未用 vue-router，故不传 router）
bootstrapMonitoring({
  app,
  appName: 'main',
  version: import.meta.env.VITE_APP_VERSION,
})

app.use(i18n).mount('#main-app')

startQiankun()
