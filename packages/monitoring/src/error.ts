import * as Sentry from '@sentry/vue'

function getHub(): any {
  const g = (window as any).__SENTRY__
  if (g && typeof g.getCurrentHub === 'function') {
    return g.getCurrentHub()
  }
  return (Sentry as any).getCurrentHub?.() ?? null
}

/**
 * 捕获异常，可附带上下文（以 extra 写入事件）。
 * 优先走全局 hub（跨 bundle），否则回退本地 Sentry。
 */
export function captureError(error: unknown, context?: Record<string, unknown>) {
  const hub = getHub()

  if (hub && typeof hub.withScope === 'function' && typeof hub.captureException === 'function') {
    hub.withScope((scope: any) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => scope.setExtra(key, value))
      }
      hub.captureException(error)
    })
    return
  }

  Sentry.withScope(scope => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => scope.setExtra(key, value))
    }
    Sentry.captureException(error)
  })
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  const hub = getHub()
  if (hub && typeof hub.captureMessage === 'function') {
    hub.captureMessage(message, level)
    return
  }
  Sentry.captureMessage(message, level)
}
