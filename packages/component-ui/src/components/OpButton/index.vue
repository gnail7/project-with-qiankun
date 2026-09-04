<template>
  <a-button
    :type="nativeType"
    :size="size"
    :danger="danger"
    :color="resolvedColor"
    :disabled="disabled"
    :loading="loading"
    v-bind="$attrs"
    @click="emit('click', $event)"
  >
    <template #icon>
      <slot name="icon">
        <component :is="resolvedIcon" v-if="resolvedIcon" />
      </slot>
    </template>
    <slot>{{ label }}</slot>
  </a-button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ExportOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue'
import type { OpButtonProps } from './types'

const props = withDefaults(defineProps<OpButtonProps>(), {
  action: '',
  variant: 'text',
  size: 'small',
  label: '',
  icon: undefined,
  danger: undefined,
  color: undefined,
  disabled: false,
  loading: false,
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

/** 内置操作 -> 默认图标 */
const DEFAULT_ICONS: Record<string, Component> = {
  add: PlusOutlined,
  edit: EditOutlined,
  delete: DeleteOutlined,
  view: EyeOutlined,
  download: DownloadOutlined,
  export: ExportOutlined,
}

/** 内置操作 -> 默认颜色（antd 预设色） */
const ACTION_COLORS: Record<string, string> = {
  add: '#52c41a', // 新增：绿色
  edit: '#1677ff', // 编辑：蓝色
  delete: '#ff4d4f', // 删除：红色
  view: '#722ed1', // 查看：紫色
  download: '#13c2c2', // 下载：青色
  export: '#fa8c16', // 导出：橙色
}

const nativeType = computed(() => (props.variant === 'solid' ? 'primary' : 'link'))

/** 删除类操作默认红色危险样式，可通过 danger prop 显式覆盖 */
const danger = computed(() => props.danger ?? props.action === 'delete')

/** color prop > 操作默认颜色 > 无 */
const resolvedColor = computed(() => props.color ?? ACTION_COLORS[props.action ?? ''] ?? undefined)

/** icon prop > 内置默认图标 > 无 */
const resolvedIcon = computed(() => props.icon ?? DEFAULT_ICONS[props.action ?? ''] ?? undefined)
</script>
