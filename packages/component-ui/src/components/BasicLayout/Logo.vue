<script setup lang="ts">
withDefaults(
  defineProps<{
    appName?: string
    collapsed?: boolean
  }>(),
  { appName: '', collapsed: false },
)
</script>

<template>
  <div class="z-logo" :class="{ 'is-collapsed': collapsed }">
    <span class="z-logo__mark">Z</span>
    <span v-if="appName && !collapsed" class="z-logo__name">{{ appName }}</span>
  </div>
</template>

<style scoped>
.z-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  padding: 0 16px;
  overflow: hidden;
  white-space: nowrap;
}

.z-logo__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 8px;
  background: var(--z-primary);
  color: #fff;
  font-weight: 700;
  font-size: 14px;
}

.z-logo__name {
  font-size: 16px;
  font-weight: 700;
  color: var(--z-text);
  letter-spacing: 0.2px;
}
</style>
