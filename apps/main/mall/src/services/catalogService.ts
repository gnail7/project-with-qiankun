import { getCategories, getDefaultSkus, getProductDetail, getProducts } from '@/api/catalog'
import type {
  CartItem,
  CartLine,
  MallCategory,
  ProductCatalogItem,
  ProductDetail,
  ProductSpecification,
} from '@/types'

export async function loadCatalog(categoryId?: number) {
  const [categories, products] = await Promise.all([getCategories(), getProducts(categoryId)])
  const defaultSkus = products.length
    ? await getDefaultSkus(products.map(product => product.id))
    : {}

  return {
    categories,
    products: products.map(spu => ({
      spu,
      defaultSku: defaultSkus[String(spu.id)] ?? null,
    })),
  } satisfies { categories: MallCategory[]; products: ProductCatalogItem[] }
}

export function loadProduct(skuId: number): Promise<ProductDetail> {
  return getProductDetail(skuId)
}

export function parseSpecifications(specJson: string | null): ProductSpecification[] {
  if (!specJson) return []
  try {
    const value: unknown = JSON.parse(specJson)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return []
    return Object.entries(value).map(([label, entry]) => ({
      label,
      value: typeof entry === 'string' ? entry : JSON.stringify(entry),
    }))
  } catch {
    return []
  }
}

export async function loadCartLines(items: CartItem[]): Promise<CartLine[]> {
  return Promise.all(
    items.map(async item => {
      try {
        return { ...item, product: await getProductDetail(item.skuId) }
      } catch {
        return { ...item, product: null }
      }
    }),
  )
}
