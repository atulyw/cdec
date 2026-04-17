import * as React from 'react'
import { cn } from './cn'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, required, ...props }, ref) => {
    const inputId = id ?? React.useId()
    const hintId = hint ? `${inputId}-hint` : undefined
    const errorId = error ? `${inputId}-error` : undefined
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

    return (
      <div className="space-y-1.5">
        {label ? (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            {label}
            {required ? <span className="text-red-600"> *</span> : null}
          </label>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm',
            'border-zinc-200 placeholder:text-zinc-400',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-zinc-50',
            'disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500',
            'dark:bg-zinc-950 dark:text-zinc-50 dark:border-zinc-800 dark:placeholder:text-zinc-500 dark:focus:ring-offset-zinc-950 dark:disabled:bg-zinc-900/40',
            error
              ? 'border-red-300 focus:ring-red-500 dark:border-red-900/60'
              : undefined,
            className,
          )}
          required={required}
          {...props}
        />

        {hint ? (
          <p id={hintId} className="text-xs text-zinc-500 dark:text-zinc-400">
            {hint}
          </p>
        ) : null}

        {error ? (
          <p id={errorId} className="text-xs font-medium text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)
Input.displayName = 'Input'

