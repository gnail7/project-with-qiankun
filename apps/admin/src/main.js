import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import router from '@/router'
import i18n from '@/i18n'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import App from './App.vue'
import './style.css'
import { setActions, microActions } from './qiankun/actions.js'

let instance = null
const render = (props = {}) => {
  const { container } = props
  instance = createApp(App)
  instance.use(createPinia())
  instance.use(router)
  instance.use(Antd)
  instance.use(i18n)
  instance.mount(container ? container.querySelector('#app') : '#app')
}

renderWithQiankun({
  mount(props) {
    render(props)
    setActions(props)
  },
  bootstrap() {
    console.log('bootstrap')
  },
  unmount() {
    console.log('unmount')
    if (instance) {
      instance.unmount()
      instance = null
    }
  },
  update(props) {
    console.log('update', props)
  }
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}
