# 主题与语言

## `useTheme`

`useTheme` 是模块级单例，适合在主应用和子应用之间共享主题状态。

```ts
import { useTheme } from '@ziven/ui/theme'

const { theme, isDark, primaryColor, initTheme, setTheme, toggleTheme, setPrimaryColor } =
  useTheme()

initTheme()
setTheme('dark')
setPrimaryColor('#6366f1')
```

## `useLocale`

```ts
import { useLocale } from '@ziven/ui/locale'

const { locale, initLocale, setLocale } = useLocale()

initLocale()
setLocale('en-US')
```

支持 `zh-CN` 和 `en-US`。`LocaleSwitch` 是对这个 hook 的可视化封装。

## `usePreferences`

```ts
import { usePreferences } from '@ziven/ui/preferences'

const { layout, collapsed, setLayout, toggleCollapsed } = usePreferences()

setLayout('sidebar')
toggleCollapsed()
```

`BasicLayout` 会自动读取布局和折叠状态；独立使用时也可以通过 hook 控制自己的布局。
