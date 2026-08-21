<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh]">
    <h1 class="text-8xl font-bold text-gray-200">404</h1>
    <p class="text-gray-400 mt-4 mb-8">{{ t('notFound.desc') }}</p>
    <a-button type="primary" @click="router.push('/dashboard')">
      {{ t('notFound.backHome') }}
    </a-button>
  </div>
</template>
