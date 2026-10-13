import { Baby, Check, Users } from 'lucide-react'

export function ProfilMenu({ profils, activeId, onSwitch, onClose, align = 'left' }) {
  return (
    <>
      <button type="button" aria-label="Fermer" onClick={onClose} className="fixed inset-0 z-20 cursor-default" />
      <div
        className={`absolute top-full z-30 mt-2 w-72 rounded-2xl border border-border bg-card p-2 shadow-lg ${
          align === 'right' ? 'right-0' : 'left-0'
        }`}
      >
        <p className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Profils du foyer
        </p>
        {profils.map((p) => {
          const isActive = p.id === activeId
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onSwitch(p.id)
                onClose()
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors ${
                isActive ? 'bg-secondary' : 'hover:bg-muted'
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                {p.estMineur ? <Baby className="h-4 w-4" /> : <Users className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">{p.nom}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {p.type === 'principal' ? 'Compte principal' : p.estMineur ? 'Profil enfant' : 'Profil géré'}
                </span>
              </span>
              {isActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </button>
          )
        })}
      </div>
    </>
  )
}
