<script setup lang="ts">
import { useLocale } from '../../locale'

// 语言切换（中/EN）：点击切换并持久化，消费方通过 watch(locale) 同步 vue-i18n
const { locale, setLocale } = useLocale()

const options: { value: string; label: string }[] = [
  { value: 'zh-CN', label: '中' },
  { value: 'en-US', label: 'EN' },
]
</script>

<template>
  <div class="z-locale-switch" role="group">
    <button
      v-for="item in options"
      :key="item.value"
      type="button"
      class="z-locale-switch__item"
      :class="{ 'is-active': locale === item.value }"
      @click="setLocale(item.value as 'zh-CN' | 'en-US')"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<style scoped>
.z-locale-switch {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border: 1px solid transparent;
  border-radius: 9999px;
}

.z-locale-switch__item {
  min-width: 28px;
  height: 24px;
  padding: 0 6px;
  border: none;
  border-radius: 9999px;
  background: transparent;
  color: inherit;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.z-locale-switch__item:hover {
  background-color: rgba(127, 127, 127, 0.14);
}

.z-locale-switch__item.is-active {
  background-color: rgba(99, 102, 241, 0.2);
  color: #6366f1;
}
</style>
