import { motion } from 'framer-motion'

export function AnimatedBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-950" />

      <motion.div
        className="absolute -top-40 left-1/2 h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.28),transparent_60%)] blur-2xl dark:bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.20),transparent_60%)]"
        animate={{ y: [0, 18, 0], opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute -bottom-48 right-[-140px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_60%)] blur-2xl dark:bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.14),transparent_60%)]"
        animate={{ x: [0, -22, 0], y: [0, 16, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.04))] dark:bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.22))]" />
      <div className="absolute inset-0 [background-image:radial-gradient(rgba(24,24,27,0.08)_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.18] dark:opacity-[0.14]" />
    </div>
  )
}

