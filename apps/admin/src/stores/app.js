import { defineStore } from 'pinia'
import { computed } from 'vue'
import { usePreferences } from '@ziven/ui/preferences'

/**
 * 应用级 UI 状态（折叠/布局）
 * 统一委托给组件库 usePreferences 单例，保证登录页与 BasicLayout 读取到同一份状态并持久化。
 */
export const useAppStore = defineStore('app', () => {
  const prefs = usePreferences()

  const collapsed = computed({
    get: () => prefs.collapsed.value,
    set: value => prefs.setCollapsed(value),
  })
  const layout = computed({
    get: () => prefs.layout.value,
    set: value => prefs.setLayout(value),
  })

  const toggleCollapsed = () => prefs.toggleCollapsed()
  const toggleLayout = () => prefs.toggleLayout()
  const setLayout = value => prefs.setLayout(value)

  return {
    collapsed,
    layout,
    toggleCollapsed,
    toggleLayout,
    setLayout,
  }
})
