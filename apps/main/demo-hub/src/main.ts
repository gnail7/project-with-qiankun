import { qiankunWindow, renderWithQiankun } from 'vite-plugin-qiankun/dist/helper'
import { createApp } from 'vue'
import { useTheme } from '@ziven/ui/theme'
import App from './App.vue'
import router from './router'
import 'leaflet/dist/leaflet.css'
import './style.css'

let app: ReturnType<typeof createApp> | null = null

function render(props: { container?: HTMLElement } = {}) {
  const container = props.container
  const mountPoint = container ? container.querySelector('#app') : '#app'

  if (!mountPoint) {
    return
  }

  useTheme().initTheme()
  app = createApp(App)
  app.use(router)
  app.mount(mountPoint)
}

renderWithQiankun({
  bootstrap() {},
  mount(props) {
    render(props)
  },
  unmount() {
    app?.unmount()
    app = null
  },
  update() {},
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}
