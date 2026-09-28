<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ApiError } from '@/api/request'
import { cancelOrder, getOrders } from '@/api/orders'
import { ORDER_STATUS_LABELS } from '@/data'
import { useMemberStore } from '@/stores/member'
import { formatDate, formatMoney } from '@/utils/format'
import type { OrderView } from '@/types'

const route = useRoute()
const member = useMemberStore()
const orders = ref<OrderView[]>([])
const loading = ref(false)
const errorMessage = ref('')
const successMessage = computed(() =>
  route.query.created ? `订单 ${String(route.query.created)} 已创建。当前订单为待付款状态。` : '',
)

async function loadOrders() {
  if (!member.isAuthenticated) {
    orders.value = []
    return
  }
  loading.value = true
  errorMessage.value = ''
  try {
    orders.value = await getOrders()
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '订单暂时无法加载。'
  } finally {
    loading.value = false
  }
}

async function cancel(orderNo: string) {
  if (!window.confirm(`确定取消订单 ${orderNo} 吗？`)) return
  try {
    await cancelOrder(orderNo)
    await loadOrders()
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '订单取消失败，请稍后重试。'
  }
}

watch(
  () => member.isAuthenticated,
  authenticated => {
    if (authenticated) void loadOrders()
    else orders.value = []
  },
  { immediate: true },
)
</script>

<template>
  <main class="orders-page page-shell">
    <div class="commerce-heading">
      <div>
        <span class="eyebrow">YOUR ORDERS</span>
        <h1>订单记录</h1>
      </div>
      <span>{{ orders.length }} 笔订单</span>
    </div>

    <p v-if="successMessage" class="orders-notice" role="status">{{ successMessage }}</p>
    <div v-if="!member.isAuthenticated" class="commerce-empty state-panel">
      <strong>登录后查看订单</strong>
      <p>订单记录会安全地保存在你的会员账户中。</p>
      <button class="primary-button" type="button" @click="member.authDialogOpen = true">
        登录 / 注册
      </button>
    </div>
    <div v-else-if="loading" class="commerce-empty state-panel" aria-live="polite">
      <strong>正在查找你的订单…</strong>
    </div>
    <div v-else-if="errorMessage" class="commerce-empty state-panel" role="alert">
      <strong>订单暂时无法加载</strong>
      <p>{{ errorMessage }}</p>
      <button class="text-button" type="button" @click="loadOrders">再试一次 ↗</button>
    </div>
    <div v-else-if="!orders.length" class="commerce-empty state-panel">
      <strong>还没有订单。</strong>
      <p>好物正在等你发现。</p>
      <RouterLink class="primary-button" :to="{ name: 'shop' }">去逛逛 ↗</RouterLink>
    </div>
    <section v-else class="order-list" aria-label="订单列表">
      <article v-for="entry in orders" :key="entry.order.orderNo" class="order-card">
        <div class="order-card__heading">
          <div>
            <span class="eyebrow">ORDER / {{ entry.order.orderNo }}</span>
            <p>下单时间 {{ formatDate(entry.order.createdAt) }}</p>
          </div>
          <span class="order-status" :class="`is-${entry.order.orderStatus.toLowerCase()}`">
            {{ ORDER_STATUS_LABELS[entry.order.orderStatus] || entry.order.orderStatus }}
          </span>
        </div>
        <div v-for="item in entry.items" :key="item.id" class="order-item">
          <div>
            <strong>{{ item.productTitle }}</strong>
            <span>{{ item.skuSnapshot || `SKU ${item.skuId}` }} · × {{ item.quantity }}</span>
          </div>
          <strong>{{ formatMoney(item.itemAmount) }}</strong>
        </div>
        <div class="order-card__footer">
          <span v-if="entry.order.expireAt"
            >请于 {{ formatDate(entry.order.expireAt) }} 前完成付款</span
          >
          <button
            v-if="entry.order.orderStatus === 'PENDING_PAYMENT'"
            class="text-button"
            type="button"
            @click="cancel(entry.order.orderNo)"
          >
            取消订单
          </button>
          <strong>合计 {{ formatMoney(entry.order.payableAmount) }}</strong>
        </div>
      </article>
    </section>
    <p class="orders-footnote">当前后端已支持创建、查询和取消订单，暂未接入在线支付。</p>
  </main>
</template>

<style scoped src="./commerce-view.css"></style>
