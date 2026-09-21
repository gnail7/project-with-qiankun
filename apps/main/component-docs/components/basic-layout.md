# BasicLayout 基础布局

`BasicLayout` 是面向中后台项目的布局壳，内置侧边栏 / 顶部布局、菜单搜索、面包屑、用户菜单和偏好设置入口。

组件依赖 `vue-router`，下面的示例需要放在已经安装路由的应用中运行，因此文档只展示接入代码。

```vue
<script setup lang="ts">
import { DashboardOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons-vue'
import { BasicLayout } from '@ziven/ui/BasicLayout'
import type { BasicMenuItem, BasicUser } from '@ziven/ui/BasicLayout'

const menus: BasicMenuItem[] = [
  { path: '/dashboard', title: '仪表盘', icon: DashboardOutlined },
  {
    path: '/system',
    title: '系统管理',
    icon: SettingOutlined,
    children: [{ path: '/system/user', title: '用户管理', icon: UserOutlined }],
  },
]

const user: BasicUser = { nickname: 'Admin' }
</script>

<template>
  <BasicLayout :menus="menus" app-name="My Admin" :user="user" @logout="logout">
    <router-view />
  </BasicLayout>
</template>
```

| 属性 / 事件         | 类型                 | 默认值    | 说明                 |
| ------------------- | -------------------- | --------- | -------------------- |
| `menus`             | `BasicMenuItem[]`    | `[]`      | 菜单树               |
| `appName`           | `string`             | `'Admin'` | 左上角应用名称       |
| `user`              | `BasicUser`          | `{}`      | 用户信息             |
| `breadcrumb`        | `{ title, path? }[]` | -         | 覆盖自动推导的面包屑 |
| `searchPlaceholder` | `string`             | `'搜索'`  | 菜单搜索占位文案     |
| `@logout`           | `() => void`         | -         | 点击退出登录         |
