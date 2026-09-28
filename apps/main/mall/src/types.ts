export interface MallCategory {
  id: number
  parentId: number
  name: string
  sortNo: number
  status: number
}

export interface MallProductSpu {
  id: number
  categoryId: number
  title: string
  subtitle: string | null
  brand: string | null
  detail: string | null
  status: string
}

export interface MallProductSku {
  id: number
  spuId: number
  skuCode: string
  specJson: string | null
  salePrice: number | string
  marketPrice: number | string | null
  status: string
}

export interface ProductCatalogItem {
  spu: MallProductSpu
  defaultSku: MallProductSku | null
}

export interface ProductDetail {
  spu: MallProductSpu
  sku: MallProductSku
}

export interface ProductSpecification {
  label: string
  value: string
}

export interface CartItem {
  id: number
  cartId: number
  memberId: number
  skuId: number
  quantity: number
}

export interface CartLine extends CartItem {
  product: ProductDetail | null
}

export interface MallOrder {
  id: number
  orderNo: string
  orderStatus: string
  totalAmount: number | string
  payableAmount: number | string
  expireAt: string | null
  createdAt: string
}

export interface MallOrderItem {
  id: number
  orderNo: string
  skuId: number
  productTitle: string
  skuSnapshot: string | null
  quantity: number
  salePrice: number | string
  itemAmount: number | string
}

export interface OrderView {
  order: MallOrder
  items: MallOrderItem[]
}

export interface MemberSession {
  token: string
  memberId: number
  phone: string
  nickname: string
}

export interface AuthCredentials {
  phone: string
  password: string
}

export interface RegisterCredentials extends AuthCredentials {
  nickname: string
}

export interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
}
