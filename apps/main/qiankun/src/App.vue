<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocale } from '@ziven/ui/locale'
import { LocaleSwitch } from '@ziven/ui/LocaleSwitch'
import { useTheme } from '@ziven/ui/theme'
import { ThemeToggle } from '@ziven/ui/ThemeToggle'
import { globalActions } from './qiankun/actions'

const { t, locale: i18nLocale } = useI18n()

const currentPath = ref(window.location.pathname)
function navigate(path: string) {
  window.history.pushState({}, '', path)
  currentPath.value = path
  window.dispatchEvent(new PopStateEvent('popstate'))
}

// 主题由组件库 useTheme 管理（localStorage 持久化，默认 dark，切换即刷新）
const { initTheme } = useTheme()
initTheme()

// 语言统一由组件库 useLocale 管理（localStorage 持久化，默认 zh-CN）
const { locale: uiLocale, initLocale, setLocale } = useLocale()
initLocale()

// 语言变化：同步 vue-i18n、document.lang，并同步主应用全局状态
watch(uiLocale, value => {
  i18nLocale.value = value
  document.documentElement.lang = value === 'zh-CN' ? 'zh-CN' : 'en'
  globalActions.setLanguage(value)
})

onMounted(() => {
  document.documentElement.lang = uiLocale.value === 'zh-CN' ? 'zh-CN' : 'en'

  // 监听 qiankun 全局状态变化（语言同步；主题已由 useTheme 统一管理）
  globalActions.onStateChange(state => {
    if (state.language && state.language !== uiLocale.value) {
      setLocale(state.language)
    }
  }, true)
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-950 transition-colors">
    <!-- 导航栏 -->
    <header
      class="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 transition-colors"
    >
      <div class="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
        <div class="flex items-center gap-3">
          <span
            class="w-7 h-7 rounded-md bg-indigo-500 text-white font-bold flex items-center justify-center"
          >
            Q
          </span>
          <span class="font-bold text-zinc-900 dark:text-white transition-colors">
            {{ t('app.name') }}
          </span>
        </div>

        <div class="flex items-center gap-3">
          <nav class="flex gap-1">
            <button
              class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
              :class="
                currentPath === '/'
                  ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-500'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              "
              @click="navigate('/')"
            >
              {{ t('app.home') }}
            </button>
            <button
              class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
              :class="
                currentPath.startsWith('/gnail-admin')
                  ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-500'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              "
              @click="navigate('/gnail-admin')"
            >
              {{ t('app.adminApp') }}
            </button>
          </nav>

          <!-- 语言切换（组件库 LocaleSwitch） -->
          <span class="ml-2 text-zinc-500 dark:text-zinc-400">
            <LocaleSwitch />
          </span>

          <!-- 主题切换按钮（组件库 ThemeToggle，切换后刷新） -->
          <span class="ml-2 text-zinc-500 dark:text-zinc-400">
            <ThemeToggle />
          </span>
        </div>
      </div>
    </header>

    <!-- 首页内容 -->
    <main
      v-if="currentPath === '/'"
      class="flex-1 flex items-center justify-center p-10 text-center"
    >
      <div>
        <div
          class="w-[72px] h-[72px] rounded-[18px] bg-gradient-to-br from-indigo-500 to-indigo-400 text-white text-[32px] font-extrabold shadow-lg mb-6 mx-auto flex items-center justify-center"
        >
          Q
        </div>
        <h1 class="text-4xl font-extrabold text-zinc-900 dark:text-white mb-2 transition-colors">
          {{ t('app.mfeTitle') }}
        </h1>
        <p class="text-base text-zinc-500 dark:text-zinc-400 mb-8 transition-colors">
          {{ t('app.mfeDesc') }}
        </p>
      </div>
    </main>

    <!-- 子应用容器 -->
    <main v-show="currentPath.startsWith('/gnail-admin')" id="subapp-container" class="flex-1" />
  </div>
</template>
