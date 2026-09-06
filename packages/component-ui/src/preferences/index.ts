import { ref } from 'vue'

export type LayoutMode = 'sidebar' | 'top'

export interface UsePreferencesResult {
  layout: typeof layout
  collapsed: typeof collapsed
  setLayout: (value: LayoutMode) => void
  toggleLayout: () => void
  toggleCollapsed: () => void
  setCollapsed: (value: boolean) => void
}

const LAYOUT_KEY = 'ziven-layout'
const COLLAPSED_KEY = 'ziven-collapsed'

function loadLayout(): LayoutMode {
  const value = localStorage.getItem(LAYOUT_KEY)
  return value === 'top' ? 'top' : 'sidebar'
}

function loadCollapsed(): boolean {
  return localStorage.getItem(COLLAPSED_KEY) === '1'
}

// 模块级单例：布局模式/折叠状态全局共享并持久化
const layout = ref<LayoutMode>(loadLayout())
const collapsed = ref<boolean>(loadCollapsed())

/**
 * 偏好设置 Hook（组件库内置）
 * 与 useTheme 分离：这里只管『布局』相关的 UI 状态，主题/主题色走 useTheme。
 */
export function usePreferences(): UsePreferencesResult {
  function setLayout(value: LayoutMode) {
    layout.value = value
    localStorage.setItem(LAYOUT_KEY, value)
  }

  function toggleLayout() {
    setLayout(layout.value === 'sidebar' ? 'top' : 'sidebar')
  }

  function setCollapsed(value: boolean) {
    collapsed.value = value
    localStorage.setItem(COLLAPSED_KEY, value ? '1' : '0')
  }

  function toggleCollapsed() {
    setCollapsed(!collapsed.value)
  }

  return { layout, collapsed, setLayout, toggleLayout, toggleCollapsed, setCollapsed }
}
