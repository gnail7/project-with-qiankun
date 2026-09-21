<script setup lang="ts">
import { ref } from 'vue'
import type { DemoItem } from '@/types'

defineProps<{ demo: DemoItem }>()

interface QuickForm {
  name: string
  email: string
}

const form = ref<QuickForm>({ name: '', email: '' })
const submitted = ref(false)
</script>

<template>
  <div class="preview-stack preview-form">
    <div class="preview-toolbar">
      <span class="preview-label">Quick form</span>
      <span class="preview-status">无需登录</span>
    </div>

    <label class="preview-field">
      <span>名称</span>
      <input v-model="form.name" placeholder="输入一个项目名称" />
    </label>

    <label class="preview-field">
      <span>邮箱</span>
      <input v-model="form.email" type="email" placeholder="hello@example.com" />
    </label>

    <button
      class="preview-button preview-button--primary preview-form__submit"
      type="button"
      @click="submitted = true"
    >
      {{ submitted ? '已提交 ✓' : '提交体验' }}
    </button>
  </div>
</template>
