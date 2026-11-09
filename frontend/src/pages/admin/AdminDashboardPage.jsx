import { Box, Flag, ShoppingBag, Users } from 'lucide-react'
import { Badge, Row, SectionHeader, IconTile } from '@/components/lumen/primitives'

// Écran statique (pas d'entité "Administration" côté backend) : données
// factices reprises du Figma (14 — BACK-OFFICE ADMIN, 14.1 Tableau de
// bord). Le Figma ne dessine que des frames desktop pour cette section
// (aucune frame "M ·"), mais Lumen reste mobile-first de bout en bout :
// même traitement responsive que partout ailleurs dans l'app (grille 2
// colonnes en mobile, 4 à partir de md).
function StatCard({ value, label, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3.5">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-primary">{value}</span>
        <IconTile icon={Icon} size={32} tone={tone} />
      </div>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  )
}

export function AdminDashboardPage({ signalements, onOpenSignalements }) {
  const aTraiter = signalements.slice(0, 2)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <StatCard value="1 284" label="Utilisateurs" icon={Users} tone="sky" />
        <StatCard value="9 420" label="Objets" icon={Box} tone="pink" />
        <StatCard value="212" label="Ventes ce mois" icon={ShoppingBag} tone="amber" />
        <StatCard value={String(signalements.length)} label="Signalements" icon={Flag} tone="violet" />
      </div>

      <section className="space-y-2.5">
        <SectionHeader
          title="À traiter"
          action={
            <button type="button" onClick={onOpenSignalements} className="text-sm font-semibold text-primary">
              Tout voir
            </button>
          }
        />
        {aTraiter.map((s) => (
          <Row
            key={s.id}
            lead={<IconTile icon={Flag} size={44} tone={s.urgence === 'Urgent' ? 'amber' : 'violet'} />}
            title={s.titre}
            subtitle={s.detail}
            trailing={<Badge tone={s.urgence === 'Urgent' ? 'solid' : 'pink'}>{s.urgence}</Badge>}
          />
        ))}
      </section>
    </div>
  )
}
