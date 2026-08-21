import type { MicroAppStateActions } from 'qiankun'
import { initGlobalState } from 'qiankun'

// 定义初始状态
export const initialState = {
  user: null as { name: string, id: number } | null,
  token: '',
  theme: 'light' as 'light' | 'dark',
  language: '',
}

// 初始化（只执行一次）
const actions: MicroAppStateActions = initGlobalState(initialState)

export default actions
