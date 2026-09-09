<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { theme as antdTheme } from 'ant-design-vue'
import { useLocale, useTheme } from '@ziven/ui'
import i18n, { updateDocumentTitle } from '@/i18n'
import { microActions } from '@/qiankun/actions'

const route = useRoute()

// 主题统一由组件库 useTheme 管理（localStorage 持久化，默认 dark，切换走平滑动画；
// 组件库内部监听 <html>.dark，主应用切换主题时子应用会实时跟随）
const { isDark, initTheme } = useTheme()
initTheme()

// antd 跟随组件库主题：通过 ConfigProvider 的 algorithm 全局切换亮/暗，
// 让 a-table / a-modal 等 antd 组件与组件库 chrome 保持一致，避免「深色外壳 + 白色内容」。
const antdThemeConfig = computed(() => ({
  algorithm: isDark.value ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
}))

// 语言统一由组件库 useLocale 管理（localStorage 持久化，默认 zh-CN）
const { locale, setLocale, initLocale } = useLocale()
initLocale()

// 语言变化：同步 vue-i18n、document.lang、页面标题，并回传主应用（qiankun）
watch(locale, value => {
  i18n.global.locale.value = value
  document.documentElement.lang = value === 'zh-CN' ? 'zh-CN' : 'en'
  updateDocumentTitle(route)
  microActions.setGlobalState({ language: value })
})

// 接收主应用下发的语言切换（qiankun 全局状态）
microActions.onGlobalStateChange(state => {
  if (state.language && state.language !== locale.value) {
    setLocale(state.language)
  }
})
</script>

<template>
  <div class="h-full w-full overflow-hidden">
    <a-config-provider :theme="antdThemeConfig">
      <router-view />
    </a-config-provider>
  </div>
</template>
