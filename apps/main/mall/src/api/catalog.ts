import { request } from './request'
import type { MallCategory, MallProductSku, MallProductSpu, ProductDetail } from '@/types'

export function getCategories() {
  return request<MallCategory[]>('/api/mall/public/categories')
}

export function getProducts(categoryId?: number) {
  const query = categoryId === undefined ? '' : `?categoryId=${encodeURIComponent(categoryId)}`
  return request<MallProductSpu[]>(`/api/mall/public/products${query}`)
}

export function getDefaultSkus(spuIds: number[]) {
  const query = new URLSearchParams({ spuIds: spuIds.join(',') })
  return request<Record<string, MallProductSku>>(
    `/api/mall/public/products/default-skus?${query.toString()}`,
  )
}

export function getProductDetail(skuId: number) {
  return request<ProductDetail>(`/api/mall/public/products/${skuId}`)
}
