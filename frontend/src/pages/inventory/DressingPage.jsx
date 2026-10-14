import { useMemo, useState } from 'react'
import { Shirt } from 'lucide-react'
import { Chip, EmptyState } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'
import { photoUrl } from '@/lib/api'

// Le dressing n'est pas une entité à part dans le modèle de données : c'est
// une vue filtrée de l'inventaire sur les objets de type "vetement", avec un
// filtrage plus riche (catégorie + tags, ex. saison/usage) que la liste
// générale — pas de champs marque/taille/couleur fictifs, ceux-là viendront
// quand le modèle de données les aura vraiment.
export function DressingPage({ objets, tags, onBack, onOpenObjet }) {
  const [categorieFilter, setCategorieFilter] = useState(null)
  const [tagFilter, setTagFilter] = useState([])

  const vetements = useMemo(() => objets.filter((o) => o.type === 'vetement'), [objets])

  const categories = useMemo(() => {
    const map = new Map()
    for (const o of vetements) if (o.categorie) map.set(o.categorie.id, o.categorie)
    return [...map.values()]
  }, [vetements])

  const tagsUtilises = useMemo(() => {
    const ids = new Set(vetements.flatMap((o) => o.tags.map((t) => t.id)))
    return tags.filter((t) => ids.has(t.id))
  }, [vetements, tags])

  function toggleTag(id) {
    setTagFilter((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  const filtered = vetements.filter((o) => {
    if (categorieFilter && o.categorie?.id !== categorieFilter) return false
    if (tagFilter.length > 0 && !o.tags.some((t) => tagFilter.includes(t.id))) return false
    return true
  })

  return (
    <div className="flex flex-1 flex-col pb-24 md:pb-10">
      <ScreenHeader title="Dressing" subtitle={`${vetements.length} vêtement${vetements.length > 1 ? 's' : ''}`} onBack={onBack} />

      <div className="space-y-4 px-6 py-5 md:px-10">
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

        {tagsUtilises.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tagsUtilises.map((t) => (
              <Chip key={t.id} active={tagFilter.includes(t.id)} onClick={() => toggleTag(t.id)}>
                #{t.nom}
              </Chip>
            ))}
          </div>
        )}

        {vetements.length === 0 && (
          <EmptyState>
            Aucun vêtement pour le moment — ajoute un objet de type « Vêtement » depuis l'inventaire.
          </EmptyState>
        )}

        {vetements.length > 0 && filtered.length === 0 && <EmptyState>Aucun vêtement ne correspond à ces filtres.</EmptyState>}

        {filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => onOpenObjet(o.id)}
                className="flex flex-col gap-2 rounded-2xl bg-card p-3 text-left transition-colors hover:bg-muted"
              >
                {o.photo ? (
                  <img src={photoUrl(o.photo)} alt={o.nom} className="aspect-square w-full rounded-[14px] object-cover" />
                ) : (
                  <span className="flex aspect-square w-full items-center justify-center rounded-[14px] bg-secondary text-primary">
                    <Shirt className="h-9 w-9" />
                  </span>
                )}
                <span className="truncate text-sm font-semibold text-foreground">{o.nom}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {o.tags.length > 0 ? o.tags.map((t) => t.nom).join(', ') : (o.piece?.nom ?? o.conteneur?.nom ?? '—')}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
