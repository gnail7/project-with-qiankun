import Antd from 'ant-design-vue'
import { createPinia } from 'pinia'
import { qiankunWindow, renderWithQiankun } from 'vite-plugin-qiankun/dist/helper'
import { createApp } from 'vue'
import { permission } from '@/directives/permission'
import i18n from '@/i18n'
import router from '@/router'
import { bootstrapMonitoring } from 'monitoring'
import App from './App.vue'
import { setActions } from './qiankun/actions.js'
import './style.css'

let instance = null
function render(props = {}) {
  const { container } = props
  instance = createApp(App)
  instance.use(createPinia())
  instance.use(router)
  instance.use(Antd)
  instance.use(i18n)
  instance.directive('permission', permission)
  instance.mount(container ? container.querySelector('#app') : '#app')

  // 统一入口：单独打开则自己 init，嵌入主应用则复用已初始化 client，并打上 micro_app=admin
  bootstrapMonitoring({
    app: instance,
    router,
    appName: 'admin',
    version: import.meta.env.VITE_APP_VERSION,
  })
}

renderWithQiankun({
  mount(props) {
    render(props)
    setActions(props)
  },
  bootstrap() {},
  unmount() {
    if (instance) {
      instance.unmount()
      instance = null
    }
  },
  update() {},
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}
