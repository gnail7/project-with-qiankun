<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { demoCategories, demos } from '@/data/demos'

const route = useRoute()
const router = useRouter()
const sortBy = ref<'latest' | 'title'>('latest')
const favorites = ref<string[]>(loadStorage('demo-hub:favorites'))

const query = computed(() =>
  String(route.query.q ?? '')
    .trim()
    .toLowerCase(),
)
const category = computed(() => String(route.query.category ?? 'all'))
const view = computed(() => String(route.query.view ?? 'all'))

const categoryInfo = computed(
  () => demoCategories.find(item => item.id === category.value) ?? demoCategories[0],
)

const visibleDemos = computed(() => {
  const recentIds = loadStorage('demo-hub:recent')
  let result = demos.filter(demo => {
    const matchesCategory = category.value === 'all' || demo.category === category.value
    const searchable = [demo.title, demo.summary, demo.categoryLabel, ...demo.tags]
      .join(' ')
      .toLowerCase()
    const matchesQuery = !query.value || searchable.includes(query.value)
    const matchesView =
      view.value === 'all' ||
      (view.value === 'favorites' && favorites.value.includes(demo.id)) ||
      (view.value === 'recent' && recentIds.includes(demo.id))

    return matchesCategory && matchesQuery && matchesView
  })

  return [...result].sort((a, b) => {
    if (sortBy.value === 'title') {
      return a.title.localeCompare(b.title)
    }
    return b.updatedAt.localeCompare(a.updatedAt)
  })
})

const readyCount = computed(() => visibleDemos.value.filter(demo => demo.status === 'ready').length)

function loadStorage(key: string): string[] {
  if (typeof localStorage === 'undefined') {
    return []
  }

  try {
    const value = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function saveFavorites() {
  localStorage.setItem('demo-hub:favorites', JSON.stringify(favorites.value))
}

function toggleFavorite(id: string) {
  favorites.value = favorites.value.includes(id)
    ? favorites.value.filter(item => item !== id)
    : [...favorites.value, id]
  saveFavorites()
}

function openDemo(id: string) {
  const recent = loadStorage('demo-hub:recent').filter(item => item !== id)
  localStorage.setItem('demo-hub:recent', JSON.stringify([id, ...recent].slice(0, 8)))
  router.push({ name: 'demo-detail', params: { id } })
}
</script>

<template>
  <section class="hub-overview">
    <div class="hub-hero">
      <div>
        <span class="hub-eyebrow">OPEN PLAYGROUND / 2026</span>
        <h1>把 Demo 放在一起，<br /><em>让探索更快发生。</em></h1>
        <p>一个无需登录的前端实验场，用来收集组件、交互和业务场景的可运行示例。</p>
      </div>
      <div class="hub-hero__orb hub-hero__orb--one" />
      <div class="hub-hero__orb hub-hero__orb--two" />
      <div class="hub-hero__grid" />
      <div class="hub-hero__stats">
        <div>
          <strong>{{ demos.length }}</strong
          ><span>个 Demo</span>
        </div>
        <div>
          <strong>{{ readyCount }}</strong
          ><span>可直接体验</span>
        </div>
      </div>
    </div>

    <div class="hub-section-heading">
      <div>
        <div class="hub-section-heading__title">
          <h2>
            {{
              view === 'all' ? categoryInfo.label : view === 'favorites' ? '我的收藏' : '最近浏览'
            }}
          </h2>
          <span>{{ visibleDemos.length }}</span>
        </div>
        <p>{{ query ? `正在筛选 “${route.query.q}”` : categoryInfo.description }}</p>
      </div>
      <label class="hub-sort">
        <span>排序</span>
        <select v-model="sortBy">
          <option value="latest">最近更新</option>
          <option value="title">按名称</option>
        </select>
      </label>
    </div>

    <div v-if="visibleDemos.length" class="demo-grid">
      <article
        v-for="demo in visibleDemos"
        :key="demo.id"
        class="demo-card"
        :class="`demo-card--${demo.accent}`"
        @click="openDemo(demo.id)"
      >
        <div class="demo-card__topline">
          <span class="demo-card__icon">{{ demo.icon }}</span>
          <button
            class="demo-card__favorite"
            :class="{ 'is-favorite': favorites.includes(demo.id) }"
            type="button"
            :aria-label="favorites.includes(demo.id) ? '取消收藏' : '收藏 Demo'"
            @click.stop="toggleFavorite(demo.id)"
          >
            {{ favorites.includes(demo.id) ? '♥' : '♡' }}
          </button>
        </div>
        <div class="demo-card__content">
          <div class="demo-card__meta">
            <span>{{ demo.categoryLabel }}</span>
            <i v-if="demo.status === 'ready'">Ready</i>
            <i v-else class="is-muted">Soon</i>
          </div>
          <h3>{{ demo.title }}</h3>
          <p>{{ demo.summary }}</p>
        </div>
        <div class="demo-card__footer">
          <div class="demo-card__tags">
            <span v-for="tag in demo.tags" :key="tag">{{ tag }}</span>
          </div>
          <span class="demo-card__arrow">↗</span>
        </div>
      </article>
    </div>

    <div v-else class="hub-empty-state">
      <span>⌕</span>
      <h3>暂时没有匹配的 Demo</h3>
      <p>换个关键词，或者清除筛选再试试。</p>
      <button type="button" @click="router.push({ name: 'hub' })">查看全部</button>
    </div>
  </section>
</template>
