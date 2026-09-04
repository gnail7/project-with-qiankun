<script setup>
import { theme } from 'ant-design-vue'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useLocale, useTheme, PRIMARY_COLOR } from '@ziven/ui'
import i18n, { updateDocumentTitle } from '@/i18n'
import { microActions } from '@/qiankun/actions'

const route = useRoute()

// 主题统一由组件库 useTheme 管理（localStorage 持久化，默认 dark，切换即刷新）
const { isDark, initTheme } = useTheme()
initTheme()

// 语言统一由组件库 useLocale 管理（localStorage 持久化，默认 zh-CN）
const { locale, setLocale, initLocale } = useLocale()
initLocale()

// antd 主题：主色 + vben 风格暗色背景（近黑布局 + 深灰卡片）
const antdTheme = computed(() => {
  if (isDark.value) {
    return {
      algorithm: theme.darkAlgorithm,
      token: {
        colorPrimary: PRIMARY_COLOR,
        colorBgContainer: '#18181b',
        colorBgElevated: '#18181b',
        colorBgLayout: '#0a0a0a',
        colorBorder: 'rgba(255, 255, 255, 0.14)',
        colorBorderSecondary: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 6,
      },
      components: {
        Layout: {
          siderBg: '#0a0a0a',
          headerBg: '#0a0a0a',
          bodyBg: '#0a0a0a',
        },
        Menu: {
          darkItemBg: '#0a0a0a',
          darkSubMenuItemBg: '#0a0a0a',
          darkPopupBg: '#18181b',
          darkItemColor: 'rgba(255, 255, 255, 0.65)',
          darkItemHoverBg: 'rgba(255, 255, 255, 0.06)',
          darkItemSelectedBg: 'rgba(99, 102, 241, 0.16)',
          darkItemSelectedColor: PRIMARY_COLOR,
        },
      },
    }
  }
  return {
    algorithm: theme.defaultAlgorithm,
    token: {
      colorPrimary: PRIMARY_COLOR,
      borderRadius: 6,
    },
  }
})

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
  <div class="w-screen h-screen" style="height: 100vh">
    <a-config-provider :theme="antdTheme">
      <router-view />
    </a-config-provider>
  </div>
</template>
