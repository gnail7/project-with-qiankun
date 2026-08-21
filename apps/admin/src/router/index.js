import { createRouter, createWebHistory } from 'vue-router'
import { updateDocumentTitle } from '@/i18n'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/index.vue'),
    meta: { titleKey: 'login.loginTitle' },
  },
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/pages/dashboard/index.vue'),
        meta: { titleKey: 'menu.dashboard', icon: 'DashboardOutlined' },
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

// 路由守卫：未登录跳登录页；同时根据 meta.titleKey 设置页面标题
router.beforeEach((to) => {
  const userStore = useUserStore()
  if (to.path !== '/login' && !userStore.token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  updateDocumentTitle(to)
})

export default router
