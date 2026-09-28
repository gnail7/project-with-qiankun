<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiError } from '@/api/request'
import ProductArtwork from '@/components/ProductArtwork.vue'
import { PRODUCT_TABS } from '@/data'
import { useCartStore } from '@/stores/cart'
import { useMemberStore } from '@/stores/member'
import { loadProduct, parseSpecifications } from '@/services/catalogService'
import { formatMoney } from '@/utils/format'
import type { ProductDetail, ProductSpecification } from '@/types'
import type { ProductArtTone } from '@/components/types'

const route = useRoute()
const router = useRouter()
const member = useMemberStore()
const cart = useCartStore()
const product = ref<ProductDetail | null>(null)
const loading = ref(true)
const adding = ref(false)
const quantity = ref(1)
const activeTab = ref<(typeof PRODUCT_TABS)[number]['id']>('story')
const errorMessage = ref('')
const statusMessage = ref('')

const skuId = computed(() => Number(route.params.skuId))
const specifications = computed<ProductSpecification[]>(() =>
  parseSpecifications(product.value?.sku.specJson ?? null),
)
const artworkTone = computed<ProductArtTone>(() => {
  const tones: ProductArtTone[] = ['sand', 'sage', 'blue', 'rose']
  return tones[(product.value?.spu.categoryId ?? 0) % tones.length]
})

async function loadDetail() {
  loading.value = true
  errorMessage.value = ''
  product.value = null
  try {
    if (!Number.isSafeInteger(skuId.value) || skuId.value <= 0) {
      throw new ApiError('商品编号无效。', 404)
    }
    product.value = await loadProduct(skuId.value)
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '商品暂时无法加载。'
  } finally {
    loading.value = false
  }
}

async function addToCart() {
  statusMessage.value = ''
  if (!member.isAuthenticated) {
    member.authDialogOpen = true
    return
  }
  if (!product.value) return
  adding.value = true
  try {
    await cart.add(product.value.sku.id, quantity.value)
    statusMessage.value = '已加入购物袋。'
  } catch (error) {
    statusMessage.value = error instanceof ApiError ? error.message : '暂时无法加入购物袋，请重试。'
  } finally {
    adding.value = false
  }
}

watch(skuId, () => void loadDetail(), { immediate: true })
</script>

<template>
  <main class="product-detail-page">
    <div v-if="loading" class="page-shell state-panel"><strong>正在打开这件好物…</strong></div>
    <div v-else-if="errorMessage || !product" class="page-shell state-panel" role="alert">
      <strong>暂时找不到这件商品</strong>
      <p>{{ errorMessage || '商品可能已经下架。' }}</p>
      <button class="text-button" type="button" @click="router.push({ name: 'shop' })">
        ← 返回商品列表
      </button>
    </div>

    <template v-else>
      <div class="product-detail-layout page-shell">
        <section class="product-detail-visual" aria-label="商品展示">
          <ProductArtwork
            :title="product.spu.title"
            :code="`FORME / ${product.sku.skuCode}`"
            :tone="artworkTone"
          />
          <span class="product-detail-visual__index">01 <i /> 01</span>
        </section>

        <section class="product-detail-info">
          <button
            class="product-back text-button"
            type="button"
            @click="router.push({ name: 'shop' })"
          >
            <span aria-hidden="true">←</span> 返回商品列表
          </button>
          <div class="product-detail-info__heading">
            <span class="eyebrow">{{ product.spu.brand || 'FORME SELECT' }}</span>
            <h1>{{ product.spu.title }}</h1>
            <p>{{ product.spu.subtitle || product.spu.detail }}</p>
          </div>

          <div class="product-price-row">
            <strong>{{ formatMoney(product.sku.salePrice) }}</strong>
            <del v-if="Number(product.sku.marketPrice) > Number(product.sku.salePrice)">
              {{ formatMoney(product.sku.marketPrice) }}
            </del>
            <span>税费已含</span>
          </div>

          <div class="product-variant">
            <div class="product-section-label">
              <strong>当前规格</strong>
              <span>{{ product.sku.skuCode }}</span>
            </div>
            <div class="product-variant__chip">
              <i />
              <span>{{ specifications[0]?.value || '标准款' }}</span>
              <b>在售</b>
            </div>
          </div>

          <div class="product-quantity">
            <span class="product-section-label"><strong>数量</strong></span>
            <div class="quantity-control" aria-label="选择购买数量">
              <button
                type="button"
                :disabled="quantity <= 1"
                aria-label="减少数量"
                @click="quantity--"
              >
                −
              </button>
              <output>{{ quantity }}</output>
              <button
                type="button"
                :disabled="quantity >= 999"
                aria-label="增加数量"
                @click="quantity++"
              >
                +
              </button>
            </div>
          </div>

          <div class="product-tabs" role="tablist" aria-label="商品信息">
            <button
              v-for="tab in PRODUCT_TABS"
              :key="tab.id"
              type="button"
              role="tab"
              :aria-selected="activeTab === tab.id"
              :class="{ 'is-active': activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="product-tab-content" role="tabpanel">
            <p v-if="activeTab === 'story'">
              {{ product.spu.detail || product.spu.subtitle || '为日常生活，认真挑选的一件好物。' }}
            </p>
            <dl v-else-if="activeTab === 'specs'" class="product-spec-list">
              <div>
                <dt>商品编号</dt>
                <dd>{{ product.sku.skuCode }}</dd>
              </div>
              <div v-for="spec in specifications" :key="spec.label">
                <dt>{{ spec.label }}</dt>
                <dd>{{ spec.value }}</dd>
              </div>
              <div v-if="!specifications.length">
                <dt>规格</dt>
                <dd>标准款</dd>
              </div>
            </dl>
            <p v-else>库存将在提交订单时由服务端实时校验。订单创建后请在订单页查看状态。</p>
          </div>

          <p v-if="statusMessage" class="product-status" role="status">{{ statusMessage }}</p>
        </section>
      </div>

      <div class="product-purchase-wrap">
        <div class="product-purchase">
          <div class="product-purchase__identity">
            <ProductArtwork
              :title="product.spu.title"
              :code="product.sku.skuCode"
              :tone="artworkTone"
              :compact="true"
            />
            <div>
              <strong>{{ product.spu.title }}</strong>
              <span>{{ quantity }} 件 · {{ product.sku.skuCode }}</span>
            </div>
          </div>
          <div class="product-purchase__price">
            {{ formatMoney(Number(product.sku.salePrice) * quantity) }}
          </div>
          <button class="primary-button" type="button" :disabled="adding" @click="addToCart">
            {{ adding ? '正在加入…' : '加入购物袋' }} <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </template>
  </main>
</template>

<style scoped src="./product-detail-view.css"></style>
