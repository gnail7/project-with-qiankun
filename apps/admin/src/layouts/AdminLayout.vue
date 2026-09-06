<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { DashboardOutlined } from '@ant-design/icons-vue'
import { BasicLayout } from '@ziven/ui/BasicLayout'
import type { BasicMenuItem } from '@ziven/ui/BasicLayout'
import { usePermissionStore } from '@/stores/permission'
import { resetDynamicRoutes } from '@/router'
import { useUserStore } from '@/stores/user'
import { joinMenuPath, resolveComponent, resolveIcon } from '@/utils/menu'

interface BackendMenuNode {
  menuId: number
  menuName: string
  parentId?: number
  path?: string
  component?: string
  menuType?: 'M' | 'C' | 'F'
  visible?: string
  status?: string
  perms?: string
  icon?: string
  children?: BackendMenuNode[]
}

const { t } = useI18n()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const router = useRouter()

/** 后端菜单树 → BasicLayout 菜单节点（跳过按钮/隐藏/无页面项，title 用 menu_name） */
function mapMenus(list: BackendMenuNode[] = [], parentPath = ''): BasicMenuItem[] {
  const result: BasicMenuItem[] = []
  list.forEach(item => {
    if (item.menuType === 'F') {
      return
    }
    const fullPath = joinMenuPath(parentPath, item.path)
    if (item.menuType === 'M') {
      const children = mapMenus(item.children || [], fullPath)
      if (children.length) {
        result.push({
          path: fullPath,
          title: item.menuName,
          icon: resolveIcon(item.icon),
          children,
        })
      }
      return
    }
    // C 菜单：隐藏项不进侧边栏；找不到页面组件也不展示
    if (item.visible === '1') {
      return
    }
    if (!resolveComponent(item.component)) {
      return
    }
    result.push({ path: fullPath, title: item.menuName, icon: resolveIcon(item.icon) })
  })
  return result
}

/** 仪表盘为固定落地页，始终置顶；其余菜单完全由后端菜单树驱动 */
const menus = computed<BasicMenuItem[]>(() => [
  { path: '/dashboard', title: t('menu.dashboard'), icon: DashboardOutlined },
  ...mapMenus(permissionStore.menus as BackendMenuNode[]),
])

const user = computed(() => ({
  name: userStore.userInfo?.userName,
  nickname: userStore.userInfo?.nickName,
  avatar: userStore.userInfo?.avatar,
}))

function handleLogout() {
  userStore.logout()
  permissionStore.reset()
  resetDynamicRoutes()
  router.push('/login')
}
</script>

<template>
  <BasicLayout :menus="menus" app-name="Gnail Admin" :user="user" @logout="handleLogout">
    <router-view />
  </BasicLayout>
</template>
