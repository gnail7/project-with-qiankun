<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ApiError } from '@/api/request'
import ProductArtwork from '@/components/ProductArtwork.vue'
import ProductCard from '@/components/ProductCard.vue'
import { STORE_COPY } from '@/data'
import { loadCatalog } from '@/services/catalogService'
import type { MallCategory, ProductCatalogItem } from '@/types'

const router = useRouter()
const categories = ref<MallCategory[]>([])
const products = ref<ProductCatalogItem[]>([])
const selectedCategory = ref<number | null>(null)
const searchText = ref('')
const loading = ref(true)
const errorMessage = ref('')

const visibleProducts = computed(() => {
  const query = searchText.value.trim().toLocaleLowerCase()
  if (!query) return products.value
  return products.value.filter(({ spu }) =>
    [spu.title, spu.subtitle, spu.brand, spu.detail].some(value =>
      value?.toLocaleLowerCase().includes(query),
    ),
  )
})
const featuredProduct = computed(() => visibleProducts.value[0] ?? null)

async function loadProducts() {
  loading.value = true
  errorMessage.value = ''
  try {
    const catalog = await loadCatalog(selectedCategory.value ?? undefined)
    categories.value = catalog.categories
    products.value = catalog.products
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '商品暂时无法加载。'
  } finally {
    loading.value = false
  }
}

function openProduct(skuId: number) {
  router.push({ name: 'product', params: { skuId } })
}

function scrollToCatalog() {
  document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(loadProducts)
watch(selectedCategory, () => void loadProducts())
</script>

<template>
  <main class="shop-page">
    <section class="shop-hero page-shell">
      <div class="shop-hero__copy">
        <span class="eyebrow">{{ STORE_COPY.eyebrow }}</span>
        <h1>{{ STORE_COPY.title }}</h1>
        <p>{{ STORE_COPY.subtitle }}</p>
        <button class="text-button" type="button" @click="scrollToCatalog">
          探索本季好物 <span aria-hidden="true">↘</span>
        </button>
        <div class="shop-hero__notes">
          <span><i />{{ STORE_COPY.freeShipping }}</span>
          <span><i />{{ STORE_COPY.returnPolicy }}</span>
        </div>
      </div>

      <button
        v-if="featuredProduct?.defaultSku"
        class="shop-hero__feature"
        type="button"
        @click="openProduct(featuredProduct.defaultSku.id)"
      >
        <ProductArtwork
          :title="featuredProduct.spu.title"
          :code="`SEASONAL / ${featuredProduct.spu.id}`"
          tone="sage"
        />
        <span class="shop-hero__feature-label">FEATURED OBJECT <b>↗</b></span>
      </button>
      <div v-else class="shop-hero__feature shop-hero__feature--empty">
        <ProductArtwork title="A slower kind of living" code="FORME / SELECTED" tone="sage" />
        <span class="shop-hero__feature-label">A LITTLE MORE ROOM TO BREATHE</span>
      </div>
    </section>

    <section id="catalog" class="shop-catalog page-shell">
      <div class="shop-catalog__heading">
        <div>
          <span class="eyebrow">THE COLLECTION</span>
          <h2>为日常，挑一件。</h2>
        </div>
        <label class="shop-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 5 5" />
          </svg>
          <input v-model="searchText" type="search" placeholder="搜索商品" />
          <span>⌕</span>
        </label>
      </div>

      <div class="shop-filters" aria-label="商品分类">
        <button
          type="button"
          :class="{ 'is-active': selectedCategory === null }"
          @click="selectedCategory = null"
        >
          全部商品
        </button>
        <button
          v-for="category in categories"
          :key="category.id"
          type="button"
          :class="{ 'is-active': selectedCategory === category.id }"
          @click="selectedCategory = category.id"
        >
          {{ category.name }}
        </button>
        <span class="shop-filters__count">{{ visibleProducts.length }} 件好物</span>
      </div>

      <div v-if="loading" class="shop-empty state-panel" aria-live="polite">
        <strong>正在为你挑选好物…</strong>
      </div>
      <div v-else-if="errorMessage" class="shop-empty state-panel" role="alert">
        <strong>商品暂时没有加载出来</strong>
        <p>{{ errorMessage }}</p>
        <button class="text-button" type="button" @click="loadProducts">再试一次 ↗</button>
      </div>
      <div v-else-if="!visibleProducts.length" class="shop-empty state-panel">
        <strong>这里暂时还没有好物</strong>
        <p>换个关键词，或者稍后再来看看。</p>
      </div>
      <div v-else class="shop-product-grid">
        <ProductCard
          v-for="(product, index) in visibleProducts"
          :key="product.spu.id"
          :product="product"
          :index="index"
          @select="openProduct"
        />
      </div>

      <div class="shop-catalog__closing">
        <span>LESS, BUT BETTER.</span>
        <span>我们相信，好的日常始于用心挑选。</span>
      </div>
    </section>
  </main>
</template>

<style scoped src="./shop-view.css"></style>
