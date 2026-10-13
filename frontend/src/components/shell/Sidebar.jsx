import { LogOut } from 'lucide-react'
import { NAV_ITEMS } from './nav'

export function Sidebar({ active, onNavigate, profilNom, profilSubtitle, onLogout }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card px-4 py-6 md:flex">
      <div className="mb-7 flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
          <span className="text-base font-bold">L</span>
        </div>
        <span className="text-lg font-bold text-foreground">Lumen</span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ screen, icon: Icon, label, ready }) => {
          const isActive = screen === active
          return (
            <button
              key={screen}
              type="button"
              disabled={!ready}
              title={ready ? undefined : 'Bientôt disponible'}
              onClick={() => ready && onNavigate(screen)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-secondary font-semibold text-primary'
                  : ready
                    ? 'text-muted-foreground hover:bg-muted'
                    : 'cursor-not-allowed text-muted-foreground/40'
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="space-y-2 border-t border-border pt-3">
        <div className="px-2">
          <p className="truncate text-sm font-semibold text-foreground">{profilNom}</p>
          <p className="truncate text-xs text-muted-foreground">{profilSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <LogOut className="h-[15px] w-[15px]" />
          Se déconnecter
        </button>
      </div>
    </aside>
  )
}
