import { Check, RefreshCw, Search, ShoppingBag, UserPlus } from 'lucide-react'
import { Badge, IconTile, Row } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

// Écran statique (Figma 13.1 Notifications). Aucune entité Notification
// n'existe côté backend : "lu/non lu" ne vit qu'en state local, rien n'est
// envoyé à l'API.
const INITIAL = [
  { id: 1, icon: RefreshCw, tone: 'amber', titre: 'Veste Zara en retard', sousTitre: 'Tom devait la rendre le 14 oct.', nouveau: true },
  { id: 2, icon: UserPlus, tone: 'sky', titre: 'Noa veut devenir ton ami', sousTitre: 'Il y a 2 h', nouveau: true },
  { id: 3, icon: ShoppingBag, tone: 'violet', titre: 'Question sur « Poussette »', sousTitre: 'Lilou · il y a 5 h', nouveau: true },
  { id: 4, icon: Check, tone: 'pink', titre: 'Prêt terminé', sousTitre: 'Max a rendu « Les 3 Mousquetaires »', nouveau: false },
]

export function NotificationsPage({ onBack, onOpenRecherche }) {
  const nouvelles = INITIAL.filter((n) => n.nouveau).length

  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader
        title="Notifications"
        subtitle={`${nouvelles} nouvelle${nouvelles > 1 ? 's' : ''}`}
        onBack={onBack}
        action={
          <button
            type="button"
            onClick={onOpenRecherche}
            aria-label="Recherche"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
        }
      />

      <div className="space-y-2.5 px-6 py-5 md:px-10">
        {INITIAL.map((n) => (
          <Row
            key={n.id}
            lead={<IconTile icon={n.icon} size={44} tone={n.tone} />}
            title={n.titre}
            subtitle={n.sousTitre}
            trailing={n.nouveau ? <Badge tone="solid">Nouveau</Badge> : null}
          />
        ))}
      </div>
    </div>
  )
}
