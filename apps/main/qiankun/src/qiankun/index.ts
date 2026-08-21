// 启动微前端应用
import { registerMicroApps, start } from 'qiankun'
import { globalActions } from './actions'
import apps from './apps'

export function startQiankun() {
  registerMicroApps(
    apps.map(app => ({
      ...app,
      props: {
        ...(app as any).props,
        // 把操作方法也传下去（可选，子应用可以直接用 props 里的）
        _globalActions: globalActions,
      },
    })),
  )

  start()
}
