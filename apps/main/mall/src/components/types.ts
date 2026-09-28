import type { ProductCatalogItem } from '@/types'

export type ProductArtTone = 'sand' | 'sage' | 'blue' | 'rose'

export interface ProductArtworkProps {
  title: string
  code?: string
  tone?: ProductArtTone
  compact?: boolean
}

export interface ProductCardProps {
  product: ProductCatalogItem
  index: number
}

export interface ProductCardEmits {
  select: [skuId: number]
}

export interface AuthDialogProps {
  open: boolean
}

export interface AuthDialogEmits {
  close: []
  success: []
}
