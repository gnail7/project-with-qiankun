<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { globalActions } from './qiankun/actions'

const { t, locale } = useI18n()

const currentPath = ref(window.location.pathname)
const isDark = ref(false)
const appLocale = ref<string>(locale.value)
function navigate(path: string) {
  window.history.pushState({}, '', path)
  currentPath.value = path
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function toggleTheme() {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  document.documentElement.classList.toggle('dark', isDark.value)
  globalActions.setTheme(theme)
}

function setLocale(lang: string) {
  locale.value = lang
  appLocale.value = lang
  localStorage.setItem('locale', lang)
  document.documentElement.lang = lang === 'zh-CN' ? 'zh-CN' : 'en'
  // 通过 qiankun 全局状态同步给子应用
  globalActions.setLanguage(lang)
}

onMounted(() => {
  // 初始化时检查系统偏好
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (prefersDark) {
    isDark.value = true
    document.documentElement.classList.add('dark')
    globalActions.setTheme('dark')
  }

  document.documentElement.lang = locale.value === 'zh-CN' ? 'zh-CN' : 'en'

  // 监听 qiankun 全局状态变化
  globalActions.onStateChange((state, prev) => {
    if (state.theme !== prev?.theme) {
      isDark.value = state.theme === 'dark'
      document.documentElement.classList.toggle('dark', state.theme === 'dark')
    }
    if (state.language && state.language !== prev?.language) {
      locale.value = state.language
      appLocale.value = state.language
      document.documentElement.lang = state.language === 'zh-CN' ? 'zh-CN' : 'en'
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

          <!-- 语言切换 -->
          <div class="flex items-center gap-1 ml-2">
            <button
              class="h-8 px-2.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer"
              :class="
                appLocale === 'zh-CN'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-500'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              "
              @click="setLocale('zh-CN')"
            >
              中
            </button>
            <button
              class="h-8 px-2.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer"
              :class="
                appLocale === 'en-US'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-500'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              "
              @click="setLocale('en-US')"
            >
              EN
            </button>
          </div>

          <!-- 主题切换按钮 -->
          <button
            class="w-8 h-8 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer ml-2"
            :title="isDark ? t('app.toggleLight') : t('app.toggleDark')"
            @click="toggleTheme"
          >
            <!-- 太阳图标（暗色模式下显示） -->
            <svg
              v-if="isDark"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <!-- 月亮图标（亮色模式下显示） -->
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
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
