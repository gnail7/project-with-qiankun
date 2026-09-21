# LocaleSwitch 语言切换

`LocaleSwitch` 封装 `useLocale`，提供中文和英文两个选项，并自动持久化当前语言。

<script setup lang="ts">
import { LocaleSwitch } from '@ziven/ui'
</script>

<div class="demo-block">
  <p class="demo-block__title">当前语言</p>
  <LocaleSwitch />
</div>

```vue
<script setup lang="ts">
import { LocaleSwitch } from '@ziven/ui/LocaleSwitch'
</script>

<template>
  <LocaleSwitch />
</template>
```

应用的 `vue-i18n` 或其他国际化方案需要自行监听 `useLocale().locale` 完成文案切换。
