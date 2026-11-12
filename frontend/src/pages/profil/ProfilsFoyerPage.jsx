import { Loader2, Plus, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge, EmptyState, IconTile, Row } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

export function ProfilsFoyerPage({ profils, activeProfilId, loading, onBack, onNewProfil }) {
  const { t } = useTranslation('profil')
  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader title={t('foyer.title')} subtitle={t('foyer.subtitle')} onBack={onBack} />

      <div className="space-y-2.5 px-6 py-5 md:px-10">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('foyer.loading')}
          </div>
        )}

        {!loading && profils.length === 0 && <EmptyState>{t('foyer.empty')}</EmptyState>}

        {!loading &&
          profils.map((p) => (
            <Row
              key={p.id}
              lead={<IconTile icon={Users} size={44} />}
              title={p.nom}
              subtitle={p.type === 'principal' ? t('foyer.mainAccount') : p.estMineur ? t('foyer.childProfile') : t('foyer.managedProfile')}
              trailing={p.id === activeProfilId ? <Badge tone="solid">{t('foyer.active')}</Badge> : null}
            />
          ))}
      </div>

      <button
        type="button"
        onClick={onNewProfil}
        aria-label={t('foyer.addAria')}
        className="fixed bottom-24 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
