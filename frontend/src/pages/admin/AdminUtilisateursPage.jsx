import { useState } from 'react'
import { Copy } from 'lucide-react'
import { Badge, Chip, Row } from '@/components/lumen/primitives'

// Reprend le Figma 14.2 (liste tronquée à 3 lignes) + quelques comptes
// supplémentaires repris du propre casting de fixtures de l'app (Tom,
// Lilou, Alex, Eva) pour que la liste/filtre ait un peu de volume, sans
// inventer de nouvelles personnes.
const UTILISATEURS = [
  { id: 'rahman', nom: 'Rahman Lefèvre', email: 'Rahman@example.com', statut: 'actif', initiale: 'R' },
  { id: 'camille', nom: 'Camille Roux', email: 'camille@example.com', statut: 'actif', initiale: 'C' },
  { id: 'theo', nom: 'Théo Blanc', email: 'theo@example.com', statut: 'suspendu', initiale: 'T' },
  { id: 'tom', nom: 'Tom Martin', email: 'tom@example.com', statut: 'actif', initiale: 'T' },
  { id: 'lilou', nom: 'Lilou', email: 'lilou@example.com', statut: 'actif', initiale: 'L' },
  { id: 'eva', nom: 'Eva', email: '—', statut: 'enfant', initiale: 'E' },
  { id: 'alex', nom: 'Alex', email: 'alex@example.com', statut: 'suspendu', initiale: 'A' },
]

const BADGE = {
  actif: { label: 'Actif', tone: 'pink' },
  suspendu: { label: 'Suspendu', tone: 'gray' },
  enfant: { label: 'Enfant', tone: 'pink' },
}

export function AdminUtilisateursPage() {
  const [filtre, setFiltre] = useState('tous') // 'tous' | 'actif' | 'suspendu' | 'enfant'

  const visibles = filtre === 'tous' ? UTILISATEURS : UTILISATEURS.filter((u) => u.statut === filtre)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Chip active={filtre === 'tous'} onClick={() => setFiltre('tous')}>
            Tous
          </Chip>
          <Chip active={filtre === 'actif'} onClick={() => setFiltre('actif')}>
            Actifs
          </Chip>
          <Chip active={filtre === 'suspendu'} onClick={() => setFiltre('suspendu')}>
            Suspendus
          </Chip>
          <Chip active={filtre === 'enfant'} onClick={() => setFiltre('enfant')}>
            Enfants
          </Chip>
        </div>
        <button
          type="button"
          className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-muted"
        >
          <Copy className="h-4 w-4" />
          Exporter
        </button>
      </div>

      <div className="space-y-1">
        {visibles.map((u) => (
          <Row
            key={u.id}
            lead={
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                {u.initiale}
              </span>
            }
            title={u.nom}
            subtitle={u.email}
            trailing={<Badge tone={BADGE[u.statut].tone}>{BADGE[u.statut].label}</Badge>}
          />
        ))}
      </div>
    </div>
  )
}
