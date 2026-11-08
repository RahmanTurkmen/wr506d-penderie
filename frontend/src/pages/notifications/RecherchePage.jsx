import { useState } from 'react'
import { ShoppingBag, Wrench, X } from 'lucide-react'
import { Chip, IconTile, Row } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

// Écran statique (Figma 13.2 Recherche). Filtre uniquement les résultats
// factices ci-dessous en local, aucune requête API.
const RESULTATS = [
  { id: 1, type: 'objet', icon: Wrench, titre: 'Veste Zara', sousTitre: 'Cave › Établi' },
  { id: 2, type: 'objet', icon: Wrench, titre: 'Perceuse à percussion', sousTitre: 'Garde-meuble' },
  { id: 3, type: 'annonce', icon: ShoppingBag, titre: 'Perceuse sans fil · 40 €', sousTitre: 'Annonce de Tom' },
]

const FILTRES = [
  { id: 'tout', label: 'Tout' },
  { id: 'objet', label: 'Objets' },
  { id: 'ami', label: 'Amis' },
  { id: 'annonce', label: 'Annonces' },
]

export function RecherchePage({ onBack }) {
  const [query, setQuery] = useState('perceuse')
  const [filtre, setFiltre] = useState('tout')

  const resultats = RESULTATS.filter((r) => {
    if (filtre !== 'tout' && r.type !== filtre) return false
    if (!query.trim()) return true
    return r.titre.toLowerCase().includes(query.trim().toLowerCase())
  })

  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader title="Recherche" subtitle="Objets, amis, annonces" onBack={onBack} />

      <div className="space-y-4 px-6 py-5 md:px-10">
        <span className="flex h-12 items-center gap-2.5 rounded-[14px] border border-border bg-card px-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher…"
            className="h-full w-full min-w-0 bg-transparent text-sm text-foreground outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Effacer">
              <X className="h-[18px] w-[18px] text-muted-foreground" />
            </button>
          )}
        </span>

        <div className="flex gap-2">
          {FILTRES.map((f) => (
            <Chip key={f.id} active={filtre === f.id} onClick={() => setFiltre(f.id)}>
              {f.label}
            </Chip>
          ))}
        </div>

        {resultats.length === 0 && (
          <p className="rounded-2xl bg-card px-4 py-5 text-center text-sm text-muted-foreground">Aucun résultat.</p>
        )}

        {resultats.map((r) => (
          <Row key={r.id} lead={<IconTile icon={r.icon} size={44} />} title={r.titre} subtitle={r.sousTitre} />
        ))}
      </div>
    </div>
  )
}
