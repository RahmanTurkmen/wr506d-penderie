import { useState } from 'react'
import { Bike, Book, Box, Plus } from 'lucide-react'
import { Badge, Chip, IconTile, Row } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

// Écran statique (dédié à la navigation/gestion des annonces, Figma
// 10 — VENTE, 10.1). Le vrai statut "en_vente" d'un objet et l'entité
// Transaction existent côté backend et sont déjà utilisés ailleurs
// (AddObjetPage/ObjetDetailPage) — ce flux-ci reste volontairement non
// branché, comme demandé pour ce lot d'écrans.
const ANNONCES = [
  { id: 'velo', nom: 'Vélo rose enfant', icon: Bike, sousTitre: '45 € · 12 vues · 2 questions', statut: 'en_ligne' },
  { id: 'poussette', nom: 'Poussette', icon: Box, sousTitre: '60 € · 31 vues', statut: 'en_ligne' },
  { id: 'livres', nom: 'Lot de livres', icon: Book, sousTitre: '10 € · en attente de validation', statut: 'a_valider' },
]

export function VentesPage({ onBack }) {
  const [tab, setTab] = useState('en_vente') // 'en_vente' | 'vendues' | 'brouillons'

  const visibles = tab === 'en_vente' ? ANNONCES : []

  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader title="Ventes" subtitle="3 annonces · 1 vendue" onBack={onBack} />

      <div className="space-y-4 px-6 py-5 md:px-10">
        <div className="flex gap-2">
          <Chip active={tab === 'en_vente'} onClick={() => setTab('en_vente')}>
            En vente
          </Chip>
          <Chip active={tab === 'vendues'} onClick={() => setTab('vendues')}>
            Vendues
          </Chip>
          <Chip active={tab === 'brouillons'} onClick={() => setTab('brouillons')}>
            Brouillons
          </Chip>
        </div>

        {visibles.length === 0 && (
          <p className="rounded-2xl bg-card px-4 py-5 text-center text-sm text-muted-foreground">
            {tab === 'vendues' ? 'Aucune vente pour le moment.' : 'Aucun brouillon.'}
          </p>
        )}

        {visibles.map((a) => (
          <Row
            key={a.id}
            lead={<IconTile icon={a.icon} size={48} />}
            title={a.nom}
            subtitle={a.sousTitre}
            trailing={<Badge tone={a.statut === 'a_valider' ? 'solid' : 'pink'}>{a.statut === 'a_valider' ? 'À valider' : 'En ligne'}</Badge>}
          />
        ))}
      </div>

      <button
        type="button"
        aria-label="Mettre un objet en vente"
        className="fixed bottom-24 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg md:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
