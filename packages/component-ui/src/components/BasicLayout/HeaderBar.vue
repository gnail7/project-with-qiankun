<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  BellOutlined,
} from '@ant-design/icons-vue'
import type { LayoutMode } from '../../preferences'
import type { BasicUser, BasicMenuItem } from '../../basic-types'
import AppSearch from '../AppSearch/AppSearch.vue'
import PreferencesDrawer from '../PreferencesDrawer/PreferencesDrawer.vue'
import LocaleSwitch from '../LocaleSwitch/LocaleSwitch.vue'
import ThemeToggle from '../ThemeToggle/ThemeToggle.vue'
import UserDropdown from './UserDropdown.vue'
import Breadcrumb, { type BreadcrumbItem } from './Breadcrumb.vue'

withDefaults(
  defineProps<{
    layout?: LayoutMode
    collapsed?: boolean
    menus?: BasicMenuItem[]
    breadcrumb?: BreadcrumbItem[]
    user?: BasicUser
    searchPlaceholder?: string
  }>(),
  {
    layout: 'sidebar',
    collapsed: false,
    menus: () => [],
    breadcrumb: () => [],
    user: () => ({}),
    searchPlaceholder: '搜索',
  },
)

const emit = defineEmits<{ logout: []; toggleCollapse: [] }>()

const isFullscreen = ref(false)

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
}

function onFullscreenChange() {
  isFullscreen.value = Boolean(document.fullscreenElement)
}

onMounted(() => document.addEventListener('fullscreenchange', onFullscreenChange))
onUnmounted(() => document.removeEventListener('fullscreenchange', onFullscreenChange))
</script>

<template>
  <header class="z-header">
    <div class="z-header__left">
      <button
        v-if="layout === 'sidebar'"
        type="button"
        class="z-header__icon-btn"
        :title="collapsed ? '展开' : '收起'"
        @click="emit('toggleCollapse')"
      >
        <MenuUnfoldOutlined v-if="collapsed" />
        <MenuFoldOutlined v-else />
      </button>

      <Breadcrumb :items="breadcrumb" />
    </div>

    <div class="z-header__right">
      <AppSearch :menus="menus" :placeholder="searchPlaceholder" />

      <PreferencesDrawer />

      <LocaleSwitch />

      <ThemeToggle />

      <button type="button" class="z-header__icon-btn" title="全屏" @click="toggleFullscreen">
        <FullscreenExitOutlined v-if="isFullscreen" />
        <FullscreenOutlined v-else />
      </button>

      <button type="button" class="z-header__icon-btn" title="消息">
        <BellOutlined />
      </button>

      <UserDropdown :user="user" @logout="emit('logout')" />
    </div>
  </header>
</template>

<style scoped>
.z-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 56px;
  padding: 0 16px;
}

.z-header__left,
.z-header__right {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.z-header__right {
  margin-left: auto;
}

.z-header__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--z-text-muted);
  font-size: 16px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.z-header__icon-btn:hover {
  background: var(--z-hover);
  color: var(--z-text);
}
</style>
