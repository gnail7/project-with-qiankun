<template>
  <div class="search-container" :style="cssVars">
    <a-form
      :model="modelValue"
      layout="inline"
      class="search-container__form"
      @finish="handleSearch"
    >
      <!-- 搜索条件 -->
      <div
        class="search-container__fields"
        :class="{
          'is-collapsed': innerCollapsed,
        }"
      >
        <a-form-item
          v-for="schema in visibleSchemas"
          :key="schema.field"
          :label="schema.label"
          class="search-container__item"
          :style="{
            gridColumn: getItemGridColumn(schema),
          }"
        >
          <!-- 自定义字段插槽 -->
          <slot :name="schema.field" :schema="schema" :value="modelValue[schema.field]">
            <!-- 默认组件 -->
            <component
              :is="schema.component"
              v-model:value="modelValue[schema.field]"
              v-bind="schema.componentProps"
            />
          </slot>
        </a-form-item>
      </div>

      <!-- 操作区域 -->
      <div class="search-container__actions">
        <a-space>
          <!-- 查询 -->
          <a-button v-if="showSearch" type="primary" html-type="submit" :loading="loading">
            <SearchOutlined />
            {{ searchText }}
          </a-button>

          <!-- 重置 -->
          <a-button v-if="showReset" @click="handleReset">
            <ReloadOutlined />
            {{ resetText }}
          </a-button>

          <!-- 自定义操作 -->
          <slot name="actions" />

          <!-- 展开 / 收起 -->
          <a-button
            v-if="showCollapse && schemas.length > 4"
            type="link"
            class="search-container__collapse"
            @click="toggleCollapse"
          >
            {{ innerCollapsed ? '展开' : '收起' }}

            <DownOutlined
              :class="{
                'is-expanded': !innerCollapsed,
              }"
            />
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

/**
 * Props
 */
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

/**
 * Emits
 */
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'update:collapsed': [value: boolean]
  search: [value: Record<string, any>]
  reset: [value: Record<string, any>]
}>()

/**
 * Ant Design Vue Theme Token
 *
 * 自动跟随 ConfigProvider 的亮色 / 暗色主题
 */
const { token } = theme.useToken()

const cssVars = computed(() => {
  const t = token?.value ?? token ?? {}

  return {
    '--sc-bg': t.colorBgContainer || '#ffffff',
    '--sc-bg-secondary': t.colorBgElevated || '#ffffff',
    '--sc-border': t.colorBorderSecondary || 'rgba(5, 5, 5, 0.06)',
    '--sc-text': t.colorText || 'rgba(0, 0, 0, 0.88)',
    '--sc-text-secondary': t.colorTextSecondary || 'rgba(0, 0, 0, 0.65)',
    '--sc-hover': t.colorFillSecondary || 'rgba(0, 0, 0, 0.04)',
    '--sc-primary': t.colorPrimary || '#1677ff',
  }
})

/**
 * 内部展开状态
 */
const innerCollapsed = ref(props.collapsed)

/**
 * 外部 collapsed 改变
 */
watch(
  () => props.collapsed,
  value => {
    innerCollapsed.value = value
  },
)

/**
 * 内部 collapsed 改变
 */
watch(innerCollapsed, value => {
  emit('update:collapsed', value)
})

/**
 * 过滤隐藏字段
 */
const schemas = computed(() => {
  return props.schemas.filter(item => !item.hidden)
})

/**
 * 当前显示的搜索条件
 *
 * 收起：
 *   只显示前 4 个
 *
 * 展开：
 *   显示全部
 */
const visibleSchemas = computed(() => {
  // 不显示展开/收起
  if (!props.showCollapse) {
    return schemas.value
  }

  // 当前是展开状态
  if (!innerCollapsed.value) {
    return schemas.value
  }

  // 收起状态
  return schemas.value.slice(0, 4)
})

/**
 * 计算 Grid 占用列数
 *
 * 默认：
 *   1 个条件 = 1 格
 *
 * 如果配置了 Ant Design 24 栅格：
 *
 *   span: 6  -> 1 格
 *   span: 12 -> 2 格
 *   span: 18 -> 3 格
 *   span: 24 -> 4 格
 */
const getItemGridColumn = (schema: SearchSchema) => {
  const span = schema.colProps?.span

  if (!span) {
    return 'span 1'
  }

  const gridSpan = Math.ceil(span / 6)

  return `span ${Math.min(Math.max(gridSpan, 1), 4)}`
}

/**
 * 切换展开 / 收起
 */
const toggleCollapse = () => {
  innerCollapsed.value = !innerCollapsed.value
}

/**
 * 查询
 */
const handleSearch = () => {
  emit('search', {
    ...props.modelValue,
  })
}

/**
 * 重置
 */
const handleReset = () => {
  const values = {
    ...props.modelValue,
  }

  schemas.value.forEach(schema => {
    values[schema.field] = schema.defaultValue ?? undefined
  })

  emit('update:modelValue', values)

  emit('reset', values)
}
</script>

<style scoped>
@import url('./index.css');
</style>
