# BasicTable 基础表格

`BasicTable` 在 ant-design-vue 的表格上增加了工具栏、分页、选择、拖拽排序、列宽调整和单元格插槽能力。

<script setup lang="ts">
import { ref } from 'vue'
import { BasicTable } from '@ziven/ui'
import type { BasicColumn } from '@ziven/ui'

interface UserRow {
  id: number
  name: string
  role: string
}

const page = ref(1)
const pageSize = ref(10)
const users = ref<UserRow[]>([
  { id: 1, name: 'Ada Lovelace', role: '管理员' },
  { id: 2, name: 'Grace Hopper', role: '开发者' },
  { id: 3, name: 'Linus Torvalds', role: '维护者' },
])

const columns: BasicColumn[] = [
  { title: '姓名', dataIndex: 'name', key: 'name', width: 220 },
  { title: '角色', dataIndex: 'role', key: 'role', width: 180 },
]
</script>

<div class="demo-block demo-block--wide">
  <p class="demo-block__title">基础表格 + 分页</p>
  <BasicTable
    v-model:page="page"
    v-model:page-size="pageSize"
    :columns="columns"
    :data="users"
    :total="30"
    resizable
  />
</div>

拖动表头列之间的分隔线可以调整列宽。也可以在列配置中单独开启，并通过 `minWidth` / `maxWidth` 限制范围：

```ts
const columns: BasicColumn[] = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    width: 220,
    resizable: true,
    minWidth: 120,
    maxWidth: 360,
  },
]
```

## 选择与刷新

```vue
<BasicTable
  :columns="columns"
  :data="data"
  selectable
  reserve-selection
  @selection-change="selectedRows = $event"
  @refresh="loadData"
  @update:page="page = $event"
  @update:page-size="pageSize = $event"
/>
```

## API

<div class="api-table">

| 属性 / 事件         | 类型                                  | 默认值  | 说明                 |
| ------------------- | ------------------------------------- | ------- | -------------------- |
| `columns`           | `BasicColumn[]`                       | `[]`    | 列定义               |
| `data`              | `object[]`                            | `[]`    | 表格数据             |
| `rowKey`            | `string \| (row) => string \| number` | `'id'`  | 行标识               |
| `selectable`        | `boolean`                             | `false` | 开启多选             |
| `reserveSelection`  | `boolean`                             | `false` | 跨页保留选中项       |
| `draggable`         | `boolean`                             | `false` | 开启拖拽排序         |
| `resizable`         | `boolean`                             | `false` | 开启所有列的列宽拖拽 |
| `pagination`        | `boolean`                             | `true`  | 是否显示分页         |
| `@selection-change` | `(rows) => void`                      | -       | 选中项变化           |
| `@refresh`          | `() => void`                          | -       | 点击刷新             |
| `@drag-end`         | `(payload) => void`                   | -       | 拖拽排序完成         |
| `@column-resize`    | `({ key, width, column }) => void`    | -       | 列宽调整完成         |

</div>

列配置中的 `slot` 可以配合同名插槽自定义单元格，组件实例还暴露 `clearSelection`、`getSelectedRows` 和 `getSelectedIds`。
