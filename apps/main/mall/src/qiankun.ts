import { qiankunWindow, renderWithQiankun } from 'vite-plugin-qiankun/dist/helper'
import type { App } from 'vue'
import { mountMall } from './main'

let app: App<Element> | null = null

renderWithQiankun({
  bootstrap() {},
  mount(props) {
    app = mountMall(props.container)
  },
  unmount() {
    app?.unmount()
    app = null
  },
  update() {},
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  app = mountMall()
}
