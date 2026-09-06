import { computed, nextTick, ref } from 'vue'

export type ThemeMode = 'light' | 'dark'

export interface ThemeColorOption {
  /** 颜色名（用于展示与持久化） */
  name: string
  /** 具体 hex 色值 */
  color: string
}

export interface UseThemeResult {
  theme: typeof theme
  isDark: typeof isDark
  primaryColor: typeof primaryColor
  setTheme: (value: ThemeMode, animate?: boolean) => void
  toggleTheme: (animate?: boolean) => void
  setPrimaryColor: (color: string) => void
  initTheme: () => ThemeMode
}

const THEME_STORAGE_KEY = 'ziven-theme'
const PRIMARY_STORAGE_KEY = 'ziven-primary-color'
const DEFAULT_THEME: ThemeMode = 'dark'

/** 预设主题色（indigo 为默认，参考 vben 风格） */
export const PRIMARY_COLORS: ThemeColorOption[] = [
  { name: 'indigo', color: '#6366f1' },
  { name: 'blue', color: '#3b82f6' },
  { name: 'green', color: '#10b981' },
  { name: 'rose', color: '#f43f5e' },
  { name: 'orange', color: '#f59e0b' },
]

const DEFAULT_PRIMARY_COLOR = PRIMARY_COLORS[0].color

/**
 * @deprecated 请改用 useTheme().primaryColor（现在是响应式的）
 * 保留导出以兼容旧代码。
 */
export const PRIMARY_COLOR = DEFAULT_PRIMARY_COLOR

function loadTheme(): ThemeMode {
  const value = localStorage.getItem(THEME_STORAGE_KEY)
  return value === 'light' || value === 'dark' ? value : DEFAULT_THEME
}

function loadPrimaryColor(): string {
  const value = localStorage.getItem(PRIMARY_STORAGE_KEY)
  return value || DEFAULT_PRIMARY_COLOR
}

function parseHexRgb(hex: string): string {
  const matched = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!matched) {
    return '99 102 241'
  }
  return `${parseInt(matched[1], 16)} ${parseInt(matched[2], 16)} ${parseInt(matched[3], 16)}`
}

// 模块级单例：全应用共享同一份主题状态（默认 dark）
const theme = ref<ThemeMode>(loadTheme())
const isDark = computed(() => theme.value === 'dark')
const primaryColor = ref<string>(loadPrimaryColor())

function applyTheme(value: ThemeMode) {
  document.documentElement.classList.toggle('dark', value === 'dark')
  document.documentElement.style.colorScheme = value
}

function applyPrimaryColor(color: string) {
  document.documentElement.style.setProperty('--z-primary', color)
  document.documentElement.style.setProperty('--z-primary-rgb', parseHexRgb(color))
  document.documentElement.style.setProperty('--z-primary-soft', `${parseHexRgb(color)} / 0.16`)
}

/** 支持 View Transition 的 Document（用于主题切换的平滑动效） */
type StartViewTransition = (cb: () => void | Promise<void>) => void

/**
 * 平滑执行一次主题状态变更：
 * - 支持 View Transition（Chromium）：整页 cross-fade，观感最顺滑
 * - 不支持时退化为给 <html> 临时挂 .z-theme-transition，走 CSS 颜色过渡
 */
function animateThemeMutate(mutate: () => void | Promise<void>) {
  if (typeof document === 'undefined') {
    mutate()
    return
  }
  const doc = document as unknown as { startViewTransition?: StartViewTransition }
  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(async () => {
      await mutate()
      await nextTick()
    })
    return
  }
  document.documentElement.classList.add('z-theme-transition')
  mutate()
  window.setTimeout(() => {
    document.documentElement.classList.remove('z-theme-transition')
  }, 500)
}

/**
 * 主题 Hook（组件库内置）
 * - 本地存储持久化，默认 dark
 * - 切换默认走平滑动画（不 reload），让 antd/tailwind 主题完整、丝滑地重建
 */
export function useTheme(): UseThemeResult {
  function setTheme(value: ThemeMode, animate = true) {
    if (animate) {
      animateThemeMutate(() => {
        theme.value = value
        localStorage.setItem(THEME_STORAGE_KEY, value)
        applyTheme(value)
      })
      return
    }
    theme.value = value
    localStorage.setItem(THEME_STORAGE_KEY, value)
    applyTheme(value)
  }

  function toggleTheme(animate = true) {
    setTheme(theme.value === 'dark' ? 'light' : 'dark', animate)
  }

  function setPrimaryColor(color: string) {
    primaryColor.value = color
    localStorage.setItem(PRIMARY_STORAGE_KEY, color)
    applyPrimaryColor(color)
  }

  /** 初始化应用到 document（首屏调用，避免主题闪烁） */
  function initTheme(): ThemeMode {
    applyTheme(theme.value)
    applyPrimaryColor(primaryColor.value)
    return theme.value
  }

  return { theme, isDark, primaryColor, setTheme, toggleTheme, setPrimaryColor, initTheme }
}

// 模块加载时立即应用，确保默认 dark 在首屏渲染前生效
if (typeof document !== 'undefined') {
  applyTheme(theme.value)
  applyPrimaryColor(primaryColor.value)
}
