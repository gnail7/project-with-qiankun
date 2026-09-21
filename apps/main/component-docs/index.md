---
layout: home
hero:
  name: Ziven UI
  text: Vue 3 组件库
  tagline: 面向中后台场景的可复用组件、主题与布局能力
  image:
    src: /logo.svg
    alt: Ziven UI
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 浏览组件
      link: /components/op-button
features:
  - icon: ⚡️
    title: 开箱即用
    details: 基于 Vue 3、TypeScript 与 ant-design-vue，适配中后台项目。
  - icon: 🎨
    title: 主题统一
    details: 内置亮暗主题、主题色、语言和布局偏好能力。
  - icon: 🧩
    title: 业务友好
    details: 表格、搜索容器、布局壳等常见业务组件直接复用。
---

<script setup lang="ts">
import { useTheme } from '@ziven/ui/theme'

const { initTheme } = useTheme()
initTheme()
</script>

## 文档范围

本网站文档直接引用工作区内的 `@ziven/ui` 源码，组件 API、示例和实现始终保持同步。

组件目录包括：

- 基础组件：`OpButton`、`VerificationCode`、`LocaleSwitch`、`ThemeToggle`
- 业务组件：`BasicTable`、`SearchContainer`、`AppSearch`、`PreferencesDrawer`、`BasicLayout`
- 能力模块：`useTheme`、`useLocale`、`usePreferences`
