<script setup>
import { theme } from 'ant-design-vue'
import { computed, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import i18n, { updateDocumentTitle } from '@/i18n'
import { microActions } from '@/qiankun/actions'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const route = useRoute()

watchEffect(() => {
  document.documentElement.classList.toggle('dark', appStore.theme === 'dark')
})

// antd 主题：跟随全局暗色模式，主色改为 indigo（与 vben 风格一致）
const antdTheme = computed(() => ({
  algorithm:
    appStore.theme === 'dark'
      ? theme.darkAlgorithm
      : theme.defaultAlgorithm,
  token: {
    colorPrimary: '#6366f1',
    borderRadius: 6,
  },
}))

// 语言变化时同步 document.lang 和页面标题
watch(
  () => i18n.global.locale.value,
  () => {
    document.documentElement.lang
      = i18n.global.locale.value === 'zh-CN' ? 'zh-CN' : 'en'
    updateDocumentTitle(route)
  },
)

// 接收主应用下发的语言切换（qiankun 全局状态）
microActions.onGlobalStateChange((state) => {
  if (state.language && state.language !== appStore.locale) {
    appStore.setLocale(state.language)
  }
})
</script>

<template>
  <div class="w-screen h-screen" style="height: 100vh">
    <a-config-provider :theme="antdTheme">
      <router-view />
    </a-config-provider>
  </div>
</template>
