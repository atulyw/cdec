import { motion } from 'framer-motion'

export function AnimatedBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-white dark:bg-[color:var(--color-gbg-1)]" />

      <motion.div
        className="absolute -top-44 left-1/2 h-[560px] w-[980px] -translate-x-1/2 rounded-full blur-3xl dark:bg-[radial-gradient(circle_at_center,rgba(57,160,255,0.20),transparent_60%)]"
        animate={{ y: [0, 16, 0], opacity: [0.8, 1, 0.85] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute -bottom-56 right-[-180px] h-[560px] w-[560px] rounded-full blur-3xl dark:bg-[radial-gradient(circle_at_center,rgba(184,75,255,0.18),transparent_60%)]"
        animate={{ x: [0, -18, 0], y: [0, 14, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Neon grid + vignette */}
      <div className="absolute inset-0 opacity-0 dark:opacity-100">
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(57,160,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(184,75,255,0.08)_1px,transparent_1px)] [background-size:48px_48px] opacity-[0.18]" />
        <div className="absolute inset-0 [mask-image:radial-gradient(circle_at_center,black,transparent_65%)] bg-[radial-gradient(circle_at_center,rgba(34,255,153,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_40%,transparent,rgba(0,0,0,0.55))]" />
      </div>
    </div>
  )
}

