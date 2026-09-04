<template>
  <div class="base-table" :style="cssVars">
    <div v-if="$slots.toolbar || showToolbar" class="base-table__toolbar">
      <div class="base-table__toolbar-left">
        <slot name="toolbar" />
      </div>

      <div class="base-table__toolbar-right">
        <slot name="toolbar-right">
          <a-button v-if="showRefresh" type="text" :loading="loading" @click="emit('refresh')">
            <template #icon>
              <ReloadOutlined />
            </template>
          </a-button>
        </slot>
      </div>
    </div>

    <a-table
      ref="tableRef"
      :columns="tableColumns"
      :data-source="data"
      :loading="loading"
      :row-key="rowKey"
      :pagination="false"
      :row-selection="rowSelection"
      :expandable="expandable"
      :bordered="bordered"
      :size="size"
      :scroll="scroll"
      :custom-row="customRow"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === DRAG_KEY">
          <HolderOutlined class="drag-handle" />
        </template>

        <slot
          v-else-if="column.slot"
          :name="column.slot"
          :record="record"
          :index="index"
          :column="column"
        />

        <template v-else-if="column.formatter">
          {{ column.formatter(record[column.dataIndex], record, index) }}
        </template>

        <template v-else>
          {{ record[column.dataIndex] }}
        </template>
      </template>

      <template v-if="expandable" #expandedRowRender="{ record, index }">
        <slot name="expandedRow" :record="record" :index="index" />
      </template>
    </a-table>

    <div v-if="pagination" class="base-table__pagination">
      <a-pagination
        v-model:current="currentPage"
        v-model:page-size="currentPageSize"
        :total="total"
        :page-size-options="pageSizes.map(String)"
        show-size-changer
        show-quick-jumper
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { theme } from 'ant-design-vue'
import type { TableProps, TableColumnsType } from 'ant-design-vue'
import { computed, ref } from 'vue'
import { HolderOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import type { BasicColumn } from './types'

const DRAG_KEY = '__drag__'

// 跟随 antd ConfigProvider 主题（亮/暗），以 CSS 变量注入 scoped 样式
const { token } = theme.useToken()
const cssVars = computed(() => {
  const t = token?.value ?? token ?? {}
  return {
    '--bt-icon': t.colorTextTertiary || 'rgba(0, 0, 0, 0.45)',
    '--bt-icon-hover': t.colorPrimary || '#1677ff',
  }
})

interface Props {
  columns: BasicColumn[]
  data?: any[]
  loading?: boolean

  rowKey?: string | ((record: any) => string | number)

  selectable?: boolean
  reserveSelection?: boolean

  draggable?: boolean

  total?: number
  page?: number
  pageSize?: number
  pageSizes?: number[]
  pagination?: boolean

  showToolbar?: boolean
  showRefresh?: boolean

  bordered?: boolean
  size?: TableProps['size']
  scroll?: TableProps['scroll']
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => [],
  data: () => [],
  loading: false,

  rowKey: 'id',

  selectable: false,
  reserveSelection: false,
  draggable: false,

  total: 0,
  page: 1,
  pageSize: 20,
  pageSizes: () => [10, 20, 30, 50],

  pagination: true,

  showToolbar: true,
  showRefresh: true,

  bordered: false,
  size: 'middle',
})

const emit = defineEmits<{
  'update:page': [value: number]
  'update:pageSize': [value: number]

  'selection-change': [rows: any[]]

  refresh: []

  'drag-end': [
    {
      oldIndex: number
      newIndex: number
      data: any[]
    },
  ]
}>()

const tableRef = ref()

const currentPage = computed({
  get: () => props.page,
  set: value => emit('update:page', value),
})

const currentPageSize = computed({
  get: () => props.pageSize,
  set: value => emit('update:pageSize', value),
})

const visibleColumns = computed(() => props.columns.filter(column => !column.hidden))

const tableColumns = computed<TableColumnsType>(() => {
  const columns = visibleColumns.value.map(column => ({
    ...column,
    align: column.align || 'center',
  }))

  if (!props.draggable) {
    return columns
  }

  return [
    {
      title: '',
      key: DRAG_KEY,
      width: 40,
      align: 'center',
    },
    ...columns,
  ]
})

const expandable = computed(() => {
  const column = props.columns.find(column => column.key === 'expandedRow')

  if (!column) {
    return undefined
  }

  return {
    rowExpandable: () => true,
  }
})

const selectedMap = new Map<string | number, any>()

function getRowKey(record: any) {
  return typeof props.rowKey === 'function' ? props.rowKey(record) : record[props.rowKey]
}

const rowSelection = computed<TableProps['rowSelection']>(() => {
  if (!props.selectable) {
    return undefined
  }

  return {
    preserveSelectedRowKeys: props.reserveSelection,

    selectedRowKeys: props.reserveSelection ? Array.from(selectedMap.keys()) : undefined,

    onChange: (_keys, rows) => {
      if (!props.reserveSelection) {
        emit('selection-change', rows)
        return
      }

      const currentKeys = new Set(props.data.map(getRowKey))

      rows.forEach(row => {
        selectedMap.set(getRowKey(row), row)
      })

      currentKeys.forEach(key => {
        if (!rows.some(row => getRowKey(row) === key)) {
          selectedMap.delete(key)
        }
      })

      emit('selection-change', Array.from(selectedMap.values()))
    },
  }
})

let dragIndex = -1

function customRow(record: any, index: number) {
  if (!props.draggable) {
    return {}
  }

  return {
    draggable: true,

    onDragstart: () => {
      dragIndex = index
    },

    onDragover: (event: DragEvent) => {
      event.preventDefault()
    },

    onDrop: (event: DragEvent) => {
      event.preventDefault()

      if (dragIndex < 0 || dragIndex === index) {
        return
      }

      const data = [...props.data]
      const [item] = data.splice(dragIndex, 1)

      data.splice(index, 0, item)

      emit('drag-end', {
        oldIndex: dragIndex,
        newIndex: index,
        data,
      })

      dragIndex = -1
    },

    onDragend: () => {
      dragIndex = -1
    },
  }
}

function clearSelection() {
  selectedMap.clear()
  emit('selection-change', [])
}

function getSelectedRows() {
  return [...selectedMap.values()]
}

function getSelectedIds() {
  return getSelectedRows().map(getRowKey)
}

defineExpose({
  clearSelection,
  getSelectedRows,
  getSelectedIds,
})
</script>

<style scoped>
.base-table {
  width: 100%;
}

.base-table__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.base-table__toolbar-left,
.base-table__toolbar-right {
  display: flex;
  align-items: center;
}

.base-table__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.drag-handle {
  color: var(--bt-icon);
  cursor: move;
}

.drag-handle:hover {
  color: var(--bt-icon-hover);
}
</style>
