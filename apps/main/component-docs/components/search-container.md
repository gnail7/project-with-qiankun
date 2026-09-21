# SearchContainer 搜索容器

`SearchContainer` 根据 schema 自动生成查询表单，支持重置、加载、插槽和超过 4 项时的展开收起。

<script setup lang="ts">
import { ref } from 'vue'
import { Input, Select } from 'ant-design-vue'
import { SearchContainer } from '@ziven/ui'
import type { SearchSchema } from '@ziven/ui'

const form = ref({ keyword: '', role: undefined })
const message = ref('')
const schemas: SearchSchema[] = [
  { field: 'keyword', label: '关键词', component: Input, componentProps: { placeholder: '输入关键词' } },
  {
    field: 'role',
    label: '角色',
    component: Select,
    componentProps: {
      placeholder: '选择角色',
      options: [
        { label: '管理员', value: 'admin' },
        { label: '开发者', value: 'developer' },
      ],
    },
  },
]

function search(value: Record<string, unknown>) {
  message.value = `查询参数：${JSON.stringify(value)}`
}

function reset(value: Record<string, unknown>) {
  message.value = `已重置：${JSON.stringify(value)}`
}
</script>

<div class="demo-block">
  <SearchContainer
    v-model="form"
    :schemas="schemas"
    @search="search"
    @reset="reset"
  />
  <p>{{ message }}</p>
</div>

```vue
<SearchContainer
  v-model="form"
  :schemas="schemas"
  :loading="loading"
  @search="handleSearch"
  @reset="handleReset"
>
  <template #actions>
    <a-button @click="exportData">导出</a-button>
  </template>
</SearchContainer>
```

`SearchSchema.component` 接受 Vue 组件，`componentProps` 会透传给动态组件；也可以用 `#字段名` 插槽完全接管字段渲染。
