import { useState } from 'react'
import { Disc3, Heart, Plus, Shirt } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge, IconTile, Row } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'
import { CollectionDetailPage } from './CollectionDetailPage'

// Écran statique (pas d'entité "Collection" côté backend) : données
// factices reprises telles quelles du Figma (15 — COLLECTIONS, 15.1).
// Les interactions ne changent que l'état local, rien n'est persisté.
const COLLECTIONS = [
  {
    id: 'vinyles',
    nom: 'Vinyles',
    sousTitre: '32 objets · privée',
    visibilite: 'privee',
    icon: Disc3,
    tone: 'violet',
    objets: [
      { id: 'abbey-road', nom: 'Abbey Road', sousTitre: 'The Beatles' },
      { id: 'kind-of-blue', nom: 'Kind of Blue', sousTitre: 'Miles Davis' },
      { id: 'rumours', nom: 'Rumours', sousTitre: 'Fleetwood Mac' },
      { id: 'discovery', nom: 'Discovery', sousTitre: 'Daft Punk' },
    ],
  },
  { id: 'livres-cuisine', nom: 'Livres de cuisine', sousTitre: '14 objets · amis', visibilite: 'amis', icon: Heart, tone: 'amber', objets: [] },
  { id: 'vetements-vintage', nom: 'Vêtements vintage', sousTitre: '21 objets · privée', visibilite: 'privee', icon: Shirt, tone: 'pink', objets: [] },
]

export function CollectionsPage({ onBack }) {
  const { t } = useTranslation('collections')
  const [openId, setOpenId] = useState(null)

  const ouverte = COLLECTIONS.find((c) => c.id === openId)
  if (ouverte) {
    return <CollectionDetailPage collection={ouverte} onBack={() => setOpenId(null)} />
  }

  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader title={t('list.title')} subtitle={t('list.subtitle', { count: COLLECTIONS.length })} onBack={onBack} />

      <div className="space-y-2.5 px-6 py-5 md:px-10">
        {COLLECTIONS.map((c) => (
          <Row
            key={c.id}
            lead={<IconTile icon={c.icon} size={48} tone={c.tone} />}
            title={c.nom}
            subtitle={c.sousTitre}
            trailing={<Badge tone={c.visibilite === 'privee' ? 'gray' : 'pink'}>{t(`list.visibility.${c.visibilite}`)}</Badge>}
            onClick={() => setOpenId(c.id)}
          />
        ))}
      </div>

      <button
        type="button"
        aria-label={t('list.addNew')}
        className="fixed bottom-24 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
