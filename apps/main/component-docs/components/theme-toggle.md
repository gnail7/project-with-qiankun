# ThemeToggle 主题切换

`ThemeToggle` 根据当前主题显示切换按钮，并调用 `useTheme().toggleTheme()`。

<script setup lang="ts">
import { ThemeToggle } from '@ziven/ui'
import { useTheme } from '@ziven/ui/theme'

const { initTheme } = useTheme()
initTheme()
</script>

<div class="demo-block">
  <p class="demo-block__title">主题切换</p>
  <ThemeToggle />
</div>

```vue
<script setup lang="ts">
import { ThemeToggle } from '@ziven/ui/ThemeToggle'
</script>

<template>
  <ThemeToggle />
</template>
```

主题会写入 `html.dark`，同时更新组件库使用的 CSS 变量。
