<script setup lang="ts">
import { ref } from 'vue'
import type { DemoItem } from '@/types'

defineProps<{ demo: DemoItem }>()

const count = ref(3)
</script>

<template>
  <div class="preview-stack">
    <div class="preview-toolbar">
      <span class="preview-label">Interactive counter</span>
      <span class="preview-status">状态已同步</span>
    </div>

    <div class="preview-counter">
      <strong>{{ count }}</strong>
      <span>次点击</span>
    </div>

    <div class="preview-actions">
      <button class="preview-button preview-button--primary" type="button" @click="count++">
        增加一次
      </button>
      <button class="preview-button" type="button" @click="count--">减少一次</button>
      <button class="preview-button preview-button--ghost" type="button" @click="count = 0">
        重置
      </button>
    </div>
  </div>
</template>
