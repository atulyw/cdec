import { motion } from 'framer-motion'
import type { ServiceHealth } from '../hooks/useHealthCheck'
import { cn } from './ui/cn'

type Size = 'sm' | 'md'

function meta(state: ServiceHealth['state']) {
  if (state === 'healthy') {
    return {
      label: 'Healthy',
      core: 'rgba(34,255,153,0.95)',
      glow: 'rgba(34,255,153,0.34)',
      ring: 'rgba(34,255,153,0.55)',
      speed: 3.2,
      flicker: false,
    }
  }
  if (state === 'down' || state === 'unhealthy') {
    return {
      label: state === 'unhealthy' ? 'Unhealthy' : 'Down',
      core: 'rgba(255,55,95,0.92)',
      glow: 'rgba(255,55,95,0.28)',
      ring: 'rgba(255,55,95,0.50)',
      speed: 8.5,
      flicker: true,
    }
  }
  if (state === 'not_configured') {
    return {
      label: 'Not configured',
      core: 'rgba(120,120,140,0.75)',
      glow: 'rgba(120,120,140,0.14)',
      ring: 'rgba(120,120,140,0.25)',
      speed: 9,
      flicker: false,
    }
  }
  return {
    label: 'Loading',
    core: 'rgba(57,160,255,0.55)',
    glow: 'rgba(57,160,255,0.18)',
    ring: 'rgba(184,75,255,0.50)',
    speed: 2.4,
    flicker: false,
  }
}

export function HealthSphere({
  service,
  size = 'md',
  showLabel = true,
  className,
}: {
  service: ServiceHealth
  size?: Size
  showLabel?: boolean
  className?: string
}) {
  const m = meta(service.state)
  const dims = size === 'sm' ? 38 : 54

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <motion.div
        className="relative"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-[14px]"
          style={{ width: dims, height: dims, background: m.glow }}
          animate={{ opacity: m.flicker ? [0.55, 0.25, 0.6, 0.35, 0.55] : [0.55, 0.75, 0.55] }}
          transition={{ duration: m.flicker ? 1.8 : 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Sphere */}
        <div
          className="relative rounded-full"
          style={{
            width: dims,
            height: dims,
            background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95), ${m.core} 46%, rgba(0,0,0,0.55) 100%)`,
            boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 0 26px ${m.glow}`,
          }}
        >
          {/* Rotating ring for loading */}
          {service.state === 'loading' ? (
            <motion.div
              className="absolute inset-[-6px] rounded-full"
              style={{
                background: `conic-gradient(from 90deg, transparent, ${m.ring}, transparent)`,
                filter: 'blur(0.2px)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.3, repeat: Infinity, ease: 'linear' }}
            />
          ) : null}

          {/* Shine sweep */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
              mixBlendMode: 'screen',
              opacity: service.state === 'down' ? 0.25 : 0.4,
            }}
            animate={{ backgroundPositionX: ['-120%', '140%'] }}
            transition={{ duration: m.speed, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </motion.div>

      {showLabel ? (
        <div className="min-w-0">
          <div className="text-xs font-semibold text-zinc-100/90">{service.name}</div>
          <div className="mt-0.5 text-xs text-zinc-400">{m.label}</div>
        </div>
      ) : null}
    </div>
  )
}

