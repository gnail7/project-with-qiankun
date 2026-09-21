<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { findDemo } from '@/data/demos'
import DemoPreview from '@/components/DemoPreview.vue'

const route = useRoute()
const demo = computed(() => findDemo(String(route.params.id)))

watch(
  () => demo.value?.id,
  id => {
    if (!id || typeof localStorage === 'undefined') {
      return
    }
    const recent = JSON.parse(localStorage.getItem('demo-hub:recent') ?? '[]') as string[]
    localStorage.setItem(
      'demo-hub:recent',
      JSON.stringify([id, ...recent.filter(item => item !== id)].slice(0, 8)),
    )
  },
  { immediate: true },
)
</script>

<template>
  <section v-if="demo" class="demo-detail">
    <RouterLink class="demo-detail__back" :to="{ name: 'hub' }">← 返回 Demo Hub</RouterLink>

    <div class="demo-detail__heading">
      <div>
        <div class="demo-card__meta">
          <span>{{ demo.categoryLabel }}</span>
          <i v-if="demo.status === 'ready'">Ready</i>
          <i v-else class="is-muted">Soon</i>
        </div>
        <h1>{{ demo.title }}</h1>
        <p>{{ demo.summary }}</p>
      </div>
      <div class="demo-detail__icon" :class="`demo-card--${demo.accent}`">{{ demo.icon }}</div>
    </div>

    <DemoPreview :demo="demo" />
  </section>

  <section v-else class="hub-empty-state">
    <span>404</span>
    <h3>Demo 不存在</h3>
    <p>这个 Demo 可能还没有加入 Hub。</p>
    <RouterLink class="hub-empty-state__link" :to="{ name: 'hub' }">返回首页</RouterLink>
  </section>
</template>
