// src/qiankun/actions.ts

let _props = null

export function setActions(props) {
  _props = props
}

export const microActions = {
  // 监听主应用状态
  onGlobalStateChange(callback, immediate = false) {
    return _props?.onGlobalStateChange?.(callback, immediate)
  },

  // 向主应用发送状态
  setGlobalState(state) {
    return _props?.setGlobalState?.(state)
  },

  // 获取主应用透传的其他 props
  getProps() {
    return _props
  },
}
