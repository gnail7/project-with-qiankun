<script setup lang="ts">
import type { Post } from '../composables/useBlog'
import { formatDate } from '../utils/blog'

withDefaults(
  defineProps<{
    post: Post
    tagName?: (id?: number) => string
  }>(),
  { tagName: () => '' },
)
</script>

<template>
  <NuxtLink :to="`/posts/${post.postId}`" class="post-card">
    <div class="post-card__meta">
      <span v-if="post.categoryName" class="tag">{{ post.categoryName }}</span>
      <span>{{ formatDate(post.publishedTime) }}</span>
    </div>
    <h3 class="post-card__title">{{ post.title }}</h3>
    <p class="post-card__summary">{{ post.summary }}</p>
    <div class="post-card__tags">
      <span v-for="tid in post.tagIds" :key="tid" class="tag">#{{ tagName(tid) }}</span>
    </div>
  </NuxtLink>
</template>
