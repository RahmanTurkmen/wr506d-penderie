import { Plus, Users } from 'lucide-react'
import { Badge, EmptyState, IconTile, Row, Skeleton } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

export function ProfilsFoyerPage({ profils, activeProfilId, loading, onBack, onNewProfil }) {
  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader title="Profils du foyer" subtitle="Un compte principal, des profils gérés" onBack={onBack} />

      <div className="space-y-2.5 px-6 py-5 md:px-10">
        {loading && (
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3.5 rounded-2xl bg-card px-3.5 py-3">
                <Skeleton className="h-11 w-11 shrink-0 rounded-[14px]" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && profils.length === 0 && <EmptyState>Aucun profil.</EmptyState>}

        {!loading &&
          profils.map((p) => (
            <Row
              key={p.id}
              lead={<IconTile icon={Users} size={44} />}
              title={p.nom}
              subtitle={p.type === 'principal' ? 'Compte principal' : p.estMineur ? 'Profil enfant' : 'Profil géré'}
              trailing={p.id === activeProfilId ? <Badge tone="solid">Actif</Badge> : null}
            />
          ))}
      </div>

      <button
        type="button"
        onClick={onNewProfil}
        aria-label="Ajouter un profil"
        className="fixed bottom-24 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
