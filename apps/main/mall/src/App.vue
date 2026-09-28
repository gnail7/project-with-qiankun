<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import AuthDialog from '@/components/AuthDialog.vue'
import { useCartStore } from '@/stores/cart'
import { useMemberStore } from '@/stores/member'

const member = useMemberStore()
const cart = useCartStore()

onMounted(() => {
  if (member.isAuthenticated) {
    cart.refresh().catch(error => console.warn('Could not sync mall cart', error))
  }
})

watch(
  () => member.isAuthenticated,
  authenticated => {
    if (authenticated) {
      cart.refresh().catch(error => console.warn('Could not sync mall cart', error))
    } else {
      cart.clear()
    }
  },
)

async function logout() {
  try {
    await member.logout()
  } catch (error) {
    console.warn('Could not revoke mall member session', error)
  }
  cart.clear()
}
</script>

<template>
  <div class="mall-app">
    <header class="store-header">
      <RouterLink class="store-brand" :to="{ name: 'shop' }" aria-label="FORME 商城首页">
        <span class="store-brand__mark">F</span>
        <span class="store-brand__wordmark">FORME<span> / MARKET</span></span>
      </RouterLink>

      <nav class="store-nav" aria-label="商城导航">
        <RouterLink :to="{ name: 'shop' }">发现好物</RouterLink>
        <RouterLink :to="{ name: 'orders' }">我的订单</RouterLink>
      </nav>

      <div class="store-actions">
        <button
          v-if="member.isAuthenticated"
          class="store-account"
          type="button"
          :title="`退出登录（${member.session?.nickname}）`"
          @click="logout"
        >
          <span class="store-account__avatar">{{ member.session?.nickname.slice(0, 1) }}</span>
          <span class="store-account__name">{{ member.session?.nickname }}</span>
        </button>
        <button
          v-else
          class="store-link-button"
          type="button"
          @click="member.authDialogOpen = true"
        >
          登录 / 注册
        </button>
        <RouterLink class="store-cart-link" :to="{ name: 'cart' }" aria-label="购物袋">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 8h14l-1.2 12H6.2L5 8Z" />
            <path d="M9 9V6a3 3 0 0 1 6 0v3" />
          </svg>
          <span>购物袋</span>
          <b v-if="cart.itemCount">{{ cart.itemCount }}</b>
        </RouterLink>
      </div>
    </header>

    <RouterView />

    <footer class="store-footer">
      <span>FORME / MARKET</span>
      <span>好物不必很多，刚好就好。</span>
      <span>© 2026 FORME</span>
    </footer>

    <AuthDialog
      :open="member.authDialogOpen"
      @close="member.authDialogOpen = false"
      @success="cart.refresh()"
    />
  </div>
</template>
