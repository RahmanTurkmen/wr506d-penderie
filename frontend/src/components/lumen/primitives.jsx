// Petits blocs visuels partagés entre les écrans (accueil, inventaire, ...),
// dans la charte Lumen (tuiles roses, cartes blanches arrondies, badges pill).

export function IconTile({ icon: Icon, className = '', size = 44, photoSrc }) {
  if (photoSrc) {
    return (
      <img
        src={photoSrc}
        alt=""
        className={`shrink-0 rounded-[14px] object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-[14px] bg-secondary text-primary ${className}`}
      style={{ width: size, height: size }}
    >
      <Icon className="h-5 w-5" />
    </span>
  )
}

export function Badge({ children, tone = 'pink' }) {
  const toneClass =
    tone === 'solid'
      ? 'bg-primary text-primary-foreground'
      : tone === 'gray'
        ? 'bg-muted text-muted-foreground'
        : 'bg-secondary text-primary'
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClass}`}>{children}</span>
}

export function Row({ lead, title, subtitle, trailing, onClick, className = '' }) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex w-full items-center gap-3.5 rounded-2xl bg-card px-3.5 py-3 text-left ${
        onClick ? 'transition-colors hover:bg-muted' : ''
      } ${className}`}
    >
      {lead}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {trailing}
    </Comp>
  )
}

export function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      {action}
    </div>
  )
}

export function EmptyState({ children }) {
  return <p className="rounded-2xl bg-card px-4 py-5 text-center text-sm text-muted-foreground">{children}</p>
}

export function IconButton({ icon: Icon, onClick, variant = 'outline', className = '', ...props }) {
  const variantClass =
    variant === 'solid-light'
      ? 'bg-white/15 text-white hover:bg-white/25'
      : 'border border-border bg-card text-foreground hover:bg-muted'
  return (
    <button type="button" onClick={onClick} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${variantClass} ${className}`} {...props}>
      <Icon className="h-[18px] w-[18px]" />
    </button>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-[46px] shrink-0 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export function Chip({ children, active, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-foreground hover:bg-muted'
      }`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </button>
  )
}
