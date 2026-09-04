import { createRouter, createWebHistory } from 'vue-router'
import { updateDocumentTitle } from '@/i18n'
import { usePermissionStore } from '@/stores/permission'
import { useUserStore } from '@/stores/user'

export const LAYOUT_NAME = 'AdminLayout'

// 静态路由：登录页、布局（默认仪表盘）、404
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/index.vue'),
    meta: { titleKey: 'login.loginTitle' },
  },
  {
    path: '/',
    name: LAYOUT_NAME,
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/pages/dashboard/index.vue'),
        meta: { titleKey: 'menu.dashboard' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/404.vue'),
    meta: { titleKey: 'notFound.title' },
  },
]

const router = createRouter({
  history: createWebHistory('/gnail-admin'),
  routes,
})

/**
 * 把权限过滤后的叶子菜单注册为 AdminLayout 的子路由
 */
let dynamicNames = []

function addDynamicRoutes(menus) {
  const names = []
  menus.forEach(item => {
    if (item.children?.length) {
      names.push(...addDynamicRoutes(item.children))
      return
    }
    if (!item.component) {
      return
    }
    router.addRoute(LAYOUT_NAME, {
      path: item.path,
      name: item.name,
      component: item.component,
      meta: { titleKey: item.titleKey, permission: item.permission },
    })
    names.push(item.name)
  })
  return names
}

/** 退出登录时移除动态路由，供下次登录重新生成 */
export function resetDynamicRoutes() {
  dynamicNames.forEach(name => {
    if (router.hasRoute(name)) {
      router.removeRoute(name)
    }
  })
  dynamicNames = []
}

/**
 * 路由守卫：
 * 1. 未登录跳登录页（带 redirect）
 * 2. 已登录但权限未加载 → 拉取 /auth/me → 注册动态路由 → 重新进入目标路由
 */
router.beforeEach(async to => {
  const userStore = useUserStore()
  if (to.path === '/login') {
    updateDocumentTitle(to)
    return true
  }
  if (!userStore.token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  const permissionStore = usePermissionStore()
  if (!permissionStore.loaded) {
    try {
      await permissionStore.load()
      dynamicNames = addDynamicRoutes(permissionStore.menus)
      return { path: to.fullPath, replace: true }
    } catch (error) {
      // 拉取用户信息失败（token 失效等）→ 登出回登录页
      console.error('加载用户权限失败', error)
      userStore.logout()
      permissionStore.reset()
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }
  updateDocumentTitle(to)
  return true
})

export default router
