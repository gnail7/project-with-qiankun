<script setup lang="ts">
import { useTheme } from '../../theme'

// 主题切换按钮：点击切换主题（默认走 View Transition 平滑动画，不刷新页面）
const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    type="button"
    class="z-theme-toggle"
    :title="isDark ? '切换亮色' : '切换暗色'"
    @click="toggleTheme()"
  >
    <Transition name="z-theme-icon" mode="out-in">
      <svg v-if="isDark" key="dark" viewBox="0 0 24 24" class="z-theme-toggle__icon">
        <path
          fill="currentColor"
          d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-.5-8.5a.75.75 0 0 1 .5.7v1.4a.75.75 0 0 1-1.5 0V8.2c0-.3.17-.56.42-.7Zm0 8.5a.75.75 0 0 1-.58-.7v-1.4a.75.75 0 1 1 1.5 0v1.4c0 .3-.17.56-.42.7Zm6.1-6.1a.75.75 0 0 1-.7.5h-1.4a.75.75 0 1 1 0-1.5h1.4c.3 0 .56.17.7.42Zm-8.5 0a.75.75 0 0 1-.7-.5.75.75 0 0 1 .7-.92h1.4a.75.75 0 1 1 0 1.5h-1.4ZM17 9a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm-8.5 4.5a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0Zm8.5 0a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0Zm-7.5-3.7a.75.75 0 1 1 1.06 1.06.75.75 0 0 1-1.06-1.06ZM11.5 13.14a.75.75 0 1 1 1.06 1.06.75.75 0 0 1-1.06-1.06Zm-1.1-5.36a.75.75 0 1 1 1.06-1.06.75.75 0 0 1-1.06 1.06Zm4.72 4.72a.75.75 0 1 1 1.06-1.06.75.75 0 0 1-1.06 1.06Zm-1.06-1.06a.75.75 0 1 1-1.06 1.06.75.75 0 0 1 1.06-1.06Zm3.1-3.66a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>
      <svg v-else key="light" viewBox="0 0 24 24" class="z-theme-toggle__icon">
        <path
          fill="currentColor"
          d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 0 1-4.4 2.26 5.4 5.4 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1Zm0 2a7 7 0 0 1 6.9 5.7 3.4 3.4 0 0 1-7.6 0A7 7 0 0 1 12 5Z"
        />
      </svg>
    </Transition>
  </button>
</template>

<style>
/**
 * 全局主题令牌（非 scoped，全应用生效）
 * 亮/暗通过 .dark class 切换；--z-primary/-rgb/-soft 由 useTheme.setPrimaryColor 写入 <html> 覆盖默认值。
 */
:root {
  --z-bg: #f5f5f6;
  --z-card-bg: #ffffff;
  --z-sider-bg: #ffffff;
  --z-header-bg: rgba(255, 255, 255, 0.7);
  --z-text: #18181b;
  --z-text-muted: #71717a;
  --z-border: rgba(0, 0, 0, 0.08);
  --z-hover: rgba(127, 127, 127, 0.12);
  --z-primary: #6366f1;
  --z-primary-rgb: 99 102 241;
  --z-primary-soft: rgba(99, 102, 241, 0.16);
}

html.dark {
  --z-bg: #0a0a0a;
  --z-card-bg: #18181b;
  --z-sider-bg: #0a0a0a;
  --z-header-bg: rgba(10, 10, 10, 0.7);
  --z-text: #e4e4e7;
  --z-text-muted: #a1a1aa;
  --z-border: rgba(255, 255, 255, 0.1);
  --z-hover: rgba(255, 255, 255, 0.06);
}

/* 不支持 View Transition 时的主题切换回退动画 */
.z-theme-transition,
.z-theme-transition *,
.z-theme-transition *::before,
.z-theme-transition *::after {
  transition:
    background-color 0.35s ease,
    color 0.35s ease,
    border-color 0.35s ease,
    fill 0.35s ease,
    box-shadow 0.35s ease !important;
}
</style>

<style scoped>
.z-theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 34px;
  flex-shrink: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--z-text-muted, #71717a);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;
}

.z-theme-toggle:hover {
  background-color: var(--z-hover, rgba(127, 127, 127, 0.12));
  color: var(--z-text, #18181b);
}

.z-theme-toggle:active {
  transform: scale(0.92);
}

.z-theme-toggle__icon {
  width: 18px;
  height: 18px;
}

.z-theme-icon-enter-active,
.z-theme-icon-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.z-theme-icon-enter-from {
  transform: rotate(-120deg) scale(0.4);
  opacity: 0;
}

.z-theme-icon-leave-to {
  transform: rotate(120deg) scale(0.4);
  opacity: 0;
}
</style>
