import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '@/i18n'
import { microActions } from '@/qiankun/actions'

export const useAppStore = defineStore('app', () => {
  const collapsed = ref(false)
  const theme = ref('dark')
  // 布局模式：sidebar（侧边栏） | top（顶部）
  const layout = ref(localStorage.getItem('layout') || 'sidebar')
  const locale = ref(localStorage.getItem('locale') || 'zh-CN')

  const toggleCollapsed = () => {
    collapsed.value = !collapsed.value
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  const toggleLayout = () => {
    setLayout(layout.value === 'sidebar' ? 'top' : 'sidebar')
  }

  const setLayout = value => {
    layout.value = value
    localStorage.setItem('layout', value)
  }

  /** 切换语言：写入 localStorage + 切换 vue-i18n + 同步给主应用 */
  const setLocale = lang => {
    locale.value = lang
    localStorage.setItem('locale', lang)
    i18n.global.locale.value = lang
    microActions.setGlobalState({ language: lang })
  }

  return {
    collapsed,
    theme,
    layout,
    locale,
    toggleCollapsed,
    toggleTheme,
    toggleLayout,
    setLayout,
    setLocale,
  }
})
