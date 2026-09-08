<script setup lang="ts">
import { useBlogApi } from '../composables/useBlog'
import type { Category, Post, Tag } from '../composables/useBlog'

const api = useBlogApi()
const route = useRoute()

const page = ref(1)
const pageSize = 8
const keyword = ref(String(route.query.q || ''))
const activeTag = computed(() => (route.query.tag ? Number(route.query.tag) : undefined))

const { data: postsData, refresh } = await useAsyncData('blog-posts', () =>
  api.getPosts({
    pageNum: page.value,
    pageSize,
    tagId: activeTag.value,
    keyword: keyword.value.trim() || undefined,
  }),
)

const { data: categoriesData } = await useAsyncData('blog-categories', () => api.getCategories())
const { data: tagsData } = await useAsyncData('blog-tags', () => api.getTags())

const posts = computed<Post[]>(() => postsData.value?.records || [])
const total = computed<number>(() => postsData.value?.total || 0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const categories = computed<Category[]>(() => categoriesData.value || [])
const tags = computed<Tag[]>(() => tagsData.value || [])
const tagMap = computed(() => new Map(tags.value.map(t => [t.tagId, t.tagName])))

watch(
  () => route.query,
  () => {
    page.value = 1
    keyword.value = String(route.query.q || '')
    refresh()
  },
  { deep: true },
)

function patchQuery(patch: Record<string, string | number | undefined>) {
  const next = { ...route.query }
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined || v === '') {
      delete next[k]
    } else {
      next[k] = String(v)
    }
  }
  delete next.page
  navigateTo({ query: next })
}

function toggleTag(id: number) {
  page.value = 1
  patchQuery({ tag: activeTag.value === id ? undefined : id })
}

function doSearch() {
  page.value = 1
  patchQuery({ q: keyword.value.trim() || undefined })
}

function goPage(p: number) {
  page.value = p
  refresh()
}

function tagName(id?: number) {
  return id != null ? tagMap.value.get(id) || '' : ''
}

useHead({ title: 'Ziven Blog' })
</script>

<template>
  <section class="hero">
    <h1>写下思考，分享热爱</h1>
    <p>一个专注于前端、后端与工程化的个人博客。</p>
  </section>

  <div class="filters">
    <NuxtLink to="/" class="chip" :class="{ 'is-active': true }">全部</NuxtLink>
    <NuxtLink
      v-for="c in categories"
      :key="c.categoryId"
      :to="`/category/${c.categoryId}`"
      class="chip"
    >
      {{ c.categoryName }}
    </NuxtLink>
    <div class="search">
      <input v-model="keyword" placeholder="搜索文章..." @keyup.enter="doSearch" />
      <button class="chip is-active" type="button" @click="doSearch">搜索</button>
    </div>
  </div>

  <div v-if="tags.length" class="filters">
    <button
      v-for="t in tags"
      :key="t.tagId"
      class="chip"
      :class="{ 'is-active': activeTag === t.tagId }"
      @click="toggleTag(t.tagId)"
    >
      #{{ t.tagName }}
    </button>
  </div>

  <div v-if="posts.length" class="post-grid">
    <PostCard v-for="p in posts" :key="p.postId" :post="p" :tag-name="tagName" />
  </div>
  <div v-else class="empty">暂无文章</div>

  <div v-if="total > pageSize" class="pagination">
    <button type="button" :disabled="page <= 1" @click="goPage(page - 1)">上一页</button>
    <span>{{ page }} / {{ totalPages }}</span>
    <button type="button" :disabled="page >= totalPages" @click="goPage(page + 1)">下一页</button>
  </div>
</template>
