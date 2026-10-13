import { useMemo, useState } from 'react'
import { AlertCircle, BookOpen, Disc3, Loader2, Package, Plus, Search, Shirt } from 'lucide-react'
import { Chip, EmptyState } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'
import { photoUrl } from '@/lib/api'

const TYPE_ICON = { vetement: Shirt, livre: BookOpen, vinyle: Disc3, autre: Package }

export function InventoryListPage({ objets, categories, loading, error, onOpenObjet, onAddObjet }) {
  const [search, setSearch] = useState('')
  const [categorieFilter, setCategorieFilter] = useState(null)

  const filtered = useMemo(() => {
    const list = objets ?? []
    const q = search.trim().toLowerCase()
    return list.filter((o) => {
      if (categorieFilter && o.categorie?.id !== categorieFilter) return false
      if (q && !o.nom.toLowerCase().includes(q)) return false
      return true
    })
  }, [objets, search, categorieFilter])

  return (
    <div className="flex flex-1 flex-col pb-24 md:pb-10">
      <ScreenHeader
        title="Inventaire"
        subtitle={loading ? '…' : `${objets.length} objet${objets.length > 1 ? 's' : ''}`}
        action={
          <button
            type="button"
            onClick={onAddObjet}
            className="hidden h-10 shrink-0 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground md:flex"
          >
            <Plus className="h-4 w-4" />
            Ajouter un objet
          </button>
        }
      />

      <div className="space-y-4 px-6 py-5 md:px-10">
        <div className="flex h-12 items-center gap-2.5 rounded-2xl border border-border bg-card px-4">
          <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un objet, une marque…"
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            <Chip active={categorieFilter === null} onClick={() => setCategorieFilter(null)}>
              Tout
            </Chip>
            {categories.map((c) => (
              <Chip key={c.id} active={categorieFilter === c.id} onClick={() => setCategorieFilter(c.id)}>
                {c.nom}
              </Chip>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement…
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-[18px] w-[18px] shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState>
            {objets.length === 0 ? "Aucun objet pour le moment — ajoute ton premier objet." : 'Aucun objet ne correspond à ta recherche.'}
          </EmptyState>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {filtered.map((o) => {
              const Icon = TYPE_ICON[o.type] ?? Package
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => onOpenObjet(o.id)}
                  className="flex flex-col gap-2 rounded-2xl bg-card p-3 text-left transition-colors hover:bg-muted"
                >
                  {o.photo ? (
                    <img
                      src={photoUrl(o.photo)}
                      alt={o.nom}
                      className="aspect-square w-full rounded-[14px] object-cover"
                    />
                  ) : (
                    <span className="flex aspect-square w-full items-center justify-center rounded-[14px] bg-secondary text-primary">
                      <Icon className="h-9 w-9" />
                    </span>
                  )}
                  <span className="truncate text-sm font-semibold text-foreground">{o.nom}</span>
                  <span className="truncate text-xs text-muted-foreground">{o.piece?.nom ?? o.conteneur?.nom ?? '—'}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* FAB mobile */}
      <button
        type="button"
        onClick={onAddObjet}
        aria-label="Ajouter un objet"
        className="fixed bottom-24 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg md:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
