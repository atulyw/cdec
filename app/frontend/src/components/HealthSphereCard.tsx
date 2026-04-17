import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import type { ServiceHealth } from '../hooks/useHealthCheck'
import { cn } from './ui/cn'
import { HealthSphere } from './HealthSphere'

export function HealthSphereCard({
  service,
  onRefresh,
  compact,
}: {
  service: ServiceHealth
  onRefresh?: () => void
  compact?: boolean
}) {
  return (
    <motion.div
      className={cn(
        'rounded-2xl border border-white/10 bg-zinc-950/55 p-5 shadow-[0_14px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl',
        'transition-[transform,box-shadow] duration-200',
      )}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
    >
      <div className="flex items-start justify-between gap-3">
        <HealthSphere service={service} size={compact ? 'sm' : 'md'} />
        <button
          type="button"
          onClick={onRefresh}
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-xl',
            'border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-neon-blue)]',
            !onRefresh && 'opacity-40 pointer-events-none',
          )}
          aria-label="Refresh health check"
          title="Refresh"
        >
          <RefreshCw className={cn('h-4 w-4', service.state === 'loading' ? 'animate-spin' : '')} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 space-y-1 text-xs text-zinc-400">
        <div className="truncate">
          <span className="text-zinc-500">Endpoint</span>{' '}
          <span className="text-zinc-200/90">{service.healthUrl ?? 'Not configured'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {typeof service.latencyMs === 'number' ? (
            <span className="rounded-full bg-white/5 px-2.5 py-1 text-zinc-300">
              {service.latencyMs}ms
            </span>
          ) : null}
          {service.checkedAt ? (
            <span className="rounded-full bg-white/5 px-2.5 py-1 text-zinc-300">
              {new Date(service.checkedAt).toLocaleTimeString()}
            </span>
          ) : null}
          {service.detail ? (
            <span className="rounded-full bg-white/5 px-2.5 py-1 text-zinc-300">
              {service.detail}
            </span>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}

