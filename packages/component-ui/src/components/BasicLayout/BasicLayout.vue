<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '../../theme'
import { usePreferences } from '../../preferences'
import { findMenuChain, type BasicMenuItem, type BasicUser } from '../../basic-types'
import Logo from './Logo.vue'
import SiderMenu from './SiderMenu.vue'
import HeaderBar from './HeaderBar.vue'
import type { BreadcrumbItem } from './Breadcrumb.vue'

const props = withDefaults(
  defineProps<{
    menus?: BasicMenuItem[]
    appName?: string
    user?: BasicUser
    breadcrumb?: BreadcrumbItem[]
    searchPlaceholder?: string
  }>(),
  {
    menus: () => [],
    appName: 'Admin',
    user: () => ({}),
    breadcrumb: undefined,
    searchPlaceholder: '搜索',
  },
)

const emit = defineEmits<{ logout: [] }>()

const route = useRoute()
const { isDark } = useTheme()
const { layout, collapsed, toggleCollapsed } = usePreferences()

// 面包屑：优先用外部传入，否则根据菜单树 + 当前路由自动推导
const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  if (props.breadcrumb) {
    return props.breadcrumb
  }
  return findMenuChain(props.menus, route.path).map(item => ({
    title: item.title,
    path: item.path,
  }))
})
</script>

<template>
  <div class="z-admin-layout" :class="`z-admin-layout--${layout}`">
    <!-- 顶部布局 -->
    <template v-if="layout === 'top'">
      <div class="z-topbar">
        <Logo :app-name="appName" />
        <HeaderBar
          layout="top"
          :menus="menus"
          :breadcrumb="[]"
          :user="user"
          :search-placeholder="searchPlaceholder"
          class="z-topbar__header"
          @logout="emit('logout')"
        />
      </div>
      <nav class="z-topbar__menu">
        <SiderMenu :menus="menus" :is-dark="isDark" mode="horizontal" />
      </nav>
      <main class="z-content"><slot /></main>
    </template>

    <!-- 侧边栏布局 -->
    <template v-else>
      <aside class="z-sider" :class="{ 'is-collapsed': collapsed }">
        <Logo :app-name="appName" :collapsed="collapsed" />
        <div class="z-sider__scroll">
          <SiderMenu :menus="menus" :is-dark="isDark" :collapsed="collapsed" />
        </div>
      </aside>

      <div class="z-main">
        <HeaderBar
          layout="sidebar"
          :collapsed="collapsed"
          :menus="menus"
          :breadcrumb="breadcrumbItems"
          :user="user"
          :search-placeholder="searchPlaceholder"
          @logout="emit('logout')"
          @toggle-collapse="toggleCollapsed"
        />
        <main class="z-content"><slot /></main>
      </div>
    </template>
  </div>
</template>

<style scoped>
.z-admin-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
  background: var(--z-bg);
  color: var(--z-text);
}

/* 侧边栏布局 */
.z-admin-layout--sidebar {
  flex-direction: row;
}

.z-sider {
  display: flex;
  flex-direction: column;
  width: 240px;
  flex-shrink: 0;
  background: var(--z-sider-bg);
  border-right: 1px solid var(--z-border);
  transition: width 0.2s ease;
  overflow: hidden;
}

.z-sider.is-collapsed {
  width: 72px;
}

.z-sider__scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.z-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.z-content {
  flex: 1;
  min-height: 0;
  padding: 16px;
  overflow: auto;
  background: var(--z-bg);
}

/* 顶部布局 */
.z-admin-layout--top {
  flex-direction: column;
}

.z-topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 56px;
  padding: 0 16px;
  background: var(--z-header-bg);
  border-bottom: 1px solid var(--z-border);
  backdrop-filter: blur(8px);
}

.z-topbar__header {
  flex: 1;
  min-width: 0;
}

.z-topbar__menu {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 8px;
  border-bottom: 1px solid var(--z-border);
  background: var(--z-bg);
}

.z-topbar__menu :deep(.ant-menu) {
  background: transparent !important;
  border-bottom: none !important;
}
</style>
