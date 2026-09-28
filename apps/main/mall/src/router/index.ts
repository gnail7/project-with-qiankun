import { createRouter, createWebHistory } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import CartView from '@/views/CartView.vue'
import OrdersView from '@/views/OrdersView.vue'
import ProductDetailView from '@/views/ProductDetailView.vue'
import ShopView from '@/views/ShopView.vue'

const router = createRouter({
  history: createWebHistory(qiankunWindow.__POWERED_BY_QIANKUN__ ? '/mall/' : '/'),
  routes: [
    { path: '/', name: 'shop', component: ShopView },
    { path: '/products/:skuId', name: 'product', component: ProductDetailView },
    { path: '/cart', name: 'cart', component: CartView },
    { path: '/orders', name: 'orders', component: OrdersView },
    { path: '/:pathMatch(.*)*', redirect: { name: 'shop' } },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
