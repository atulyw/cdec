import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, LoaderCircle, Settings2, XCircle } from 'lucide-react'
import { cn } from './ui/cn'
import type { ServiceHealth } from '../hooks/useHealthCheck'

const stateMeta = {
  loading: {
    label: 'Checking…',
    icon: LoaderCircle,
    ring: 'ring-zinc-200/60 dark:ring-white/10',
    glow: '',
    accent: 'text-zinc-700 dark:text-zinc-200',
  },
  healthy: {
    label: 'Healthy',
    icon: CheckCircle2,
    ring: 'ring-emerald-200/70 dark:ring-emerald-500/20',
    glow: 'shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_18px_50px_rgba(16,185,129,0.12)] dark:shadow-[0_0_0_1px_rgba(16,185,129,0.22),0_22px_65px_rgba(16,185,129,0.10)]',
    accent: 'text-emerald-700 dark:text-emerald-300',
  },
  unhealthy: {
    label: 'Unhealthy',
    icon: XCircle,
    ring: 'ring-amber-200/70 dark:ring-amber-500/20',
    glow: 'shadow-[0_0_0_1px_rgba(245,158,11,0.22),0_18px_50px_rgba(245,158,11,0.10)] dark:shadow-[0_0_0_1px_rgba(245,158,11,0.20),0_22px_65px_rgba(245,158,11,0.08)]',
    accent: 'text-amber-800 dark:text-amber-300',
  },
  down: {
    label: 'Down',
    icon: XCircle,
    ring: 'ring-red-200/70 dark:ring-red-500/20',
    glow: 'shadow-[0_0_0_1px_rgba(239,68,68,0.22),0_18px_50px_rgba(239,68,68,0.10)] dark:shadow-[0_0_0_1px_rgba(239,68,68,0.20),0_22px_65px_rgba(239,68,68,0.08)]',
    accent: 'text-red-700 dark:text-red-300',
  },
  not_configured: {
    label: 'Not configured',
    icon: Settings2,
    ring: 'ring-zinc-200/60 dark:ring-white/10',
    glow: '',
    accent: 'text-zinc-700 dark:text-zinc-200',
  },
} as const

export function HealthCard({ service }: { service: ServiceHealth }) {
  const meta = stateMeta[service.state]
  const Icon = meta.icon
  const shine =
    service.state === 'healthy'
      ? { color: 'rgba(16,185,129,0.9)', duration: 2.4, opacity: 1 }
      : service.state === 'down'
        ? { color: 'rgba(239,68,68,0.85)', duration: 5.2, opacity: 0.7 }
        : { color: 'rgba(99,102,241,0.0)', duration: 6, opacity: 0 }

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 backdrop-blur-xl',
        'shadow-[0_10px_35px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-zinc-950/55 dark:shadow-[0_14px_60px_rgba(0,0,0,0.45)]',
        'ring-1 ring-inset',
        meta.ring,
        meta.glow,
      )}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 350, damping: 26 }}
      animate={
        service.state === 'down'
          ? { x: [0, -2, 2, -1, 1, 0] }
          : undefined
      }
    >
      <div className="absolute inset-0 bg-[radial-gradient(32rem_16rem_at_top,rgba(37,99,235,0.12),transparent)] dark:bg-[radial-gradient(32rem_16rem_at_top,rgba(59,130,246,0.10),transparent)]" />

      {/* Shine track */}
      <div className="pointer-events-none absolute inset-x-4 top-3 h-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-zinc-200/70 dark:bg-white/10" />
        <motion.span
          className="absolute top-[-12px] h-8 w-8 rounded-full blur-[2px]"
          style={{
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), ${shine.color} 55%, transparent 70%)`,
            opacity: shine.opacity,
          }}
          initial={{ x: -24 }}
          animate={{ x: ['-24px', 'calc(100% + 24px)'] }}
          transition={{
            duration: shine.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.span
          className="absolute top-[-20px] h-12 w-12 rounded-full blur-[10px]"
          style={{
            background: shine.color,
            opacity: service.state === 'healthy' ? 0.18 : service.state === 'down' ? 0.12 : 0,
          }}
          initial={{ x: -36 }}
          animate={{ x: ['-36px', 'calc(100% + 36px)'] }}
          transition={{
            duration: shine.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: 0.02,
          }}
        />
      </div>

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {service.name}
          </div>
          <div className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
            {service.baseUrl ?? 'Missing env var'}
          </div>
        </div>

        <div className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset', meta.accent, meta.ring)}>
          <Icon
            className={cn(
              'h-4 w-4',
              service.state === 'loading' ? 'animate-spin' : '',
            )}
            aria-hidden="true"
          />
          {meta.label}
          {service.state === 'healthy' ? (
            <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.7)]" aria-hidden="true" />
          ) : null}
          {service.state === 'down' ? (
            <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_16px_rgba(239,68,68,0.65)]" aria-hidden="true" />
          ) : null}
        </div>
      </div>

      <div className="relative mt-4">
        <AnimatePresence initial={false} mode="wait">
          {service.state === 'loading' ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="h-4 w-3/5 overflow-hidden rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70">
                <div className="h-full w-2/5 animate-[shimmer_1.2s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)] dark:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]" />
              </div>
              <div className="h-3 w-4/5 overflow-hidden rounded-lg bg-zinc-200/60 dark:bg-zinc-800/60">
                <div className="h-full w-2/5 animate-[shimmer_1.2s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)] dark:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]" />
              </div>
              <style>{`@keyframes shimmer { from { transform: translateX(-40%) } to { transform: translateX(220%) } }`}</style>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400"
            >
              {service.checkedAt ? (
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">
                  Checked {new Date(service.checkedAt).toLocaleTimeString()}
                </span>
              ) : null}
              {typeof service.latencyMs === 'number' ? (
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">
                  {service.latencyMs}ms
                </span>
              ) : null}
              {service.detail ? (
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">
                  {service.detail}
                </span>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

