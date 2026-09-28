<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ApiError } from '@/api/request'
import { deleteCartItem } from '@/api/cart'
import { createOrder } from '@/api/orders'
import ProductArtwork from '@/components/ProductArtwork.vue'
import { useCartStore } from '@/stores/cart'
import { useMemberStore } from '@/stores/member'
import { loadCartLines } from '@/services/catalogService'
import { formatMoney } from '@/utils/format'
import type { CartLine } from '@/types'

const router = useRouter()
const member = useMemberStore()
const cart = useCartStore()
const lines = ref<CartLine[]>([])
const loading = ref(false)
const checkingOut = ref(false)
const errorMessage = ref('')
const noticeMessage = ref('')

const subtotal = computed(() =>
  lines.value.reduce((sum, line) => {
    return sum + Number(line.product?.sku.salePrice ?? 0) * line.quantity
  }, 0),
)
const canCheckout = computed(
  () => lines.value.length > 0 && lines.value.every(line => line.product !== null),
)

async function loadLines() {
  if (!member.isAuthenticated) {
    lines.value = []
    return
  }
  loading.value = true
  errorMessage.value = ''
  try {
    await cart.refresh()
    lines.value = await loadCartLines(cart.items)
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '购物袋暂时无法加载。'
  } finally {
    loading.value = false
  }
}

async function changeQuantity(line: CartLine, delta: number) {
  const quantity = Math.max(1, Math.min(999, line.quantity + delta))
  if (quantity === line.quantity) return
  try {
    await cart.setQuantity(line.skuId, quantity)
    await loadLines()
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '数量更新失败，请重试。'
  }
}

async function removeLine(line: CartLine) {
  try {
    await cart.remove(line.skuId)
    lines.value = lines.value.filter(item => item.skuId !== line.skuId)
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '暂时无法移除该商品。'
  }
}

async function checkout() {
  if (!member.isAuthenticated) {
    member.authDialogOpen = true
    return
  }
  if (!canCheckout.value) return
  checkingOut.value = true
  errorMessage.value = ''
  try {
    const items = [...lines.value]
    const order = await createOrder(
      items.map(line => ({ skuId: line.skuId, quantity: line.quantity })),
    )
    const cleanup = await Promise.allSettled(items.map(line => deleteCartItem(line.skuId)))
    cart.items = items.filter((_, index) => cleanup[index].status === 'rejected')
    if (cleanup.some(result => result.status === 'rejected')) {
      noticeMessage.value = '订单已创建，部分购物袋商品未能自动移除。'
    }
    await router.push({ name: 'orders', query: { created: order.order.orderNo } })
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '订单创建失败，请稍后重试。'
  } finally {
    checkingOut.value = false
  }
}

watch(
  () => member.isAuthenticated,
  authenticated => {
    if (authenticated) void loadLines()
    else lines.value = []
  },
  { immediate: true },
)
</script>

<template>
  <main class="cart-page page-shell">
    <div class="commerce-heading">
      <div>
        <span class="eyebrow">YOUR SELECTION</span>
        <h1>
          购物袋<span>（{{ cart.itemCount }}）</span>
        </h1>
      </div>
      <button class="text-button" type="button" @click="router.push({ name: 'shop' })">
        ← 继续选购
      </button>
    </div>

    <div v-if="!member.isAuthenticated" class="commerce-empty state-panel">
      <strong>登录后查看你的购物袋</strong>
      <p>购物袋会与会员账户同步保存。</p>
      <button class="primary-button" type="button" @click="member.authDialogOpen = true">
        登录 / 注册
      </button>
    </div>
    <div v-else-if="loading" class="commerce-empty state-panel" aria-live="polite">
      <strong>正在整理你的购物袋…</strong>
    </div>
    <div v-else-if="errorMessage" class="commerce-empty state-panel" role="alert">
      <strong>购物袋暂时无法打开</strong>
      <p>{{ errorMessage }}</p>
      <button class="text-button" type="button" @click="loadLines">再试一次 ↗</button>
    </div>
    <div v-else-if="!lines.length" class="commerce-empty state-panel">
      <strong>购物袋还是空的。</strong>
      <p>遇见喜欢的，就把它带回家。</p>
      <button class="primary-button" type="button" @click="router.push({ name: 'shop' })">
        去逛逛 <span aria-hidden="true">↗</span>
      </button>
    </div>
    <div v-else class="cart-layout">
      <section class="cart-lines" aria-label="购物袋商品">
        <article v-for="line in lines" :key="line.skuId" class="cart-line">
          <ProductArtwork
            :title="line.product?.spu.title || '商品已下架'"
            :code="line.product?.sku.skuCode || `SKU / ${line.skuId}`"
            :compact="true"
          />
          <div class="cart-line__info">
            <span class="eyebrow">{{ line.product?.spu.brand || 'FORME SELECT' }}</span>
            <h2>{{ line.product?.spu.title || '商品已下架或不可购买' }}</h2>
            <p>{{ line.product?.sku.skuCode || '请移除该商品后继续。' }}</p>
            <div class="cart-line__controls">
              <div class="quantity-control" aria-label="调整商品数量">
                <button
                  type="button"
                  :disabled="line.quantity <= 1"
                  aria-label="减少"
                  @click="changeQuantity(line, -1)"
                >
                  −
                </button>
                <output>{{ line.quantity }}</output>
                <button
                  type="button"
                  :disabled="line.quantity >= 999"
                  aria-label="增加"
                  @click="changeQuantity(line, 1)"
                >
                  +
                </button>
              </div>
              <button class="text-button" type="button" @click="removeLine(line)">移除</button>
            </div>
          </div>
          <strong class="cart-line__price">
            {{
              line.product ? formatMoney(Number(line.product.sku.salePrice) * line.quantity) : '—'
            }}
          </strong>
        </article>
      </section>

      <aside class="cart-summary">
        <span class="eyebrow">ORDER SUMMARY</span>
        <h2>订单摘要</h2>
        <div>
          <span>商品金额</span><strong>{{ formatMoney(subtotal) }}</strong>
        </div>
        <div><span>配送</span><strong>结算时计算</strong></div>
        <p>库存与最终金额将在创建订单时由服务端校验。</p>
        <button
          class="primary-button"
          type="button"
          :disabled="!canCheckout || checkingOut"
          @click="checkout"
        >
          {{ checkingOut ? '正在创建订单…' : '创建订单' }} <span aria-hidden="true">↗</span>
        </button>
        <span v-if="noticeMessage" class="cart-summary__notice" role="status">{{
          noticeMessage
        }}</span>
        <span v-if="errorMessage" class="cart-summary__error" role="alert">{{ errorMessage }}</span>
      </aside>
    </div>
  </main>
</template>

<style scoped src="./commerce-view.css"></style>
