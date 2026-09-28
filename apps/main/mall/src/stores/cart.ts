import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { addCartItem, deleteCartItem, getCartItems, updateCartItem } from '@/api/cart'
import { useMemberStore } from './member'
import type { CartItem } from '@/types'

export const useCartStore = defineStore('mall-cart', () => {
  const items = ref<CartItem[]>([])
  const loading = ref(false)
  const itemCount = computed(() => items.value.reduce((count, item) => count + item.quantity, 0))

  async function refresh() {
    if (!useMemberStore().isAuthenticated) {
      items.value = []
      return
    }
    loading.value = true
    try {
      items.value = await getCartItems()
    } finally {
      loading.value = false
    }
  }

  async function add(skuId: number, quantity: number) {
    await addCartItem(skuId, quantity)
    await refresh()
  }

  async function setQuantity(skuId: number, quantity: number) {
    await updateCartItem(skuId, quantity)
    await refresh()
  }

  async function remove(skuId: number) {
    await deleteCartItem(skuId)
    items.value = items.value.filter(item => item.skuId !== skuId)
  }

  function clear() {
    items.value = []
  }

  return { items, loading, itemCount, refresh, add, setQuantity, remove, clear }
})
