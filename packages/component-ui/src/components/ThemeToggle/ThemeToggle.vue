<script setup lang="ts">
import { useTheme } from '../../theme'

// 主题切换按钮：点击切换主题（默认触发刷新，让 antd/tailwind 主题完整重建）
const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    type="button"
    class="z-theme-toggle"
    :title="isDark ? '切换亮色' : '切换暗色'"
    @click="toggleTheme()"
  >
    <svg v-if="isDark" viewBox="0 0 24 24" class="z-theme-toggle__icon">
      <path
        fill="currentColor"
        d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-.5-8.5a.75.75 0 0 1 .5.7v1.4a.75.75 0 0 1-1.5 0V8.2c0-.3.17-.56.42-.7Zm0 8.5a.75.75 0 0 1-.58-.7v-1.4a.75.75 0 1 1 1.5 0v1.4c0 .3-.17.56-.42.7Zm6.1-6.1a.75.75 0 0 1-.7.5h-1.4a.75.75 0 1 1 0-1.5h1.4c.3 0 .56.17.7.42Zm-8.5 0a.75.75 0 0 1-.7-.5.75.75 0 0 1 .7-.92h1.4a.75.75 0 1 1 0 1.5h-1.4ZM17 9a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm-8.5 4.5a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0Zm8.5 0a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0Zm-7.5-3.7a.75.75 0 1 1 1.06 1.06.75.75 0 0 1-1.06-1.06ZM11.5 13.14a.75.75 0 1 1 1.06 1.06.75.75 0 0 1-1.06-1.06Zm-1.1-5.36a.75.75 0 1 1 1.06-1.06.75.75 0 0 1-1.06 1.06Zm4.72 4.72a.75.75 0 1 1 1.06-1.06.75.75 0 0 1-1.06 1.06Zm-1.06-1.06a.75.75 0 1 1-1.06 1.06.75.75 0 0 1 1.06-1.06Zm3.1-3.66a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
      />
    </svg>
    <svg v-else viewBox="0 0 24 24" class="z-theme-toggle__icon">
      <path
        fill="currentColor"
        d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 0 1-4.4 2.26 5.4 5.4 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1Zm0 2a7 7 0 0 1 6.9 5.7 3.4 3.4 0 0 1-7.6 0A7 7 0 0 1 12 5Z"
      />
    </svg>
  </button>
</template>

<style scoped>
.z-theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: 1px solid transparent;
  border-radius: 9999px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.z-theme-toggle:hover {
  background-color: rgba(127, 127, 127, 0.12);
}

.z-theme-toggle__icon {
  width: 18px;
  height: 18px;
}
</style>
