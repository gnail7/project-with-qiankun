import { request } from './request'
import type { CartItem } from '@/types'

export function getCartItems() {
  return request<CartItem[]>('/api/mall/member/cart/items')
}

export function addCartItem(skuId: number, quantity: number) {
  return request<CartItem>('/api/mall/member/cart/items', {
    method: 'POST',
    body: JSON.stringify({ skuId, quantity }),
  })
}

export function updateCartItem(skuId: number, quantity: number) {
  return request<CartItem>(`/api/mall/member/cart/items/${skuId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  })
}

export function deleteCartItem(skuId: number) {
  return request<void>(`/api/mall/member/cart/items/${skuId}`, { method: 'DELETE' })
}
