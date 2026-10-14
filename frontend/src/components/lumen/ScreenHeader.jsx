import { ArrowLeft, X } from 'lucide-react'

export function ScreenHeader({ title, subtitle, onBack, close = false, action, step }) {
  return (
    <header className="sticky top-0 z-10 space-y-3 border-b border-border bg-background/95 px-6 py-4 backdrop-blur md:px-10">
      <div className="flex items-center gap-3.5">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={close ? 'Fermer' : 'Retour'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted"
          >
            {close ? <X className="h-[18px] w-[18px]" /> : <ArrowLeft className="h-[18px] w-[18px]" />}
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {step && (
        <div className="flex gap-1.5">
          {Array.from({ length: step[1] }, (_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full ${i < step[0] ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
      )}
    </header>
  )
}
