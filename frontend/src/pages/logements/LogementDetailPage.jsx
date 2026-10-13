import { MapPin } from 'lucide-react'
import { EmptyState, IconTile, Row } from '@/components/lumen/primitives'
import { InlineCreate } from '@/components/lumen/InlineCreate'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

export function LogementDetailPage({ logement, objets, onBack, onOpenPiece, onCreatePiece }) {
  if (!logement) {
    return (
      <div className="flex flex-1 flex-col">
        <ScreenHeader title="Logement introuvable" onBack={onBack} />
      </div>
    )
  }

  const pieces = logement.pieces ?? []

  function countObjets(pieceId) {
    return objets.filter((o) => o.piece?.id === pieceId).length
  }

  return (
    <div className="flex flex-1 flex-col pb-24 md:pb-10">
      <ScreenHeader title={logement.nom} subtitle={`${pieces.length} pièce${pieces.length > 1 ? 's' : ''}`} onBack={onBack} />

      <div className="space-y-3 px-6 py-5 md:px-10">
        {pieces.length === 0 && <EmptyState>Aucune pièce pour le moment — ajoute ta première pièce.</EmptyState>}

        {pieces.map((p) => (
          <Row
            key={p.id}
            onClick={() => onOpenPiece(p.id)}
            lead={<IconTile icon={MapPin} size={48} />}
            title={p.nom}
            subtitle={`${countObjets(p.id)} objet${countObjets(p.id) > 1 ? 's' : ''}`}
            trailing={<span className="text-sm text-muted-foreground">›</span>}
          />
        ))}

        <InlineCreate label="Ajouter une pièce" placeholder="Chambre, cuisine, cave…" onCreate={onCreatePiece} />
      </div>
    </div>
  )
}
