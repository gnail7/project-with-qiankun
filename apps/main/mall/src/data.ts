export const API_BASE_URL =
  import.meta.env.VITE_MALL_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:8080`

export const MEMBER_TOKEN_KEY = 'mall-member-token'
export const MEMBER_PROFILE_KEY = 'mall-member-profile'

export const STORE_COPY = {
  eyebrow: 'A MORE THOUGHTFUL EVERYDAY',
  title: '把日常，过得\n更有质感。',
  subtitle: '精选好物，认真生活。每一件都值得被带回家。',
  freeShipping: '满 ¥199 免运费',
  returnPolicy: '7 天无忧退换',
}

export const PRODUCT_TABS = [
  { id: 'story', label: '商品故事' },
  { id: 'specs', label: '规格信息' },
  { id: 'service', label: '购买须知' },
] as const

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: '待付款',
  PAID: '已付款',
  CANCELLED: '已取消',
  CLOSED: '已关闭',
  COMPLETED: '已完成',
}
