import { computed, ref } from 'vue'

export type ThemeMode = 'light' | 'dark'

export interface UseThemeResult {
  theme: typeof theme
  isDark: typeof isDark
  setTheme: (value: ThemeMode, reload?: boolean) => void
  toggleTheme: (reload?: boolean) => void
  initTheme: () => ThemeMode
}

const STORAGE_KEY = 'ziven-theme'
const DEFAULT_THEME: ThemeMode = 'dark'

function loadTheme(): ThemeMode {
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'light' || value === 'dark' ? value : DEFAULT_THEME
}

// 模块级单例：全应用共享同一份主题状态（默认 dark）
const theme = ref<ThemeMode>(loadTheme())
const isDark = computed(() => theme.value === 'dark')

function applyTheme(value: ThemeMode) {
  document.documentElement.classList.toggle('dark', value === 'dark')
  document.documentElement.style.colorScheme = value
}

/**
 * 主题 Hook（组件库内置）
 * - 本地存储持久化，默认 dark
 * - 切换后可通过 reload=true 触发页面刷新，让 antd/tailwind 主题完整重建
 */
export function useTheme(): UseThemeResult {
  function setTheme(value: ThemeMode, reload = false) {
    theme.value = value
    localStorage.setItem(STORAGE_KEY, value)
    applyTheme(value)
    if (reload) {
      window.location.reload()
    }
  }

  function toggleTheme(reload = true) {
    setTheme(theme.value === 'dark' ? 'light' : 'dark', reload)
  }

  /** 初始化应用到 document（首屏调用，避免主题闪烁） */
  function initTheme(): ThemeMode {
    applyTheme(theme.value)
    return theme.value
  }

  return { theme, isDark, setTheme, toggleTheme, initTheme }
}

// 模块加载时立即应用，确保默认 dark 在首屏渲染前生效
if (typeof document !== 'undefined') {
  applyTheme(theme.value)
}
