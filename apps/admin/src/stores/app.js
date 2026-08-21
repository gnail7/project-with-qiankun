import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '@/i18n'
import { microActions } from '@/qiankun/actions'

export const useAppStore = defineStore('app', () => {
  const collapsed = ref(false)
  const theme = ref('light')
  const locale = ref(localStorage.getItem('locale') || 'zh-CN')

  const toggleCollapsed = () => {
    collapsed.value = !collapsed.value
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  /** 切换语言：写入 localStorage + 切换 vue-i18n + 同步给主应用 */
  const setLocale = (lang) => {
    locale.value = lang
    localStorage.setItem('locale', lang)
    i18n.global.locale.value = lang
    microActions.setGlobalState({ language: lang })
  }

  return { collapsed, theme, locale, toggleCollapsed, toggleTheme, setLocale }
})
