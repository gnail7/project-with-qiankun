import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const collapsed = ref(false)
  // 布局模式：sidebar（侧边栏） | top（顶部）
  const layout = ref(localStorage.getItem('layout') || 'sidebar')

  const toggleCollapsed = () => {
    collapsed.value = !collapsed.value
  }

  const toggleLayout = () => {
    setLayout(layout.value === 'sidebar' ? 'top' : 'sidebar')
  }

  const setLayout = value => {
    layout.value = value
    localStorage.setItem('layout', value)
  }

  return {
    collapsed,
    layout,
    toggleCollapsed,
    toggleLayout,
    setLayout,
  }
})
