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
  const value = typeof localStorage === 'undefined' ? null : localStorage.getItem(THEME_STORAGE_KEY)
  return value === 'light' || value === 'dark' ? value : DEFAULT_THEME
}

function loadPrimaryColor(): string {
  const value =
    typeof localStorage === 'undefined' ? null : localStorage.getItem(PRIMARY_STORAGE_KEY)
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
  if (typeof document === 'undefined') {
    return
  }
  document.documentElement.classList.toggle('dark', value === 'dark')
  document.documentElement.style.colorScheme = value
}

function applyPrimaryColor(color: string) {
  if (typeof document === 'undefined') {
    return
  }
  document.documentElement.style.setProperty('--z-primary', color)
  document.documentElement.style.setProperty('--z-primary-rgb', parseHexRgb(color))
  document.documentElement.style.setProperty('--z-primary-soft', `${parseHexRgb(color)} / 0.16`)
}

/**
 * 以 <html> 上的 `.dark` class 作为跨微前端（qiankun 主/子应用各自打包、各自持有一份
 * 本模块单例）共享的唯一事实来源，把本地 `theme` ref 与实际 DOM 保持同步。
 * 任一应用切换主题，其它应用持有的 isDark/theme 都会随之响应式更新，从而带动
 * antd（ConfigProvider algorithm）、Tailwind dark: 等一并切换，避免「深色外壳 + 白色内容」。
 */
function syncThemeFromDom() {
  const isDarkNow = document.documentElement.classList.contains('dark')
  const next: ThemeMode = isDarkNow ? 'dark' : 'light'
  if (theme.value !== next) {
    theme.value = next
    // 把其它端已应用的切换持久化，避免刷新后主题回跳
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    }
  }
  document.documentElement.style.colorScheme = next
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
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(THEME_STORAGE_KEY, value)
        }
        applyTheme(value)
      })
      return
    }
    theme.value = value
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, value)
    }
    applyTheme(value)
  }

  function toggleTheme(animate = true) {
    setTheme(theme.value === 'dark' ? 'light' : 'dark', animate)
  }

  function setPrimaryColor(color: string) {
    primaryColor.value = color
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PRIMARY_STORAGE_KEY, color)
    }
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

  // 监听 <html> class 变化，让主/子应用（qiankun 各自 bundle）的主题状态实时一致。
  // 任一端切换，其它端的 isDark/theme 都会跟随并作用于 antd 等组件库。
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(syncThemeFromDom)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    syncThemeFromDom()
  }
}
