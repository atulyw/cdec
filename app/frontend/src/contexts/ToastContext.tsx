import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '../components/ui/cn'

type ToastTone = 'success' | 'error' | 'info'

export type Toast = {
  id: string
  title: string
  description?: string
  tone: ToastTone
}

type ToastContextValue = {
  toast: (t: Omit<Toast, 'id'> & { id?: string; durationMs?: number }) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const toneClasses: Record<ToastTone, string> = {
  success:
    'border-emerald-200 bg-white text-zinc-900 dark:border-emerald-900/40 dark:bg-zinc-950 dark:text-zinc-50',
  error:
    'border-red-200 bg-white text-zinc-900 dark:border-red-900/40 dark:bg-zinc-950 dark:text-zinc-50',
  info:
    'border-brand-200 bg-white text-zinc-900 dark:border-brand-500/30 dark:bg-zinc-950 dark:text-zinc-50',
}

function createToastId() {
  // `crypto.randomUUID()` isn't available in some older browsers/environments.
  // Prefer it when present; otherwise fall back to a reasonably-unique ID.
  const c = globalThis.crypto as Crypto | undefined
  if (c && 'randomUUID' in c && typeof (c as any).randomUUID === 'function') {
    return (c as any).randomUUID() as string
  }
  if (c?.getRandomValues) {
    const bytes = new Uint8Array(16)
    c.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback(
    (t: Omit<Toast, 'id'> & { id?: string; durationMs?: number }) => {
      const id = t.id ?? createToastId()
      const durationMs = t.durationMs ?? 3500
      setToasts((prev) => [{ id, title: t.title, description: t.description, tone: t.tone }, ...prev].slice(0, 5))
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id))
      }, durationMs)
    },
    [],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed right-4 top-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'rounded-xl border p-4 shadow-lg',
              'motion-safe:animate-[toast-in_140ms_ease-out]',
              toneClasses[t.tone],
            )}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{t.title}</div>
                {t.description ? (
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {t.description}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes toast-in { from { transform: translateY(-8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
    </ToastContext.Provider>
  )
}

