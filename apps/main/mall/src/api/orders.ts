import { request } from './request'
import type { OrderView } from '@/types'

export function createOrder(items: Array<{ skuId: number; quantity: number }>) {
  const idempotencyKey =
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `mall-${Date.now()}-${Math.random().toString(36).slice(2)}`
  return request<OrderView>('/api/mall/member/orders', {
    method: 'POST',
    body: JSON.stringify({ idempotencyKey, items }),
  })
}

export function getOrders() {
  return request<OrderView[]>('/api/mall/member/orders?page=1&size=50')
}

export function cancelOrder(orderNo: string) {
  return request<void>(`/api/mall/member/orders/${encodeURIComponent(orderNo)}/cancel`, {
    method: 'POST',
  })
}
