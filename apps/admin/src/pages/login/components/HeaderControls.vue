<script setup>
import { message } from 'ant-design-vue'
import { AppstoreOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import { LocaleSwitch, useLocale, useTheme, ThemeToggle } from '@ziven/ui'
import { useAppStore } from '@/stores/app'

const { t } = useI18n()
const appStore = useAppStore()
const { isDark, toggleTheme } = useTheme()
const { locale, setLocale } = useLocale()

function onLocaleRadio(e) {
  setLocale(e.target.value)
}

function onLayoutRadio(e) {
  appStore.setLayout(e.target.value)
}

function onToggleLayout() {
  appStore.toggleLayout()
  message.info(
    `${t('login.layoutChanged')}：${appStore.layout === 'sidebar' ? t('login.layoutSidebar') : t('login.layoutTop')}`,
  )
}
</script>

<template>
  <div class="absolute right-6 top-6 z-20 flex items-center gap-2">
    <!-- 主题切换（组件库 ThemeToggle，切换后刷新） -->
    <ThemeToggle />

    <!-- 布局切换 -->
    <a-tooltip :title="t('login.layoutToggle')">
      <button
        class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500 ring-1 ring-black/5 transition-colors hover:text-indigo-500 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-white/10 dark:hover:text-indigo-400"
        @click="onToggleLayout"
      >
        <AppstoreOutlined />
      </button>
    </a-tooltip>

    <!-- 语言切换（组件库 LocaleSwitch） -->
    <LocaleSwitch />

    <!-- 设置 -->
    <a-popover placement="bottomRight" trigger="click">
      <template #content>
        <div class="w-60 space-y-4 p-1">
          <div class="text-sm font-semibold text-gray-800 dark:text-zinc-100">
            {{ t('login.settingsTitle') }}
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-zinc-300">
              {{ t('header.toggleTheme') }}
            </span>
            <a-switch :checked="isDark" size="small" @change="toggleTheme" />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-zinc-300">
              {{ t('header.language') }}
            </span>
            <a-radio-group :value="locale" size="small" @change="onLocaleRadio">
              <a-radio-button value="zh-CN">中</a-radio-button>
              <a-radio-button value="en-US">EN</a-radio-button>
            </a-radio-group>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-zinc-300">
              {{ t('login.layoutToggle') }}
            </span>
            <a-radio-group :value="appStore.layout" size="small" @change="onLayoutRadio">
              <a-radio-button value="sidebar">{{ t('login.layoutSidebar') }}</a-radio-button>
              <a-radio-button value="top">{{ t('login.layoutTop') }}</a-radio-button>
            </a-radio-group>
          </div>
        </div>
      </template>
      <button
        class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500 ring-1 ring-black/5 transition-colors hover:text-indigo-500 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-white/10 dark:hover:text-indigo-400"
      >
        <SettingOutlined />
      </button>
    </a-popover>
  </div>
</template>
