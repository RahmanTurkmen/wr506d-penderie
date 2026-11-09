import { Disc3, Plus } from 'lucide-react'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

// Figma 15.2 — Détail collection. Statique, voir CollectionsPage.jsx.
export function CollectionDetailPage({ collection, onBack }) {
  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader title={collection.nom} subtitle={collection.sousTitre} onBack={onBack} />

      <div className="px-6 py-5 md:px-10">
        {collection.objets.length === 0 ? (
          <p className="rounded-2xl bg-card px-4 py-5 text-center text-sm text-muted-foreground">Aucun objet dans cette collection pour le moment.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {collection.objets.map((o) => (
              <div key={o.id} className="rounded-2xl bg-card p-3">
                <span className="flex aspect-[4/3] w-full items-center justify-center rounded-[14px] bg-secondary text-primary">
                  <Disc3 className="h-9 w-9" />
                </span>
                <p className="mt-2 truncate text-sm font-semibold text-foreground">{o.nom}</p>
                <p className="truncate text-xs text-muted-foreground">{o.sousTitre}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 pb-6 md:px-10">
        <button
          type="button"
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground"
        >
          <Plus className="h-[18px] w-[18px]" />
          Ajouter des objets
        </button>
      </div>
    </div>
  )
}
