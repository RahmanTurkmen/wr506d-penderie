import { forwardRef } from 'react'

export const FieldInput = forwardRef(function FieldInput(
  { label, icon: Icon, error, trailing, className = '', ...props },
  ref,
) {
  return (
    <label className="block space-y-1.5 text-left">
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      <span
        className={`flex h-[52px] items-center gap-2.5 rounded-[14px] border bg-card px-4 transition-colors ${
          error ? 'border-destructive' : 'border-border focus-within:border-primary'
        }`}
      >
        {Icon && <Icon className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />}
        <input
          ref={ref}
          className={`h-full w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground ${className}`}
          {...props}
        />
        {trailing}
      </span>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  )
})
