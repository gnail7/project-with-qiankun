# 快速开始

## 安装

组件库当前作为 workspace 包使用：

```bash
pnpm add @ziven/ui vue ant-design-vue vue-router
```

`vue`、`ant-design-vue` 和 `vue-router` 是组件库的 peer dependency，消费方需要自行安装。

## 注册 Ant Design Vue

组件库中的 `OpButton`、`BasicTable` 和 `SearchContainer` 依赖 ant-design-vue 组件。应用入口注册一次即可：

```ts
import Antd from 'ant-design-vue'
import { createApp } from 'vue'
import App from './App.vue'
import 'ant-design-vue/dist/reset.css'

createApp(App).use(Antd).mount('#app')
```

## 引入组件

推荐从组件对应的子路径引入：

```ts
import { OpButton } from '@ziven/ui/OpButton'
import { BasicTable } from '@ziven/ui'
```

也可以从根入口引入全部公开组件：

```ts
import { BasicTable, OpButton, useTheme } from '@ziven/ui'
```

## 主题初始化

如果应用使用组件库的主题能力，建议在应用入口初始化一次：

```ts
import { useTheme } from '@ziven/ui/theme'

const { initTheme } = useTheme()
initTheme()
```

主题状态会写入 `html` 元素，并通过 CSS 变量被组件库和宿主应用共享。
