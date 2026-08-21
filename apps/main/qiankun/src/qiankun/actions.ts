import actions from './global-state'

// 内部维护当前状态（用于 getState）
let currentState = {}
actions.onGlobalStateChange((state) => {
  currentState = state
})

// 提供类型安全的 API，避免到处写字符串
export const globalActions = {
  // 设置用户信息
  setUser(user: { name: string, id: number }) {
    actions.setGlobalState({ user })
  },

  // 设置主题
  setTheme(theme: 'light' | 'dark') {
    actions.setGlobalState({ theme })
  },

  // 设置 token
  setToken(token: string) {
    actions.setGlobalState({ token })
  },

  // 设置语言（同步给子应用）
  setLanguage(language: string) {
    actions.setGlobalState({ language })
  },

  // 监听状态变化（供组件使用）
  onStateChange(callback: (state: any, prevState: any) => void, immediate = false) {
    actions.onGlobalStateChange(callback, immediate)
  },

  // 获取当前状态（只读）
  getState() {
    // 需要手动维护一份当前状态，因为 qiankun 不提供 getGlobalState
    return currentState
  },
}
