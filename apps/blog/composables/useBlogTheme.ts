/**
 * 明暗主题：切换 <html>.dark 类并持久化到 localStorage（客户端生效）
 */
export function useBlogTheme() {
  const isDark = ref(false)

  function apply(dark: boolean) {
    document.documentElement.classList.toggle('dark', dark)
  }

  function init() {
    if (!import.meta.client) {
      return
    }
    const saved = localStorage.getItem('blog-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = saved ? saved === 'dark' : prefersDark
    apply(isDark.value)
  }

  function toggle() {
    isDark.value = !isDark.value
    localStorage.setItem('blog-theme', isDark.value ? 'dark' : 'light')
    apply(isDark.value)
  }

  onMounted(init)
  return { isDark, init, toggle }
}
