<template>
  <div class="search-container" :style="cssVars">
    <a-form
      :model="modelValue"
      layout="inline"
      class="search-container__form"
      @finish="handleSearch"
    >
      <div class="search-container__fields" :class="{ 'is-collapsed': innerCollapsed }">
        <a-form-item
          v-for="schema in visibleSchemas"
          :key="schema.field"
          :label="schema.label"
          class="search-container__item"
          :style="{ width: getItemWidth(schema) }"
        >
          <slot :name="schema.field" :schema="schema" :value="modelValue[schema.field]">
            <component
              :is="schema.component"
              v-model:value="modelValue[schema.field]"
              v-bind="schema.componentProps"
            />
          </slot>
        </a-form-item>
      </div>

      <div class="search-container__actions">
        <a-space>
          <a-button v-if="showSearch" type="primary" html-type="submit" :loading="loading">
            <SearchOutlined />
            {{ searchText }}
          </a-button>

          <a-button v-if="showReset" @click="handleReset">
            <ReloadOutlined />
            {{ resetText }}
          </a-button>

          <slot name="actions" />

          <a-button
            v-if="showCollapse && schemas.length > 1"
            type="link"
            class="search-container__collapse"
            @click="innerCollapsed = !innerCollapsed"
          >
            {{ innerCollapsed ? '展开' : '收起' }}
            <DownOutlined :class="{ 'is-expanded': !innerCollapsed }" />
          </a-button>
        </a-space>
      </div>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { theme } from 'ant-design-vue'
import { computed, ref, watch } from 'vue'
import { DownOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons-vue'
import type { SearchContainerProps, SearchSchema } from './types'

const props = withDefaults(defineProps<SearchContainerProps>(), {
  schemas: () => [],
  loading: false,
  collapsed: false,
  showCollapse: true,
  showSearch: true,
  showReset: true,
  searchText: '查询',
  resetText: '重置',
})

// 跟随 antd ConfigProvider 主题（亮/暗），以 CSS 变量注入 scoped 样式
const { token } = theme.useToken()
const cssVars = computed(() => {
  const t = token?.value ?? token ?? {}
  return {
    '--sc-bg': t.colorBgContainer || '#ffffff',
    '--sc-border': t.colorBorderSecondary || 'rgba(5, 5, 5, 0.06)',
    '--sc-text': t.colorText || 'rgba(0, 0, 0, 0.88)',
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'update:collapsed': [value: boolean]
  search: [value: Record<string, any>]
  reset: [value: Record<string, any>]
}>()

const innerCollapsed = ref(props.collapsed)

watch(
  () => props.collapsed,
  value => {
    innerCollapsed.value = value
  },
)

watch(innerCollapsed, value => {
  emit('update:collapsed', value)
})

const schemas = computed(() => {
  return props.schemas.filter(item => !item.hidden)
})

const visibleSchemas = computed(() => {
  if (!props.showCollapse || !innerCollapsed.value) {
    return schemas.value
  }

  return schemas.value.slice(0, 3)
})

const getItemWidth = (schema: SearchSchema) => {
  if (schema.colProps?.span) {
    return `${(schema.colProps.span / 24) * 100}%`
  }

  return '280px'
}

const handleSearch = () => {
  emit('search', props.modelValue)
}

const handleReset = () => {
  const values = { ...props.modelValue }

  schemas.value.forEach(schema => {
    values[schema.field] = schema.defaultValue ?? undefined
  })

  emit('update:modelValue', values)
  emit('reset', values)
}
</script>

<style scoped>
.search-container {
  padding: 20px 24px 4px;
  margin-bottom: 16px;
  color: var(--sc-text);
  background: var(--sc-bg);
  border: 1px solid var(--sc-border);
  border-radius: 6px;
}

.search-container__form {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.search-container__fields {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  min-width: 0;
}

.search-container__item {
  box-sizing: border-box;
  padding-right: 16px;
  margin-bottom: 16px;
}

.search-container__item :deep(.ant-form-item-control) {
  min-width: 0;
}

.search-container__item :deep(.ant-input),
.search-container__item :deep(.ant-select),
.search-container__item :deep(.ant-picker) {
  width: 100%;
}

.search-container__actions {
  flex-shrink: 0;
  margin-bottom: 16px;
}

.search-container__collapse {
  padding: 0 4px;
}

.search-container__collapse .anticon {
  transition: transform 0.2s;
}

.search-container__collapse .is-expanded {
  transform: rotate(180deg);
}
</style>
