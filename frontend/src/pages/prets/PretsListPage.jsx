import { useState } from 'react'
import { AlertCircle, Check, Loader2, Plus, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge, Chip, EmptyState, IconTile, Row } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'
import { photoUrl } from '@/lib/api'

function dateLabel(iso) {
  return iso ? new Date(iso).toLocaleDateString('fr-FR') : null
}

export function PretsListPage({ loans, loading, error, onOpenObjet, onNewPret, onCloturer, busyId, onBack }) {
  const { t } = useTranslation('prets')
  const [tab, setTab] = useState('encours')

  const enCours = loans.filter((l) => l.pret.actif)
  const termines = loans.filter((l) => !l.pret.actif)
  const list = tab === 'encours' ? enCours : termines

  return (
    <div className="flex flex-1 flex-col pb-24 md:pb-10">
      <ScreenHeader
        title={t('list.title')}
        subtitle={
          loading
            ? '…'
            : `${t('list.subtitleOngoing', { count: enCours.length })} · ${t('list.subtitleFinished', { count: termines.length })}`
        }
        onBack={onBack}
      />

      <div className="space-y-4 px-6 py-5 md:px-10">
        <div className="flex gap-2">
          <Chip active={tab === 'encours'} onClick={() => setTab('encours')}>
            {t('list.tabOngoing')} {enCours.length > 0 ? `(${enCours.length})` : ''}
          </Chip>
          <Chip active={tab === 'termines'} onClick={() => setTab('termines')}>
            {t('list.tabFinished')} {termines.length > 0 ? `(${termines.length})` : ''}
          </Chip>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('list.loading')}
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-[18px] w-[18px] shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && list.length === 0 && (
          <EmptyState>
            {tab === 'encours' ? t('list.emptyOngoing') : t('list.emptyFinished')}
          </EmptyState>
        )}

        {!loading &&
          !error &&
          list.map(({ objet, pret }) => {
            const retour = dateLabel(pret.dateFinPrevue)
            const late = pret.late
            return (
              <Row
                key={pret.id}
                onClick={() => onOpenObjet(objet.id)}
                lead={<IconTile icon={RefreshCw} photoSrc={photoUrl(objet.photo)} />}
                title={objet.nom}
                subtitle={
                  retour
                    ? t('list.lentToWithReturn', { name: pret.emprunteurNom, date: retour })
                    : t('list.lentTo', { name: pret.emprunteurNom })
                }
                trailing={
                  pret.actif ? (
                    <div className="flex items-center gap-2">
                      {late && <Badge tone="solid">{t('list.late')}</Badge>}
                      <button
                        type="button"
                        disabled={busyId === pret.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onCloturer(pret.id)
                        }}
                        className="flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground disabled:opacity-50"
                      >
                        {busyId === pret.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        {t('list.returnButton')}
                      </button>
                    </div>
                  ) : (
                    <Badge tone="gray">{t('list.finishedBadge')}</Badge>
                  )
                }
              />
            )
          })}
      </div>

      <button
        type="button"
        onClick={onNewPret}
        aria-label={t('list.newPretAria')}
        className="fixed bottom-24 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
