import * as React from 'react'
import { cn } from './cn'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  isLoading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary:
    'bg-white text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50 focus-visible:ring-brand-500 dark:bg-zinc-900 dark:text-zinc-50 dark:ring-zinc-800 dark:hover:bg-zinc-800',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500',
  ghost:
    'bg-transparent text-zinc-700 hover:bg-zinc-100 focus-visible:ring-brand-500 dark:text-zinc-200 dark:hover:bg-zinc-900',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      leftIcon,
      rightIcon,
      isLoading,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading
    const [ripples, setRipples] = React.useState<Array<{ id: string; x: number; y: number }>>(
      [],
    )

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onPointerDown={(e) => {
          props.onPointerDown?.(e)
          if (isDisabled) return
          const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
          setRipples((prev) => [...prev, { id, x, y }].slice(-3))
          window.setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== id))
          }, 520)
        }}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg font-medium',
          'transition-[transform,colors,box-shadow] duration-200',
          'active:scale-[0.98] motion-reduce:transform-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'ring-offset-zinc-50 dark:ring-offset-zinc-950',
          'disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {ripples.map((r) => (
          <span
            key={r.id}
            className={cn(
              'pointer-events-none absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full',
              'bg-white/40 dark:bg-white/20',
              'animate-[ripple_520ms_ease-out]',
              variant === 'secondary' || variant === 'ghost' ? 'mix-blend-multiply dark:mix-blend-screen' : '',
            )}
            style={{ left: r.x, top: r.y }}
            aria-hidden="true"
          />
        ))}
        {isLoading ? (
          <span
            className={cn(
              'h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent',
              variant === 'secondary' || variant === 'ghost'
                ? 'text-zinc-500 dark:text-zinc-300'
                : 'text-white',
            )}
            aria-hidden="true"
          />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading ? rightIcon : null}
        <style>{`@keyframes ripple { from { transform: translate(-50%,-50%) scale(0.2); opacity: 0.6 } to { transform: translate(-50%,-50%) scale(6); opacity: 0 } }`}</style>
      </button>
    )
  },
)
Button.displayName = 'Button'

