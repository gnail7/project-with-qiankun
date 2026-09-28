import { createRouter, createWebHistory } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import DemoDetailView from '@/views/DemoDetailView.vue'
import DemoHubView from '@/views/DemoHubView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(qiankunWindow.__POWERED_BY_QIANKUN__ ? '/demo-hub/' : '/'),
  routes: [
    {
      path: '/',
      name: 'hub',
      component: DemoHubView,
    },
    {
      path: '/demo/:id',
      name: 'demo-detail',
      component: DemoDetailView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

export default router
