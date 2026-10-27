import { Loader2, Plus, Shirt, X } from 'lucide-react'
import { EmptyState, IconTile, Row, SectionHeader } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'
import { photoUrl } from '@/lib/api'

export function TenuesListPage({ tenues, refus, loading, error, onNewTenue, onNewRefus, onOpenObjet }) {
  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader title="Tenues" subtitle="Compose tes tenues à partir de ton inventaire" />

      <div className="space-y-6 px-6 py-5 md:px-10">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement…
          </div>
        )}

        {!loading && error && (
          <p className="rounded-2xl bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>
        )}

        {!loading && !error && (
          <>
            <section className="space-y-2.5">
              <SectionHeader
                title="Tes tenues"
                action={
                  <button type="button" onClick={onNewTenue} className="text-sm font-semibold text-primary">
                    + Nouvelle
                  </button>
                }
              />

              {tenues.length === 0 && <EmptyState>Aucune tenue composée pour le moment.</EmptyState>}

              {tenues.length > 0 && (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {tenues.map((tenue) => (
                    <div key={tenue.id} className="rounded-2xl bg-card p-3">
                      <p className="truncate text-sm font-semibold text-foreground">{tenue.nom}</p>
                      <p className="mb-2 text-xs text-muted-foreground">
                        {tenue.objets.length} objet{tenue.objets.length > 1 ? 's' : ''}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {tenue.objets.slice(0, 4).map((o) => (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => onOpenObjet(o.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-secondary text-primary"
                            title={o.nom}
                          >
                            <Shirt className="h-4 w-4" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-2.5">
              <SectionHeader
                title="Tu ne veux pas porter"
                action={
                  <button type="button" onClick={onNewRefus} className="text-sm font-semibold text-primary">
                    + Ajouter
                  </button>
                }
              />

              {refus.length === 0 && <EmptyState>Rien d'exclu pour l'instant.</EmptyState>}

              {refus.map((r) => (
                <Row
                  key={r.id}
                  lead={<IconTile icon={X} photoSrc={r.objet ? photoUrl(r.objet.photo) : null} />}
                  title={r.objet ? r.objet.nom : r.categorie?.nom}
                  subtitle={r.objet ? 'Objet' : 'Catégorie entière'}
                />
              ))}
            </section>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onNewTenue}
        aria-label="Nouvelle tenue"
        className="fixed bottom-24 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg md:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
