<script setup lang="ts">
export interface BreadcrumbItem {
  title: string
  path?: string
}

defineProps<{ items?: BreadcrumbItem[] }>()
</script>

<template>
  <nav class="z-breadcrumb" aria-label="breadcrumb">
    <template v-for="(item, index) in items" :key="index">
      <span v-if="index > 0" class="z-breadcrumb__sep">/</span>
      <span class="z-breadcrumb__item">{{ item.title }}</span>
    </template>
  </nav>
</template>

<style scoped>
.z-breadcrumb {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--z-text-muted);
  white-space: nowrap;
}

.z-breadcrumb__sep {
  color: var(--z-border);
}

.z-breadcrumb__item {
  display: inline-flex;
  align-items: center;
  color: var(--z-text-muted);
}

.z-breadcrumb__item:last-child {
  color: var(--z-text);
  font-weight: 500;
}
</style>
