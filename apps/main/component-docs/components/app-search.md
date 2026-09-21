# AppSearch 全局搜索

`AppSearch` 提供 `⌘K / Ctrl+K` 快捷键打开的菜单搜索面板，搜索结果来自传入的菜单树叶子节点。

该组件依赖 `vue-router`，需要在使用方的路由上下文内渲染。

```vue
<script setup lang="ts">
import { AppSearch } from '@ziven/ui/AppSearch'
import type { BasicMenuItem } from '@ziven/ui'

const menus: BasicMenuItem[] = [
  { path: '/dashboard', title: '仪表盘' },
  {
    path: '/system',
    title: '系统管理',
    children: [{ path: '/system/user', title: '用户管理' }],
  },
]
</script>

<template>
  <AppSearch :menus="menus" placeholder="搜索菜单" />
</template>
```

| 属性          | 类型              | 默认值             | 说明           |
| ------------- | ----------------- | ------------------ | -------------- |
| `menus`       | `BasicMenuItem[]` | `[]`               | 菜单树         |
| `placeholder` | `string`          | `'搜索'`           | 搜索框占位文案 |
| `emptyText`   | `string`          | `'暂无匹配的菜单'` | 无结果提示     |
