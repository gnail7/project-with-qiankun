import { computed, ref } from 'vue'

export type LocaleCode = 'zh-CN' | 'en-US'

export interface UseLocaleResult {
  locale: typeof locale
  isZh: typeof isZh
  setLocale: (value: LocaleCode, reload?: boolean) => void
  toggleLocale: (reload?: boolean) => void
  initLocale: () => LocaleCode
}

const STORAGE_KEY = 'ziven-locale'
const DEFAULT_LOCALE: LocaleCode = 'zh-CN'

function load(): LocaleCode {
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'en-US' || value === 'zh-CN' ? value : DEFAULT_LOCALE
}

// 模块级单例：全应用共享同一份语言状态（默认 zh-CN）
const locale = ref<LocaleCode>(load())
const isZh = computed(() => locale.value === 'zh-CN')

/**
 * 语言 Hook（组件库内置）
 * - 本地存储持久化，默认 zh-CN
 * - 消费方通过 watch(locale) 同步 vue-i18n / 依赖语言的行为
 */
export function useLocale(): UseLocaleResult {
  function setLocale(value: LocaleCode, reload = false) {
    locale.value = value
    localStorage.setItem(STORAGE_KEY, value)
    document.documentElement.lang = value === 'zh-CN' ? 'zh-CN' : 'en'
    if (reload) {
      window.location.reload()
    }
  }

  function toggleLocale(reload = false) {
    setLocale(locale.value === 'zh-CN' ? 'en-US' : 'zh-CN', reload)
  }

  function initLocale(): LocaleCode {
    document.documentElement.lang = locale.value === 'zh-CN' ? 'zh-CN' : 'en'
    return locale.value
  }

  return { locale, isZh, setLocale, toggleLocale, initLocale }
}

// 模块加载时立即应用 document.lang
if (typeof document !== 'undefined') {
  document.documentElement.lang = locale.value === 'zh-CN' ? 'zh-CN' : 'en'
}
