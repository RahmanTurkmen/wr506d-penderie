import { Flag, Trash2, X } from 'lucide-react'
import { EmptyState, IconTile } from '@/components/lumen/primitives'

// Figma 14.3 "Signalements & litiges" : une seule liste combinée, la
// sidebar du Figma a deux entrées ("Signalements", "Litiges") qui pointent
// vers le même écran — reproduit tel quel ici plutôt que de dupliquer la
// page pour une distinction que la maquette elle-même ne fait pas.
export function AdminSignalementsPage({ signalements, onIgnorer, onRetirer }) {
  return (
    <div className="space-y-3">
      {signalements.length === 0 && <EmptyState>Rien à traiter pour le moment.</EmptyState>}

      {signalements.map((s) => (
        <div key={s.id} className="rounded-2xl bg-card p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3.5">
              <IconTile icon={Flag} size={44} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{s.titre}</p>
                <p className="truncate text-xs text-muted-foreground">{s.detail}</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => onIgnorer(s.id)}
                className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
                Ignorer
              </button>
              <button
                type="button"
                onClick={() => onRetirer(s.id)}
                className="flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Retirer
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
