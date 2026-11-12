import { useState } from 'react'
import { ShoppingBag, Wrench, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Chip, IconTile, Row } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

// Écran statique (Figma 13.2 Recherche). Filtre uniquement les résultats
// factices ci-dessous en local, aucune requête API.
const RESULTATS = [
  { id: 1, type: 'objet', icon: Wrench, tone: 'sky', titre: 'Veste Zara', sousTitre: 'Cave › Établi' },
  { id: 2, type: 'objet', icon: Wrench, tone: 'sky', titre: 'Perceuse à percussion', sousTitre: 'Garde-meuble' },
  { id: 3, type: 'annonce', icon: ShoppingBag, tone: 'amber', titre: 'Perceuse sans fil · 40 €', sousTitre: 'Annonce de Tom' },
]

const FILTRE_IDS = ['tout', 'objet', 'ami', 'annonce']
const FILTRE_KEYS = { tout: 'all', objet: 'objects', ami: 'friends', annonce: 'listings' }

export function RecherchePage({ onBack }) {
  const { t } = useTranslation('notifications')
  const [query, setQuery] = useState('perceuse')
  const [filtre, setFiltre] = useState('tout')

  const resultats = RESULTATS.filter((r) => {
    if (filtre !== 'tout' && r.type !== filtre) return false
    if (!query.trim()) return true
    return r.titre.toLowerCase().includes(query.trim().toLowerCase())
  })

  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader title={t('search.title')} subtitle={t('search.subtitle')} onBack={onBack} />

      <div className="space-y-4 px-6 py-5 md:px-10">
        <span className="flex h-12 items-center gap-2.5 rounded-[14px] border border-border bg-card px-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="h-full w-full min-w-0 bg-transparent text-sm text-foreground outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label={t('search.clearAriaLabel')}>
              <X className="h-[18px] w-[18px] text-muted-foreground" />
            </button>
          )}
        </span>

        <div className="flex gap-2">
          {FILTRE_IDS.map((id) => (
            <Chip key={id} active={filtre === id} onClick={() => setFiltre(id)}>
              {t(`search.filters.${FILTRE_KEYS[id]}`)}
            </Chip>
          ))}
        </div>

        {resultats.length === 0 && (
          <p className="rounded-2xl bg-card px-4 py-5 text-center text-sm text-muted-foreground">{t('search.empty')}</p>
        )}

        {resultats.map((r) => (
          <Row key={r.id} lead={<IconTile icon={r.icon} size={44} tone={r.tone} />} title={r.titre} subtitle={r.sousTitre} />
        ))}
      </div>
    </div>
  )
}
