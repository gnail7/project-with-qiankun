import { createI18n } from 'vue-i18n'
import enUS from '@/locales/en-US'
import zhCN from '@/locales/zh-CN'

const savedLocale = localStorage.getItem('ziven-locale') || 'zh-CN'

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: savedLocale,
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

/** 根据当前路由的 meta.titleKey 刷新 document.title */
export function updateDocumentTitle(route) {
  const key = route?.meta?.titleKey
  document.title = key ? `${i18n.global.t(key)} - Gnail Admin` : 'Gnail Admin'
}

export default i18n
