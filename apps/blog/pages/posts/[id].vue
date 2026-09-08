<script setup lang="ts">
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { useBlogApi } from '../../composables/useBlog'
import type { Post, Tag } from '../../composables/useBlog'
import { formatDate } from '../../utils/blog'

const api = useBlogApi()
const route = useRoute()

const { data: postData } = await useAsyncData('post', () => api.getPost(Number(route.params.id)), {
  watch: [() => route.params.id],
})

const { data: tagsData } = await useAsyncData('blog-tags', () => api.getTags())

const post = computed<Post | null>(() => postData.value || null)
const html = computed(() => (post.value ? (marked.parse(post.value.content || '') as string) : ''))
const tags = computed<Tag[]>(() => tagsData.value || [])
const tagMap = computed(() => new Map(tags.value.map(t => [t.tagId, t.tagName])))
const notFound = computed(() => !post.value)

onMounted(() => {
  document
    .querySelectorAll<HTMLElement>('.post-content pre code')
    .forEach(el => hljs.highlightElement(el))
})

useHead(() => ({ title: post.value ? `${post.value.title} · Ziven Blog` : 'Ziven Blog' }))

function tagName(id?: number) {
  return id != null ? tagMap.value.get(id) || '' : ''
}
</script>

<template>
  <article v-if="post" class="post-detail">
    <div class="post-detail__meta">
      <span v-if="post.categoryName" class="tag">{{ post.categoryName }}</span>
      <span>{{ formatDate(post.publishedTime) }}</span>
      <span>{{ post.viewCount }} 次阅读</span>
    </div>
    <h1>{{ post.title }}</h1>
    <div class="post-detail__tags">
      <span v-for="tid in post.tagIds" :key="tid" class="tag">#{{ tagName(tid) }}</span>
    </div>
    <div class="post-content" v-html="html" />
  </article>

  <div v-else-if="notFound" class="empty">文章不存在或尚未发布</div>
  <div v-else class="empty">加载中…</div>
</template>
