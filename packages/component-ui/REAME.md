# @ziven/ui

公共组件库（Vue 3 + TS + ant-design-vue），提供开箱即用的通用组件、主题/语言/偏好 hooks 以及一套 vben 风格的布局壳。

## 子路径导出

| 子路径                        | 内容                                             |
| ----------------------------- | ------------------------------------------------ |
| `@ziven/ui`                   | 全量 barrel                                      |
| `@ziven/ui/theme`             | `useTheme`、`PRIMARY_COLORS`、`PRIMARY_COLOR`    |
| `@ziven/ui/locale`            | `useLocale`                                      |
| `@ziven/ui/preferences`       | `usePreferences`（布局/折叠）                    |
| `@ziven/ui/BasicLayout`       | `BasicLayout` + `BasicMenuItem`/`BasicUser` 类型 |
| `@ziven/ui/AppSearch`         | `AppSearch`（⌘K 菜单搜索）                       |
| `@ziven/ui/PreferencesDrawer` | `PreferencesDrawer`（偏好设置）                  |
| `@ziven/ui/ThemeToggle`       | `ThemeToggle`（主题切换，平滑动画）              |
| `@ziven/ui/LocaleSwitch`      | `LocaleSwitch`（中/EN 切换）                     |

> peer 依赖：`vue`、`ant-design-vue`、`vue-router`。消费方需安装这三个，BasicLayout 依赖 router 做菜单跳转/面包屑（菜单 `title` 由消费方自行 i18n 翻译后传入）。

## BasicLayout 用法

```vue
<script setup lang="ts">
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
const user: BasicUser = { nickname: 'Admin', avatar: '' }

function onLogout() {
  // 消费方自己处理登出
}
</script>

<template>
  <BasicLayout :menus="menus" app-name="My Admin" :user="user" @logout="onLogout">
    <router-view />
  </BasicLayout>
</template>
```

### Props / 事件

- `menus: BasicMenuItem[]` —— 已翻译标题的菜单树（含 `children` 递归）。
- `appName?: string` —— 左上角 logo 文案。
- `user?: BasicUser` —— `{ name?, nickname?, avatar? }`。
- `breadcrumb?: { title: string; path?: string }[]` —— 可选，默认根据菜单树 + 当前路由推导。
- `searchPlaceholder?: string` —— 搜索框占位文案。
- `@logout` —— 用户下拉“退出登录”触发。

### 顶部能力（内置）

- **搜索**：点击搜索框或按 `⌘K / Ctrl+K` 打开命令面板，支持方向键 + 回车直达菜单页面。
- **偏好设置**：右上角齿轮打开抽屉，可切 主题模式（亮/暗）、主题色（5 个预设）、布局模式（侧边栏/顶部）。
- **主题切换**：按钮切换亮/暗，走 View Transition 平滑动画（不刷新页面）。
- 全屏、消息铃铛、语言切换、用户下拉（头像 + 退出）。

## 主题 / 语言 / 偏好 hooks

三者都是模块级单例并持久化到 `localStorage`，任意组件 import 到的是同一份状态：

```ts
const { theme, isDark, primaryColor, setTheme, toggleTheme, setPrimaryColor, initTheme } =
  useTheme()
const { locale, setLocale } = useLocale()
const { layout, collapsed, toggleCollapsed, setLayout } = usePreferences()
```

- `useTheme`：默认 dark；`toggleTheme()` 默认带动画（不 reload）。
- 主题色通过 `--z-primary` 等 CSS 变量写入 `<html>`，antd 与布局同步生效。
