<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { demoCategories, demos } from './data/demos'

const router = useRouter()
const route = useRoute()
const searchText = ref(String(route.query.q ?? ''))

const activeCategory = computed(() => String(route.query.category ?? 'all'))
const activeView = computed(() => String(route.query.view ?? 'all'))
const isHub = computed(() => route.name === 'hub')
const totalReady = computed(() => demos.filter(demo => demo.status === 'ready').length)

watch(
  () => route.query.q,
  value => {
    searchText.value = String(value ?? '')
  },
)

function goCategory(category: string) {
  router.push({
    name: 'hub',
    query: category === 'all' ? {} : { category },
  })
}

function goView(view: 'all' | 'favorites' | 'recent') {
  router.push({
    name: 'hub',
    query: view === 'all' ? {} : { view },
  })
}

function submitSearch() {
  const query = searchText.value.trim()
  router.push({
    name: 'hub',
    query: query ? { q: query } : {},
  })
}
</script>

<template>
  <div class="demo-hub-shell">
    <header class="hub-header">
      <div class="hub-header__inner">
        <RouterLink class="hub-brand" :to="{ name: 'hub' }">
          <span class="hub-brand__mark">D</span>
          <span>
            <strong>Demo Hub</strong>
            <small>playground workspace</small>
          </span>
        </RouterLink>

        <div class="hub-header__tools">
          <label class="hub-search">
            <span>⌕</span>
            <input
              v-model="searchText"
              type="search"
              placeholder="搜索 Demo、标签或关键词"
              @keyup.enter="submitSearch"
            />
            <kbd>Enter</kbd>
          </label>
          <span class="hub-open-badge"><i />无需登录</span>
        </div>
      </div>
    </header>

    <div class="hub-body">
      <aside class="hub-sidebar">
        <div class="hub-sidebar__section">
          <span class="hub-sidebar__label">工作台</span>
          <button
            class="hub-nav-item"
            :class="{ 'is-active': isHub && activeView === 'all' && activeCategory === 'all' }"
            type="button"
            @click="goView('all')"
          >
            <span class="hub-nav-item__icon">⌂</span>
            <span>全部 Demo</span>
            <em>{{ demos.length }}</em>
          </button>
          <button
            class="hub-nav-item"
            :class="{ 'is-active': isHub && activeView === 'recent' }"
            type="button"
            @click="goView('recent')"
          >
            <span class="hub-nav-item__icon">◷</span>
            <span>最近浏览</span>
          </button>
          <button
            class="hub-nav-item"
            :class="{ 'is-active': isHub && activeView === 'favorites' }"
            type="button"
            @click="goView('favorites')"
          >
            <span class="hub-nav-item__icon">♡</span>
            <span>我的收藏</span>
          </button>
        </div>

        <div class="hub-sidebar__section hub-sidebar__section--categories">
          <span class="hub-sidebar__label">分类浏览</span>
          <button
            v-for="category in demoCategories"
            :key="category.id"
            class="hub-nav-item"
            :class="{
              'is-active': isHub && activeView === 'all' && activeCategory === category.id,
            }"
            type="button"
            @click="goCategory(category.id)"
          >
            <span class="hub-nav-item__icon">{{ category.icon }}</span>
            <span>{{ category.label }}</span>
            <em v-if="category.id === 'all'">{{ totalReady }}</em>
          </button>
        </div>

        <div class="hub-sidebar__tip">
          <span class="hub-sidebar__tip-icon">✦</span>
          <strong>持续收集灵感</strong>
          <p>把零散的交互实验放到这里，快速复用和对比。</p>
        </div>
      </aside>

      <main class="hub-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>
