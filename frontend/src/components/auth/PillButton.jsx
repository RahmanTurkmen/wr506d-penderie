import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const VARIANT_CLASS = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border border-border bg-card text-foreground hover:bg-muted',
  ghost: 'text-primary hover:bg-secondary',
}

export function PillButton({ variant = 'primary', icon: Icon, loading, children, className, disabled, ...props }) {
  return (
    <Button
      type="button"
      disabled={disabled || loading}
      className={cn(
        'h-[52px] w-full gap-2 rounded-full px-5 text-[15px] font-semibold',
        VARIANT_CLASS[variant],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : Icon && <Icon className="h-[18px] w-[18px]" />}
      {children}
    </Button>
  )
}
