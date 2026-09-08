# Sentry 微前端接入笔记

这是我把 Sentry 接到 qiankun 微前端里折腾的过程。核心就三个问题：子应用每次都要建实例吗、用几个 DSN、怎么区分不同系统。想清楚这三件事，方案自然就出来了。

## 一、先回答三个问题

1. **子应用之间每次都要建一个 Sentry 实例吗？** 不用。
   - 浏览器里的 Sentry SDK 本质是**一个全局单例**；但 qiankun 子应用是**独立构建的 bundle**，各自包里是**另一份 `@sentry/vue`**，所以"跨 bundle 共用一个 client"其实做不到（这是最容易踩的坑）。
   - 我们的做法是 `bootstrapMonitoring`：**谁先进入页面谁负责 `Sentry.init`；同一个页面只初始化一次**。子应用再调用时发现已初始化，只切换系统标签，不再重复 init。
2. **用同一个 DSN 吗？** 是。全程只建**一个 Sentry Project `frontend`**，所有应用共用一个 DSN；**系统之间靠 `micro_app` tag 区分**，不是靠不同 DSN。
3. **怎么区分系统？** 用 tag：
   - `micro_app = main | admin | ...`（`appName`）
   - `micro_app_version = 1.0.0`
   - `environment = dev | staging | prod`（`import.meta.env.MODE`）
   - `release = frontend@<version>`（整体前端发布，不带具体微应用名）

   在 Sentry 后台按 `micro_app:admin` 过滤、建 dashboard / 告警即可。

## 二、核心入口 `packages/monitoring`

包名就叫 `monitoring`（apps 里 `"monitoring": "workspace:*"`），`exports` 指到 `src`（直接消费源码，不用 build）。

### init.ts —— `bootstrapMonitoring`

```ts
export function bootstrapMonitoring({ app, router, appName, version }) {
  if (!import.meta.env.VITE_SENTRY_DSN) return

  const didInit = !isSentryInitialized() // window.__SENTRY_INITIALIZED__
  if (didInit) {
    const supportsGlobalHub = typeof (Sentry as any).getCurrentHub === 'function' // 区分 v7 / v8+
    const initOptions: Record<string, unknown> = {
      app,
      dsn,
      environment: import.meta.env.MODE,
      release: `frontend@${version}`,
      integrations: router ? [Sentry.browserTracingIntegration({ router })] : [],
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 0,
      enabled: resolveEnabled(), // VITE_SENTRY_ENABLED，未设则生产开/开发关
    }
    if (supportsGlobalHub) initOptions.useGlobalHub = true // v7 才能跨 bundle 共享 hub
    Sentry.init(initOptions as any)
    markSentryInitialized()
  }

  setMicroApp(appName, version) // 每次调用都打当前系统的 tag
  if (!didInit) attachVueErrorHandler(app, appName) // 只有未 init 的子应用才手动挂 errorHandler
}
```

要点：

- `window.__SENTRY_INITIALIZED__`：同一页面只 init 一次，谁先进入谁做。
- `useGlobalHub: true`（v7）把 client 放到 `window.__SENTRY__`，各 bundle 才能读到同一个 hub；v8+/v10 没这个选项，回退本地 client。
- `attachVueErrorHandler` 只在「未由本 bundle 初始化」的子应用上调用——否则 `Sentry.init({app})` 已经挂了 errorHandler，再挂会**重复上报**。

### context.ts —— 打标签（区分系统的关键）

```ts
function getScope() {
  const g = (window as any).__SENTRY__
  if (g?.getCurrentHub) return g.getCurrentHub().getScope() // v7 全局 hub（跨 bundle）
  return (Sentry as any).getCurrentScope?.() ?? null // v8+ 本地 scope
}

export function setMicroApp(appName, version?) {
  const s = getScope()
  s?.setTag?.('micro_app', appName)
  if (version) s?.setTag?.('micro_app_version', version)
}
```

`setUserContext` / `clearUserContext` 也走同一套 scope。

### error.ts —— 上报

```ts
export function captureError(error, context?) {
  const hub = getHub()
  if (hub?.withScope) {
    hub.withScope(scope => {
      if (context) Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v))
      hub.captureException(error)
    })
    return
  }
  Sentry.withScope(scope => {
    /* 同上 */ Sentry.captureException(error)
  })
}
```

`captureMessage` 类似。都是「优先全局 hub，回退本地」。

## 三、各应用怎么接

**主应用** `apps/main/qiankun/src/main.ts`——注意**先 init 再 mount**，且主应用没 vue-router 就别传 router：

```ts
const app = createApp(App)
bootstrapMonitoring({ app, appName: 'main', version: import.meta.env.VITE_APP_VERSION })
app.use(i18n).mount('#main-app')
startQiankun()
```

**admin 子应用** `apps/admin/src/main.js`——`bootstrapMonitoring` 是模式无关的，单独打开自己 init，被 qiankun 加载就复用：

```js
function render(props = {}) {
  instance = createApp(App)
  // ... use(router) etc
  instance.mount(container ? container.querySelector('#app') : '#app')
  bootstrapMonitoring({
    app: instance,
    router,
    appName: 'admin',
    version: import.meta.env.VITE_APP_VERSION,
  })
}
```

## 四、环境变量

客户端用的（带 `VITE_`）：

```env
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx    # 所有应用共用这一个
VITE_APP_VERSION=1.0.0
VITE_SENTRY_ENABLED=true                                # dev 也上报；不设则生产开/开发关
```

构建/CI 用的（**不带 `VITE_`，别暴露到前端**）：

```env
SENTRY_ORG / SENTRY_PROJECT / SENTRY_AUTH_TOKEN
```

这两个是两拨东西：`VITE_` 开头的会被打进前端 bundle；`SENTRY_*` 只在 `@sentry/vite-plugin` 上传 source map 时用。

## 五、Source Map（线上能看源码行号）

每个 app 的 `vite.config`：

```ts
import { sentryVitePlugin } from '@sentry/vite-plugin'

const hasSentryAuth = Boolean(process.env.SENTRY_AUTH_TOKEN)
export default defineConfig({
  plugins: [
    vue(),
    ...(hasSentryAuth
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            sourcemaps: { filesToDeleteAfterUpload: ['**/*.map'] },
          }),
        ]
      : []),
  ],
  build: { sourcemap: 'hidden' },
})
```

`hasSentryAuth` 判断是为了**开发环境不报错**（本地没有 authToken 就不加载插件）。`.map` 只上传不上服务器。

## 六、踩坑记录

- **`window.__SENTRY_INITIALIZED__` 只能挡"第二次 init"，挡不住"跨 bundle 没 client"**。子应用自己那份 `@sentry/vue` 如果没 init，它的 `captureException` 是发给一个没 client 的 SDK，事件**发不出去**。要真正"复用宿主 client"，v7 靠 `useGlobalHub: true`，v8+/v10 得用 `Sentry.getClient()` / `setCurrentClient()` 那套全局 client 方案——那个我没在 v10 上实测，装完按实际版本对齐。
- **`enabled` 别写死 `PROD`**：不然 `pnpm dev` 永远不上报，本地没法测。现在走 `VITE_SENTRY_ENABLED`，dev 打开、生产默认开。
- **`Sentry.init({ app })` 会挂一个 errorHandler，自己再挂一个会重复上报**。所以子应用复用场景才手动挂，init 的那个交给 Sentry。
- **`useGlobalHub` 是 v7 的选项**，v8+/v10 没有。我用 `typeof Sentry.getCurrentHub === 'function'` 探测，存在才传，避免版本差异直接报错。
- **node_modules 半残**：我有一次在沙箱里 `pnpm install` 中断，导致 `@vue/tsconfig` 下到 `.pnpm` 却没链接进 `node_modules`，直接 `extends "@vue/tsconfig/tsconfig.dom.json"` 报 not found。跑一次 `pnpm install` 就恢复，不是配置问题。
- **主应用别传 `router`**：主应用没 vue-router，`import router from './router'` 会直接 module not found；`bootstrapMonitoring` 里没 router 就不开 tracing。

## 七、最终文件

```
packages/monitoring/
├── package.json          # name: monitoring; exports -> src
└── src/{index,init,context,error}.ts

apps/main/qiankun/src/main.ts   # bootstrapMonitoring({ app, appName:'main' })
apps/main/qiankun/.env.*        # VITE_SENTRY_DSN / VITE_APP_VERSION / VITE_SENTRY_ENABLED
apps/admin/src/main.js          # bootstrapMonitoring({ app, router, appName:'admin' })
apps/admin/.env.*               # 同上
apps/{main,admin}/vite.config.* # sentryVitePlugin（有 authToken 才启用）+ sourcemap hidden
```

以后新增子应用：入口加一行 `bootstrapMonitoring({ app, appName:'xxx', version })` 即可，DSN 共享、靠 `micro_app` tag 区分。
