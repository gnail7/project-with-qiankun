# PreferencesDrawer 偏好设置

`PreferencesDrawer` 提供主题模式、主题色和布局模式的可视化配置，并与 `useTheme`、`usePreferences` 共享状态。

<script setup lang="ts">
import { PreferencesDrawer } from '@ziven/ui'
</script>

<div class="demo-block">
  <p class="demo-block__title">点击右侧设置按钮打开偏好面板</p>
  <PreferencesDrawer title="Ziven UI 偏好设置" />
</div>

```vue
<script setup lang="ts">
import { PreferencesDrawer } from '@ziven/ui/PreferencesDrawer'
</script>

<template>
  <PreferencesDrawer title="偏好设置" />
</template>
```

| 属性    | 类型     | 默认值       | 说明     |
| ------- | -------- | ------------ | -------- |
| `title` | `string` | `'偏好设置'` | 抽屉标题 |
