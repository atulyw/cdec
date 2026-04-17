import * as React from 'react'

export type ServiceKey = 'auth' | 'course' | 'enroll'
export type HealthState = 'loading' | 'healthy' | 'unhealthy' | 'down' | 'not_configured'

export type ServiceHealth = {
  key: ServiceKey
  name: string
  baseUrl?: string
  healthUrl?: string
  state: HealthState
  detail?: string
  checkedAt?: number
  latencyMs?: number
}

type Options = {
  pollMs?: number
  timeoutMs?: number
}

function joinHealthUrl(baseUrl: string) {
  const trimmed = baseUrl.replace(/\/+$/, '')
  return `${trimmed}/health`
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController()
  const id = window.setTimeout(() => controller.abort(), timeoutMs)
  const start = performance.now()
  try {
    const res = await fetch(url, { signal: controller.signal })
    const latencyMs = Math.round(performance.now() - start)
    return { res, latencyMs }
  } finally {
    window.clearTimeout(id)
  }
}

function normalizeHealth(payload: unknown, ok: boolean): { state: HealthState; detail?: string } {
  if (!ok) return { state: 'down', detail: 'HTTP error' }

  // Accept common patterns: "UP"/"DOWN", { status: "UP" }, { healthy: true }, { success: true }, etc.
  if (typeof payload === 'string') {
    const s = payload.trim().toLowerCase()
    if (s.includes('up') || s.includes('ok') || s.includes('healthy')) return { state: 'healthy' }
    if (s.includes('down') || s.includes('unhealthy')) return { state: 'down' }
    return { state: 'unhealthy', detail: 'Unexpected response' }
  }

  if (payload && typeof payload === 'object') {
    const any = payload as any
    const status = typeof any.status === 'string' ? any.status.toLowerCase() : undefined
    const healthyBool = typeof any.healthy === 'boolean' ? any.healthy : undefined
    const successBool = typeof any.success === 'boolean' ? any.success : undefined
    const dataStr = typeof any.data === 'string' ? any.data.toLowerCase() : undefined

    if (healthyBool === true || successBool === true || status === 'up' || status === 'ok' || status === 'healthy') {
      return { state: 'healthy' }
    }
    if (healthyBool === false || successBool === false || status === 'down' || status === 'unhealthy') {
      return { state: 'down' }
    }
    if (dataStr && (dataStr.includes('up') || dataStr.includes('ok') || dataStr.includes('healthy'))) {
      return { state: 'healthy' }
    }
    if (dataStr && (dataStr.includes('down') || dataStr.includes('unhealthy'))) {
      return { state: 'down' }
    }

    // Some services nest fields; provide a compact hint.
    return { state: 'unhealthy', detail: 'Invalid health payload' }
  }

  return { state: 'unhealthy', detail: 'Invalid health payload' }
}

export function useHealthCheck(opts?: Options) {
  const pollMs = opts?.pollMs ?? 30_000
  const timeoutMs = opts?.timeoutMs ?? 5_000

  const services = React.useMemo(() => {
    const authBase = import.meta.env.VITE_AUTH_API as string | undefined
    const courseBase = import.meta.env.VITE_COURSE_API as string | undefined
    const enrollBase = import.meta.env.VITE_ENROLL_API as string | undefined

    const mk = (key: ServiceKey, name: string, baseUrl?: string): ServiceHealth => {
      if (!baseUrl) return { key, name, state: 'not_configured' }
      return { key, name, baseUrl, healthUrl: joinHealthUrl(baseUrl), state: 'loading' }
    }

    return [
      mk('auth', 'Auth service', authBase),
      mk('course', 'Course service', courseBase),
      mk('enroll', 'Enrollment service', enrollBase),
    ]
  }, [])

  const [state, setState] = React.useState<ServiceHealth[]>(services)

  const run = React.useCallback(async () => {
    setState((prev) =>
      prev.map((s) => (s.state === 'not_configured' ? s : { ...s, state: 'loading', detail: undefined })),
    )

    const checks = services.map(async (s) => {
      if (s.state === 'not_configured' || !s.healthUrl) return s

      try {
        const { res, latencyMs } = await fetchWithTimeout(s.healthUrl, timeoutMs)
        let payload: unknown = null
        const contentType = res.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          payload = await res.json()
        } else {
          payload = await res.text()
        }

        const normalized = normalizeHealth(payload, res.ok)
        return {
          ...s,
          state: normalized.state,
          detail: normalized.detail,
          checkedAt: Date.now(),
          latencyMs,
        } satisfies ServiceHealth
      } catch (e: any) {
        const isAbort = e?.name === 'AbortError'
        return {
          ...s,
          state: 'down',
          detail: isAbort ? `Timeout > ${timeoutMs}ms` : 'Fetch failed',
          checkedAt: Date.now(),
        } satisfies ServiceHealth
      }
    })

    const next = await Promise.all(checks)
    setState(next)
  }, [services, timeoutMs])

  React.useEffect(() => {
    void run()
    if (!pollMs) return
    const id = window.setInterval(() => void run(), pollMs)
    return () => window.clearInterval(id)
  }, [pollMs, run])

  return { services: state, refresh: run }
}

