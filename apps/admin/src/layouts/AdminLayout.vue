<script setup>
import {
  BulbOutlined,
  DashboardOutlined,
  DownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const store = useAppStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const selectedKeys = computed(() => [route.path])
const openKeys = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  return parts.length > 1 ? [`/${parts[0]}`] : []
})

// 显示真实用户名，未登录时兜底显示"管理员"
const displayName = computed(() => userStore.userInfo?.username || t('header.admin'))

const menuItems = [{ key: '/dashboard', icon: DashboardOutlined, label: 'menu.dashboard' }]

function handleMenuClick({ key }) {
  router.push(key)
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <a-layout class="min-h-screen h-full">
    <a-layout-sider
      v-model:collapsed="store.collapsed"
      :theme="store.theme"
      collapsible
      class="!overflow-auto !h-screen !fixed !left-0 !top-0 !z-10"
      breakpoint="lg"
    >
      <div
        class="flex items-center justify-center h-16 text-white font-bold text-lg whitespace-nowrap"
      >
        <span class="text-blue-500">🐌</span>
        <span v-show="!store.collapsed" class="ml-2">Gnail Admin</span>
      </div>

      <a-menu
        :theme="store.theme"
        mode="inline"
        :selected-keys="selectedKeys"
        :open-keys="openKeys"
        @click="handleMenuClick"
      >
        <a-menu-item v-for="item in menuItems" :key="item.key">
          <component :is="item.icon" />
          <span>{{ t(item.label) }}</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <a-layout
      :style="{ marginLeft: store.collapsed ? '80px' : '200px' }"
      class="transition-all duration-200"
    >
      <a-layout-header
        :theme="store.theme"
        class="!px-4 flex items-center justify-between sticky top-0 z-10 !bg-white dark:!bg-gray-900 shadow-sm"
      >
        <component
          :is="store.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined"
          class="text-lg cursor-pointer hover:text-blue-500 transition-colors"
          @click="store.toggleCollapsed()"
        />

        <a-space>
          <!-- 语言切换 -->
          <a-dropdown>
            <a-button size="small">
              {{ store.locale === 'zh-CN' ? t('language.zhCN') : t('language.enUS') }}
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu @click="({ key }) => store.setLocale(key)">
                <a-menu-item key="zh-CN">
                  {{ t('language.zhCN') }}
                </a-menu-item>
                <a-menu-item key="en-US">
                  {{ t('language.enUS') }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <a-tooltip :title="t('header.toggleTheme')">
            <a-button shape="circle" @click="store.toggleTheme()">
              <template #icon>
                <BulbOutlined />
              </template>
            </a-button>
          </a-tooltip>

          <a-dropdown>
            <a-space class="cursor-pointer">
              <a-avatar size="small">
                <template #icon>
                  <UserOutlined />
                </template>
              </a-avatar>
              <span class="text-sm hidden sm:inline">{{ displayName }}</span>
            </a-space>
            <template #overlay>
              <a-menu>
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined />
                  <span class="ml-2">{{ t('header.logout') }}</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-space>
      </a-layout-header>

      <a-layout-content
        class="w-full h-full m-4 p-6 bg-white dark:bg-gray-800 rounded-lg min-h-[calc(100vh-112px)]"
      >
        <router-view />
      </a-layout-content>

      <a-layout-footer class="text-center text-gray-400 !bg-transparent">
        Gnail Admin ©{{ new Date().getFullYear() }}
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
