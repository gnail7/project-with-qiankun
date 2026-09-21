<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DemoItem } from '@/types'

defineProps<{ demo: DemoItem }>()

interface TableRow {
  name: string
  role: string
  status: string
}

const rows: TableRow[] = [
  { name: 'Ada Lovelace', role: '管理员', status: '活跃' },
  { name: 'Grace Hopper', role: '开发者', status: '活跃' },
  { name: 'Linus Torvalds', role: '维护者', status: '离线' },
]

const keyword = ref('')

const filteredRows = computed(() =>
  rows.filter(
    row =>
      !keyword.value ||
      `${row.name}${row.role}`.toLowerCase().includes(keyword.value.toLowerCase()),
  ),
)
</script>

<template>
  <div class="preview-stack">
    <div class="preview-toolbar">
      <label class="preview-input preview-input--search">
        <span>⌕</span>
        <input v-model="keyword" placeholder="筛选用户" />
      </label>
      <span class="preview-status">{{ filteredRows.length }} 条数据</span>
    </div>

    <div class="preview-table-wrap">
      <table class="preview-table">
        <thead>
          <tr>
            <th>用户</th>
            <th>角色</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filteredRows" :key="row.name">
            <td>{{ row.name }}</td>
            <td>{{ row.role }}</td>
            <td>
              <span class="preview-dot" :class="{ 'is-offline': row.status === '离线' }" />{{
                row.status
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
