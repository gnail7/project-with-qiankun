# 主题切换、国际化、以及 qiankun 子应用状态共享

做这套的时候踩了不少坑，趁记忆还热乎，把思路和实现记下来。不然过俩月我自己都忘了当初为什么这么写。

## 先说结论

这个项目是 pnpm 单仓，三个包：

- `apps/main/qiankun` —— 主应用（宿主）
- `apps/admin` —— 一个子应用，被主应用用 qiankun 挂到 `#subapp-container` 里
- `packages/component-ui`（`@ziven/ui`）—— 公共组件库

一开始主题和语言是各写各的：admin 有个 `appStore`，主应用自己在 `App.vue` 里手动 toggle。两个地方两套逻辑，改起来很乱。后来想通了：**主题和语言这种全局状态，就该收口在组件库里**，谁要用谁 import，别在应用层自己造轮子。所以我把它们做成了 hook + 组件，扔进 `@ziven/ui`。

## 主题：useTheme

`packages/component-ui/src/theme/index.ts`，一个模块级单例：

```ts
const theme = ref<ThemeMode>(loadTheme())
const isDark = computed(() => theme.value === 'dark')

export function useTheme() {
  function setTheme(value, reload = false) {
    theme.value = value
    localStorage.setItem(STORAGE_KEY, value)
    applyTheme(value)
    if (reload) window.location.reload()
  }
  function toggleTheme(reload = true) {
    setTheme(theme.value === 'dark' ? 'light' : 'dark', reload)
  }
  function initTheme() {
    applyTheme(theme.value)
    return theme.value
  }
  return { theme, isDark, setTheme, toggleTheme, initTheme }
}
```

几个点：

- **单例**。用 `ref` 放在模块顶层，多个组件 import 到的是同一份状态，改一处全生效。别用那种“每次调用返回新 ref”的写法，那种只能做局部状态。
- **localStorage 持久化**，key 是 `ziven-theme`，**默认 dark**。没存过就按 dark 来。
- 模块加载的时候就 `applyTheme` 一次，把 `.dark` class 挂到 `html` 上，保证首屏不闪一下。
- `toggleTheme` 默认 `reload = true`。为什么？因为主题这事牵扯到 antd 算法、tailwind class、组件库的 CSS 变量三套东西，热更新或者局部改容易改不干净，干脆**切了就 reload**，让整个页面重新跑一遍，状态最干净。虽然粗暴，但省心。

`applyTheme` 就干两件事：

```ts
function applyTheme(value) {
  document.documentElement.classList.toggle('dark', value === 'dark')
  document.documentElement.style.colorScheme = value
}
```

`colorScheme` 是为了让原生滚动条、输入框这些跟着走。

## 语言：useLocale

`packages/component-ui/src/locale/index.ts`，结构跟 useTheme 差不多：

```ts
const locale = ref<LocaleCode>(load())
const isZh = computed(() => locale.value === 'zh-CN')

export function useLocale() {
  function setLocale(value, reload = false) {
    locale.value = value
    localStorage.setItem(STORAGE_KEY, value)
    document.documentElement.lang = value === 'zh-CN' ? 'zh-CN' : 'en'
    if (reload) window.location.reload()
  }
  // ...
}
```

它**不依赖 vue-i18n**。为什么？组件库不该绑死某个 i18n 方案，所以 hook 只负责“当前语言是什么、存到哪、`document.lang` 设对”，至于同步给 vue-i18n，那是消费方的事。消费方 `watch(locale)` 自己接就行。

## 组件

两个组件放组件库里：

- `ThemeToggle`：一个按钮，太阳/月亮，点一下 `toggleTheme()`。
- `LocaleSwitch`：一个分段 pill，`中 | EN`，点哪个 `setLocale` 哪个。

好处是主应用和 admin 用的是**同一个东西**，样子绝对一致，不用两边维护两份样式。

有个细节：组件库导出了**子路径**，比如 `@ziven/ui/theme`、`@ziven/ui/LocaleSwitch`。因为主应用没装 ant-design-vue，而组件库入口文件 `src/index.ts` 会带着 BasicTable/SearchContainer 这些 antd 组件。主应用只想用主题/语言 hook，走子路径就不会把 antd 拖进来。不然就得为用个 hook 装一整个 antd，太亏了。

## 消费方怎么接

### admin

`App.vue`：

```ts
const { isDark, initTheme } = useTheme()
initTheme()
const { locale, setLocale, initLocale } = useLocale()
initLocale()

// antd 主题跟着 isDark 走
const antdTheme = computed(() => {
  if (isDark.value) return { algorithm: theme.darkAlgorithm, token: {...}, components: {...} }
  return { algorithm: theme.defaultAlgorithm, token: { colorPrimary: PRIMARY_COLOR } }
})

// 语言变了，同步 vue-i18n + document.lang + 标题，并回传给主应用
watch(locale, (value) => {
  i18n.global.locale.value = value
  document.documentElement.lang = ...
  updateDocumentTitle(route)
  microActions.setGlobalState({ language: value })
})

// 主应用切语言，这边跟着切
microActions.onGlobalStateChange((state) => {
  if (state.language && state.language !== locale.value) setLocale(state.language)
})
```

我之前把 `theme`/`locale` 放在 `appStore` 里，后来全挪走了，`appStore` 现在只剩 `collapsed`/`layout` 这种纯 UI 的东西。全局状态该进 hook 的进 hook，该进 store 的进 store，别混。

### 主应用

差不多，只是主应用同步语言走的是 `globalActions.setLanguage(lang)`（qiankun 全局状态），把语言广播给子应用。

## 微前端之间的状态共享

这块我觉得是本项目最有意思的地方，也是让我纠结最久的。qiankun 子应用和主应用**共享同一个 origin**（都跑在 `localhost:5173`），所以：

1. **主题**：基本靠 `localStorage` 就够。主应用存 `ziven-theme`，admin 读的也是同一个 key。主应用 toggle → `window.location.reload()` → 整个页面重跑，admin 被重新挂载，读到的还是那个 key，两边自然一致。所以主题**没必要**走 qiankun 全局状态，存 localStorage + 刷新就行。

2. **语言**：语言想**实时**同步，不刷新就切，所以才走 qiankun 的 `initGlobalState`。
   - 主应用 `src/qiankun/global-state.ts`：`initGlobalState(initialState)`，初始里有 `theme`、`language`。
   - 主应用 `actions.ts` 里封装了 `setLanguage/lang`、`onStateChange` 这些。
   - admin 那边 `src/qiankun/actions.js` 的 `microActions`，从 `mount(props)` 收到的 props 里拿 `onGlobalStateChange`/`setGlobalState`。
   - 主应用 `setLanguage('en-US')` → 全局状态变 → admin 的 `microActions.onGlobalStateChange` 回调 → admin `setLocale` → admin 的 `watch(locale)` 再去同步自己的 vue-i18n。

别看绕，链路其实很清楚：

```
主应用 point 切换语言
  → setLanguage(lang)            // qiankun 全局状态
  → admin onGlobalStateChange    // 子应用监听
  → admin setLocale(lang)        // useLocale hook
  → admin watch(locale)          // 同步 vue-i18n + document.lang
```

反过来，admin 里切语言，`microActions.setGlobalState({ language })` 也能回给主应用。两个方向都通。

一个容易绕晕的坑：**别把主题也塞进 qiankun 全局状态**。我一开始真塞了，结果又有 `state.theme` 又有 localStorage，两套状态互相打架。后来想明白了——主题用 localStorage + reload，语言用全局状态 + watch，各管各的，干净。

还有个细节：`onGlobalStateChange` 那个回调里一定要判断**值变了才处理**，比如 `state.language !== locale.value`，不然主应用广播一次，admin 处理一次，admin 又 `setLocale` 触发 `watch` 再 `setGlobalState` 回传，来回成环。加了判断就断了。

## 踩过的一些坑

这些不属于“设计”，纯记仇：

- **组件库里的组件不跟主题走**。一开始以为双 antd 实例的问题，查了半天不是（pnpm 单实例）。真正原因是组件库自己 scoped CSS 写死了 `background: #fff`。后来在组件里用 `theme.useToken()` 拿 antd token，转成 CSS 变量注入，才跟着明暗走。
- **antd 的 Menu/Layout 组件级 token 在 antdv 里支持不全**。`components.Menu.darkItemBg` 这些写进去没生效，最后还是靠 `html.dark .ant-menu-dark ...` 这种 CSS 覆盖兜底。CSS 覆盖反而最稳。
- **按钮图标和文字对不齐**。加了个全局 `.ant-btn { display: inline-flex; align-items: center }` 解决。
- **内容区超宽**。`AdminLayout` 里内容卡片 `w-full` + `m-4` 叠加把页面撑爆了，去掉 `w-full` 就好；另外表格要 `scroll={{ x: 'max-content' }}`，不然列多了直接撑破页宽，出横向滚动条。

## 我的感受

主题和语言这种“全局横切”的东西，最难的不是实现，是**定一处唯一可信的状态源**。之前 store、组件里、qiankun 全局各有一份，改的时候不知道哪儿是真。现在统一到组件库 hook，localStorage 藏状态，qiankun 只管跨应用同步，脑子清爽多了。

如果以后要加第三个子应用，主题语言这块基本零成本——import `useTheme`/`useLocale`，接一下全局状态就行。组件库有个 `generate-entry` 脚本，新组件加进去之后记得跑下，要不然入口 index 得手动维护。

差不多了，先到这。
