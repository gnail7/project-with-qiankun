import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

export function mountMall(container?: HTMLElement) {
  const mountPoint = container ? container.querySelector('#app') : document.querySelector('#app')
  if (!mountPoint) return null

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount(mountPoint)
  return app
}
