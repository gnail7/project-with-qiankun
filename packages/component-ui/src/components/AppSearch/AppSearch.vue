<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { SearchOutlined, EnterOutlined } from '@ant-design/icons-vue'
import { flattenMenuLeaves, type BasicMenuItem } from '../../basic-types'

const props = withDefaults(
  defineProps<{
    menus?: BasicMenuItem[]
    placeholder?: string
    emptyText?: string
  }>(),
  { menus: () => [], placeholder: '搜索', emptyText: '暂无匹配的菜单' },
)

const router = useRouter()

const open = ref(false)
const keyword = ref('')
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

const flat = computed(() => flattenMenuLeaves(props.menus))
const results = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) {
    return flat.value
  }
  return flat.value.filter(item => item.title.toLowerCase().includes(kw))
})

function openModal(e?: Event) {
  e?.preventDefault()
  keyword.value = ''
  activeIndex.value = 0
  open.value = true
}

function closeModal() {
  open.value = false
}

function navigate(item: BasicMenuItem) {
  closeModal()
  router.push(item.path)
}

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    if (open.value) {
      closeModal()
    } else {
      openModal()
    }
    return
  }
  if (!open.value) {
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const item = results.value[activeIndex.value]
    if (item) {
      navigate(item)
    }
  } else if (e.key === 'Escape') {
    closeModal()
  }
}

function focusInput() {
  nextTick(() => inputRef.value?.focus())
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <button type="button" class="z-search__trigger" @click="openModal">
    <SearchOutlined class="z-search__icon" />
    <span class="z-search__text">{{ placeholder }}</span>
    <kbd class="z-search__kbd">⌘K</kbd>
  </button>

  <Teleport to="body">
    <Transition name="z-search-fade">
      <div v-if="open" class="z-search__overlay" @click.self="closeModal">
        <div class="z-search__panel">
          <div class="z-search__input-row">
            <SearchOutlined class="z-search__input-icon" />
            <input
              ref="inputRef"
              v-model="keyword"
              class="z-search__input"
              :placeholder="placeholder"
              @focus="focusInput"
            />
            <kbd class="z-search__kbd z-search__kbd--esc">ESC</kbd>
          </div>

          <div class="z-search__list">
            <div
              v-for="(item, index) in results"
              :key="item.path"
              class="z-search__item"
              :class="{ 'is-active': index === activeIndex }"
              @mouseenter="activeIndex = index"
              @click="navigate(item)"
            >
              <component :is="item.icon" v-if="item.icon" class="z-search__item-icon" />
              <span class="z-search__item-title">{{ item.title }}</span>
              <EnterOutlined v-if="index === activeIndex" class="z-search__item-enter" />
            </div>

            <div v-if="!results.length" class="z-search__empty">{{ emptyText }}</div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.z-search__trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  min-width: 180px;
  padding: 0 12px;
  border: 1px solid var(--z-border);
  border-radius: 8px;
  background: transparent;
  color: var(--z-text-muted);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.z-search__trigger:hover {
  border-color: var(--z-primary);
  color: var(--z-text);
}

.z-search__icon {
  font-size: 14px;
}

.z-search__text {
  flex: 1;
  text-align: left;
  font-size: 13px;
  white-space: nowrap;
}

.z-search__kbd {
  padding: 1px 5px;
  border: 1px solid var(--z-border);
  border-radius: 4px;
  font-size: 11px;
  color: var(--z-text-muted);
  background: var(--z-hover);
}

.z-search__kbd--esc {
  border: none;
  background: transparent;
}

.z-search__overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 12vh;
}

.z-search__panel {
  display: flex;
  flex-direction: column;
  width: min(640px, 92vw);
  max-height: 60vh;
  background: var(--z-card-bg);
  border: 1px solid var(--z-border);
  border-radius: 12px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.z-search__input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--z-border);
}

.z-search__input-icon {
  font-size: 18px;
  color: var(--z-text-muted);
}

.z-search__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--z-text);
  font-size: 15px;
}

.z-search__list {
  overflow: auto;
  padding: 8px;
}

.z-search__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--z-text);
  transition: background-color 0.12s ease;
}

.z-search__item.is-active {
  background: var(--z-primary-soft);
}

.z-search__item-icon {
  font-size: 16px;
  color: var(--z-text-muted);
}

.z-search__item-title {
  flex: 1;
  font-size: 14px;
}

.z-search__item-enter {
  font-size: 13px;
  color: var(--z-primary);
}

.z-search__empty {
  padding: 24px;
  text-align: center;
  color: var(--z-text-muted);
  font-size: 13px;
}

.z-search-fade-enter-active,
.z-search-fade-leave-active {
  transition: opacity 0.15s ease;
}

.z-search-fade-enter-from,
.z-search-fade-leave-to {
  opacity: 0;
}
</style>
