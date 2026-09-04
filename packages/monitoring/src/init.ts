import * as Sentry from '@sentry/vue'
import type { App } from 'vue'
import type { Router } from 'vue-router'
import { captureError } from './error'
import { getScope, setMicroApp } from './context'

const SENTRY_INITIALIZED_KEY = '__SENTRY_INITIALIZED__'

export interface BootstrapMonitoringOptions {
  /** 当前应用的 Vue 实例 */
  app: App
  /** 宿主应用传路由以启用 browserTracing */
  router?: Router
  /** 微应用标识，写入 micro_app tag，如 main / admin / system */
  appName: string
  /** 当前微应用版本，写入 micro_app_version，如 1.0.0 */
  version: string
}

/** 该页面是否已初始化 Sentry（同一页面只初始化一次） */
function isSentryInitialized() {
  return Boolean((window as any)[SENTRY_INITIALIZED_KEY])
}

function markSentryInitialized() {
  ;(window as any)[SENTRY_INITIALIZED_KEY] = true
}

/** 是否上报：优先读 VITE_SENTRY_ENABLED（'true'/'1'/true 开启）；未配置则默认生产开启、开发关闭 */
function resolveEnabled(): boolean {
  const raw = import.meta.env.VITE_SENTRY_ENABLED
  if (raw === undefined || raw === '') {
    return import.meta.env.PROD
  }
  return String(raw).toLowerCase() === 'true' || raw === '1' || raw === true
}

/**
 * 微前端 Sentry 统一入口。
 *
 * 谁先进入页面谁负责初始化；同一个页面只初始化一次。
 * - qiankun 模式：主应用先 bootstrapMonitoring → Sentry.init（useGlobalHub 让 client 挂到 window.__SENTRY__）；
 *   子应用再调用时发现已初始化，仅切换 micro_app（并通过全局 hub 生效）。
 * - 独立模式：子应用发现页面尚无 Sentry → 自己 init。
 *
 * 每次调用都会把「当前系统」打到 micro_app 标签，并捕获当前 Vue 应用自身的错误。
 */
export function bootstrapMonitoring(options: BootstrapMonitoringOptions) {
  const { app, router, appName, version } = options

  if (!import.meta.env.VITE_SENTRY_DSN) {
    return
  }

  const didInit = !isSentryInitialized()

  if (didInit) {
    // 兼容 v7 与 v8+/v10：v7 有 getCurrentHub（可用 useGlobalHub 全局 hub），v8+ 移除 hub 改用全局 client
    const sdk = Sentry as any
    const supportsGlobalHub = typeof sdk.getCurrentHub === 'function'

    const initOptions: Record<string, unknown> = {
      app,
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      release: `frontend@${version}`,
      integrations: router ? [Sentry.browserTracingIntegration({ router })] : [],
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 0,
      enabled: resolveEnabled(),
    }

    // 关键：v7 下把 client/hub 放到 window.__SENTRY__，让各微应用 bundle 共享同一个 hub，micro_app 标签跨 bundle 生效
    if (supportsGlobalHub) {
      initOptions.useGlobalHub = true
    }

    Sentry.init(initOptions as any)
    markSentryInitialized()
  }
  // 标记当前系统（通过全局 hub 生效，跨 bundle 共享）
  setMicroApp(appName, version)

  // 只有「未由本 bundle 初始化」时才手动挂 errorHandler：
  // 否则 Sentry.init({ app }) 已经通过 Vue 集成挂了 errorHandler，再挂会重复上报
  if (!didInit) {
    attachVueErrorHandler(app, appName)
  }
}

/** 给 Vue 应用挂上 errorHandler（串联已有 handler，不覆盖），把该应用的错误交给 Sentry */
function attachVueErrorHandler(app: App, appName: string) {
  const prevHandler = app.config.errorHandler

  app.config.errorHandler = (error, _instance, info) => {
    const scope = getScope()
    scope?.setTag?.('micro_app', appName)
    scope?.setExtra?.('vue_info', info)
    captureError(error)
    prevHandler?.(error, _instance, info)
  }
}
