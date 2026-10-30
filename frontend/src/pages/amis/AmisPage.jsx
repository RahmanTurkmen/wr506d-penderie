import { useState } from 'react'
import { Check, Plus, UserPlus } from 'lucide-react'
import { Chip, IconTile, Row } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

// Écran statique (pas d'entité "Ami"/"Abonnement" côté backend) : données
// factices reprises telles quelles du Figma (06 — AMIS & ABONNÉS, 08.1).
// Les interactions (onglets, accepter/refuser) ne font que changer l'état
// local, rien n'est persisté.
const AMIS = [
  { id: 'tom', nom: 'Tom', sousTitre: '4 objets partagés avec toi' },
  { id: 'lilou', nom: 'Lilou', sousTitre: 'Ami depuis mars 2026' },
  { id: 'max', nom: 'Max', sousTitre: '1 prêt en cours' },
]

const DEMANDES_INITIALES = [{ id: 'noa', nom: 'Noa', sousTitre: 'Veut devenir ton ami' }]

export function AmisPage({ onBack }) {
  const [tab, setTab] = useState('amis') // 'amis' | 'abonnes' | 'demandes'
  const [demandes, setDemandes] = useState(DEMANDES_INITIALES)

  function repondre(id) {
    setDemandes((prev) => prev.filter((d) => d.id !== id))
  }

  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader title="Amis" subtitle={`12 amis · ${demandes.length} demande${demandes.length > 1 ? 's' : ''}`} onBack={onBack} />

      <div className="space-y-4 px-6 py-5 md:px-10">
        <div className="flex gap-2">
          <Chip active={tab === 'amis'} onClick={() => setTab('amis')}>
            Amis
          </Chip>
          <Chip active={tab === 'abonnes'} onClick={() => setTab('abonnes')}>
            Abonnés
          </Chip>
          <Chip active={tab === 'demandes'} onClick={() => setTab('demandes')}>
            Demandes {demandes.length}
          </Chip>
        </div>

        {tab === 'amis' &&
          AMIS.map((a) => <Row key={a.id} lead={<IconTile icon={UserPlus} size={44} />} title={a.nom} subtitle={a.sousTitre} />)}

        {tab === 'abonnes' && (
          <p className="rounded-2xl bg-card px-4 py-5 text-center text-sm text-muted-foreground">Aucun abonné pour le moment.</p>
        )}

        {(tab === 'amis' || tab === 'demandes') && demandes.length > 0 && (
          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-foreground">Demandes reçues</h2>
            {demandes.map((d) => (
              <div key={d.id} className="rounded-2xl bg-card p-4">
                <div className="flex items-center gap-3.5">
                  <IconTile icon={UserPlus} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{d.nom}</p>
                    <p className="truncate text-xs text-muted-foreground">{d.sousTitre}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => repondre(d.id)}
                    className="h-9 flex-1 rounded-full border border-border text-sm font-semibold text-foreground"
                  >
                    Refuser
                  </button>
                  <button
                    type="button"
                    onClick={() => repondre(d.id)}
                    className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Accepter
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {tab === 'demandes' && demandes.length === 0 && (
          <p className="rounded-2xl bg-card px-4 py-5 text-center text-sm text-muted-foreground">Aucune demande en attente.</p>
        )}
      </div>

      <button
        type="button"
        aria-label="Ajouter un ami"
        className="fixed bottom-24 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg md:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
