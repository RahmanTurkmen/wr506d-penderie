import { Check, Loader2, ShoppingBag, Users, X } from 'lucide-react'
import { EmptyState, IconTile } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

function titleFor(validation, objetNoms) {
  if (validation.type === 'objet_en_vente') {
    const objetId = validation.payload?.objetId
    const nom = objetId ? objetNoms[objetId] : null
    return nom ? `Mettre « ${nom} » en vente` : 'Mettre un objet en vente'
  }
  return 'Partager le dressing'
}

export function ValidationsPage({ validations, objetNoms, loading, error, onBack, onDecide, busyId }) {
  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader
        title="À valider"
        subtitle={loading ? '…' : `${validations.length} demande${validations.length > 1 ? 's' : ''}`}
        onBack={onBack}
      />

      <div className="space-y-3 px-6 py-5 md:px-10">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement…
          </div>
        )}

        {!loading && error && <p className="rounded-2xl bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}

        {!loading && !error && validations.length === 0 && <EmptyState>Aucune demande en attente.</EmptyState>}

        {!loading &&
          validations.map((v) => (
            <div key={v.id} className="rounded-2xl bg-card p-4">
              <div className="flex items-center gap-3.5">
                <IconTile icon={v.type === 'objet_en_vente' ? ShoppingBag : Users} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{titleFor(v, objetNoms)}</p>
                  <p className="truncate text-xs text-muted-foreground">Demandé par {v.profil.nom}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2.5">
                <button
                  type="button"
                  disabled={busyId === v.id}
                  onClick={() => onDecide(v.id, 'refusee')}
                  className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-border text-sm font-semibold text-foreground disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Refuser
                </button>
                <button
                  type="button"
                  disabled={busyId === v.id}
                  onClick={() => onDecide(v.id, 'validee')}
                  className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {busyId === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  Approuver
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
