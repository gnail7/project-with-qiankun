import * as Sentry from '@sentry/vue'

/**
 * 优先读取全局 hub（window.__SENTRY__，配合 init 的 useGlobalHub: true，跨 bundle 共享）；
 * 否则回退到本地 SDK 的 hub。
 */
function getHub(): any {
  const g = (window as any).__SENTRY__
  if (g && typeof g.getCurrentHub === 'function') {
    return g.getCurrentHub()
  }
  return (Sentry as any).getCurrentHub?.() ?? null
}

/** 拿到当前 Scope：优先全局 hub，回退本地 SDK */
export function getScope(): any {
  const hub = getHub()
  if (hub && typeof hub.getScope === 'function') {
    return hub.getScope()
  }
  return (Sentry as any).getCurrentScope?.() ?? null
}

/** 标记当前错误属于哪个微应用（写入 micro_app / micro_app_version 标签） */
export function setMicroApp(appName: string, version?: string) {
  const scope = getScope()
  scope?.setTag?.('micro_app', appName)
  if (version) scope?.setTag?.('micro_app_version', version)
}

export function setUserContext(userId: string | number, username?: string) {
  const scope = getScope()
  scope?.setUser?.({ id: String(userId), username })
}

export function clearUserContext() {
  getScope()?.setUser?.(null)
}
