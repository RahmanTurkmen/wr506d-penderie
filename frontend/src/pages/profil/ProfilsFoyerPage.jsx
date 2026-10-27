import { Loader2, Plus, Users } from 'lucide-react'
import { Badge, EmptyState, IconTile, Row } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

export function ProfilsFoyerPage({ profils, activeProfilId, loading, onBack, onNewProfil }) {
  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader
        title="Profils du foyer"
        subtitle="Un compte principal, des profils gérés"
        onBack={onBack}
        action={
          <button
            type="button"
            onClick={onNewProfil}
            className="hidden h-10 shrink-0 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground md:flex"
          >
            <Plus className="h-4 w-4" />
            Ajouter un profil
          </button>
        }
      />

      <div className="space-y-2.5 px-6 py-5 md:px-10">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement…
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
        className="fixed bottom-24 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg md:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
