import { AlertCircle, Building2 } from 'lucide-react'
import { EmptyState, IconTile, Row, Skeleton } from '@/components/lumen/primitives'
import { InlineCreate } from '@/components/lumen/InlineCreate'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

export function LogementsListPage({ logements, objets, loading, error, onOpenLogement, onCreateLogement }) {
  const totalPieces = logements.reduce((sum, l) => sum + (l.pieces?.length ?? 0), 0)

  // Note : l'API ne renvoie pas le pieceId parent d'un conteneur sur un
  // objet, donc ce compteur ne voit que les objets rangés directement dans
  // une pièce (pas ceux dans un rangement à l'intérieur) — sous-estimation
  // mineure assumée plutôt que d'afficher un chiffre faux.
  function countObjets(logement) {
    const pieceIds = new Set((logement.pieces ?? []).map((p) => p.id))
    return objets.filter((o) => o.piece && pieceIds.has(o.piece.id)).length
  }

  return (
    <div className="flex flex-1 flex-col pb-24 md:pb-10">
      <ScreenHeader
        title="Logements"
        subtitle={loading ? '…' : `${logements.length} logement${logements.length > 1 ? 's' : ''} · ${totalPieces} pièce${totalPieces > 1 ? 's' : ''}`}
      />

      <div className="space-y-3 px-6 py-5 md:px-10">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3.5 rounded-2xl bg-card px-3.5 py-3">
                <Skeleton className="h-12 w-12 shrink-0 rounded-[14px]" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-[18px] w-[18px] shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && logements.length === 0 && (
          <EmptyState>Aucun logement pour le moment — ajoute ta maison, ton appartement...</EmptyState>
        )}

        {!loading &&
          !error &&
          logements.map((l) => (
            <Row
              key={l.id}
              onClick={() => onOpenLogement(l.id)}
              lead={<IconTile icon={Building2} size={48} />}
              title={l.nom}
              subtitle={`${(l.pieces ?? []).length} pièce${(l.pieces ?? []).length > 1 ? 's' : ''} · ${countObjets(l)} objet${countObjets(l) > 1 ? 's' : ''}`}
              trailing={<span className="text-sm text-muted-foreground">›</span>}
            />
          ))}

        {!loading && !error && (
          <InlineCreate label="Ajouter un logement" placeholder="Maison, appartement…" onCreate={onCreateLogement} />
        )}
      </div>
    </div>
  )
}
