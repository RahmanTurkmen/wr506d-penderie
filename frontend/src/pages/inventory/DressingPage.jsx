import { useMemo, useState } from 'react'
import { ListFilter, Shirt } from 'lucide-react'
import { Chip, EmptyState } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { photoUrl } from '@/lib/api'

// Le dressing n'est pas une entité à part dans le modèle de données : c'est
// une vue filtrée de l'inventaire sur les objets de type "vetement", avec un
// filtrage plus riche (catégorie + tags, ex. saison/usage) que la liste
// générale — pas de champs marque/taille/couleur fictifs, ceux-là viendront
// quand le modèle de données les aura vraiment.
// Le dressing n'a qu'un seul type d'objet (vêtement) : on varie plutôt les
// tons par catégorie (Hauts, Bas, Chaussures...) pour éviter un mur de rose
// uniforme, via un petit hash déterministe plutôt qu'une liste à maintenir.
const TONES = ['bg-secondary text-primary', 'bg-amber-100 text-amber-700', 'bg-violet-100 text-violet-700', 'bg-sky-100 text-sky-700']
function toneForCategorie(nom) {
  if (!nom) return TONES[0]
  const hash = [...nom].reduce((h, c) => h + c.charCodeAt(0), 0)
  return TONES[hash % TONES.length]
}

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
          <Select
            value={categorieFilter ?? 'tout'}
            onValueChange={(v) => setCategorieFilter(v === 'tout' ? null : v)}
          >
            <SelectTrigger className="h-12 w-full justify-between gap-2.5 rounded-2xl border-2 border-primary/20 bg-secondary px-4 text-sm font-semibold text-primary [&>svg]:text-primary">
              <span className="flex items-center gap-2.5">
                <ListFilter className="h-[18px] w-[18px] shrink-0" />
                <SelectValue placeholder="Catégorie">
                  {(value) => (value === 'tout' || !value ? 'Tout' : (categories.find((c) => c.id === value)?.nom ?? 'Catégorie'))}
                </SelectValue>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tout">Tout</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <div className="grid grid-cols-2 gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => onOpenObjet(o.id)}
                className="flex flex-col gap-2 rounded-2xl bg-card p-3 text-left transition-all duration-150 hover:bg-muted active:scale-[0.97]"
              >
                {o.photo ? (
                  <img src={photoUrl(o.photo)} alt={o.nom} className="aspect-square w-full rounded-[14px] object-cover" />
                ) : (
                  <span className={`flex aspect-square w-full items-center justify-center rounded-[14px] ${toneForCategorie(o.categorie?.nom)}`}>
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
