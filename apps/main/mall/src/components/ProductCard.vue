<script setup lang="ts">
import ProductArtwork from './ProductArtwork.vue'
import type { ProductCardEmits, ProductCardProps } from './types'

defineProps<ProductCardProps>()

const emit = defineEmits<ProductCardEmits>()

const tones = ['sand', 'sage', 'blue', 'rose'] as const
</script>

<template>
  <article class="product-card">
    <button
      class="product-card__visual"
      type="button"
      :disabled="!product.defaultSku"
      :aria-label="`查看 ${product.spu.title}`"
      @click="product.defaultSku && emit('select', product.defaultSku.id)"
    >
      <ProductArtwork
        :title="product.spu.title"
        :code="`FORME / ${String(index + 1).padStart(3, '0')}`"
        :tone="tones[index % tones.length]"
        :compact="true"
      />
      <span v-if="!product.defaultSku" class="product-card__unavailable">暂不可购买</span>
      <span v-else class="product-card__arrow" aria-hidden="true">↗</span>
    </button>
    <div class="product-card__meta">
      <span>{{ product.spu.brand || 'FORME SELECT' }}</span>
      <span>{{ product.defaultSku?.skuCode || 'COMING SOON' }}</span>
    </div>
    <button
      class="product-card__title"
      type="button"
      :disabled="!product.defaultSku"
      @click="product.defaultSku && emit('select', product.defaultSku.id)"
    >
      {{ product.spu.title }}
    </button>
    <p>{{ product.spu.subtitle || product.spu.detail }}</p>
    <strong v-if="product.defaultSku"
      >¥{{ Number(product.defaultSku.salePrice).toFixed(2) }}</strong
    >
    <strong v-else>暂未上架</strong>
  </article>
</template>

<style scoped src="./product-card.css"></style>
