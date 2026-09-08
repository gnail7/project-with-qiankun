<script setup lang="ts">
import { useBlogApi } from '../../composables/useBlog'
import type { Category, Tag } from '../../composables/useBlog'

const api = useBlogApi()
const route = useRoute()
const catId = computed(() => Number(route.params.id))

const { data: catsData } = await useAsyncData('cats', () => api.getCategories())
const { data: tagsData } = await useAsyncData('blog-tags', () => api.getTags())
const { data: postsData } = await useAsyncData(
  'cat-posts',
  () => api.getPosts({ categoryId: catId.value, pageNum: 1, pageSize: 50 }),
  { watch: [catId] },
)

const category = computed<Category | undefined>(() =>
  (catsData.value || []).find(c => c.categoryId === catId.value),
)
const categoryName = computed(() => category.value?.categoryName || '分类')
const posts = computed(() => postsData.value?.records || [])
const tags = computed<Tag[]>(() => tagsData.value || [])
const tagMap = computed(() => new Map(tags.value.map(t => [t.tagId, t.tagName])))

function tagName(id?: number) {
  return id != null ? tagMap.value.get(id) || '' : ''
}

useHead(() => ({ title: `${categoryName.value} · Ziven Blog` }))
</script>

<template>
  <section class="hero">
    <h1>{{ categoryName }}</h1>
    <p>共 {{ posts.length }} 篇文章</p>
  </section>

  <div v-if="posts.length" class="post-grid">
    <PostCard v-for="p in posts" :key="p.postId" :post="p" :tag-name="tagName" />
  </div>
  <div v-else class="empty">该分类暂无文章</div>
</template>
