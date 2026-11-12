import { Box, Flag, ShoppingBag, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('admin')
  const aTraiter = signalements.slice(0, 2)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <StatCard value="1 284" label={t('dashboard.stats.users')} icon={Users} tone="sky" />
        <StatCard value="9 420" label={t('dashboard.stats.objects')} icon={Box} tone="pink" />
        <StatCard value="212" label={t('dashboard.stats.salesThisMonth')} icon={ShoppingBag} tone="amber" />
        <StatCard value={String(signalements.length)} label={t('dashboard.stats.reports')} icon={Flag} tone="violet" />
      </div>

      <section className="space-y-2.5">
        <SectionHeader
          title={t('dashboard.toProcess')}
          action={
            <button type="button" onClick={onOpenSignalements} className="text-sm font-semibold text-primary">
              {t('dashboard.seeAll')}
            </button>
          }
        />
        {aTraiter.map((s) => (
          <Row
            key={s.id}
            lead={<IconTile icon={Flag} size={44} tone={s.urgence === 'urgent' ? 'amber' : 'violet'} />}
            title={s.titre}
            subtitle={s.detail}
            trailing={<Badge tone={s.urgence === 'urgent' ? 'solid' : 'pink'}>{t(`reports.urgency.${s.urgence}`)}</Badge>}
          />
        ))}
      </section>
    </div>
  )
}
