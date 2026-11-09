import { NAV_ITEMS } from './nav'

export function BottomTabBar({ active, onNavigate }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 border-t border-border bg-card pb-6 pt-2.5 md:hidden">
      {NAV_ITEMS.map(({ screen, icon: Icon, label, ready }) => {
        const isActive = screen === active
        return (
          <button
            key={screen}
            type="button"
            disabled={!ready}
            title={ready ? undefined : 'Bientôt disponible'}
            onClick={() => ready && onNavigate(screen)}
            data-cy={`nav-${screen}`}
            className={`flex flex-col items-center gap-1 py-1 text-[10px] font-medium ${
              isActive ? 'text-primary' : ready ? 'text-muted-foreground' : 'text-muted-foreground/40'
            }`}
          >
            <Icon className="h-[22px] w-[22px]" />
            {label}
          </button>
        )
      })}
    </nav>
  )
}
