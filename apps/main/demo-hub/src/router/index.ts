import { createRouter, createWebHistory } from 'vue-router'
import DemoDetailView from '@/views/DemoDetailView.vue'
import DemoHubView from '@/views/DemoHubView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

function getBasePath() {
  return window.location.pathname.startsWith('/demo-hub') ? '/demo-hub/' : '/'
}

const router = createRouter({
  history: createWebHistory(getBasePath()),
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
