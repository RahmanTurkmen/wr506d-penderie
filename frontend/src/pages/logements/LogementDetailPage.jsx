import { MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EmptyState, IconTile, Row } from '@/components/lumen/primitives'
import { InlineCreate } from '@/components/lumen/InlineCreate'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

export function LogementDetailPage({ logement, objets, onBack, onOpenPiece, onCreatePiece }) {
  const { t } = useTranslation('logements')

  if (!logement) {
    return (
      <div className="flex flex-1 flex-col">
        <ScreenHeader title={t('detail.notFoundTitle')} onBack={onBack} />
      </div>
    )
  }

  const pieces = logement.pieces ?? []

  function countObjets(pieceId) {
    return objets.filter((o) => o.piece?.id === pieceId).length
  }

  return (
    <div className="flex flex-1 flex-col pb-24 md:pb-10">
      <ScreenHeader title={logement.nom} subtitle={t('detail.pieceCount', { count: pieces.length })} onBack={onBack} />

      <div className="space-y-3 px-6 py-5 md:px-10">
        {pieces.length === 0 && <EmptyState>{t('detail.emptyNoPieces')}</EmptyState>}

        {pieces.map((p) => (
          <Row
            key={p.id}
            onClick={() => onOpenPiece(p.id)}
            lead={<IconTile icon={MapPin} size={48} />}
            title={p.nom}
            subtitle={t('detail.objetCount', { count: countObjets(p.id) })}
            trailing={<span className="text-sm text-muted-foreground">›</span>}
          />
        ))}

        <InlineCreate label={t('detail.addPiece.label')} placeholder={t('detail.addPiece.placeholder')} onCreate={onCreatePiece} />
      </div>
    </div>
  )
}
