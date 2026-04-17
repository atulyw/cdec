import * as React from 'react'

export function useCountUp(value: number, opts?: { durationMs?: number }) {
  const durationMs = opts?.durationMs ?? 800
  const [display, setDisplay] = React.useState(value)

  React.useEffect(() => {
    let raf = 0
    const start = performance.now()
    const from = display
    const to = value

    if (from === to) return

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (to - from) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs])

  return display
}

