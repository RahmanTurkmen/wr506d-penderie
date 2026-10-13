import { Archive, BookOpen, Disc3, Package, Shirt } from 'lucide-react'
import { EmptyState, IconTile, Row, SectionHeader } from '@/components/lumen/primitives'
import { InlineCreate } from '@/components/lumen/InlineCreate'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'
import { photoUrl } from '@/lib/api'

const TYPE_ICON = { vetement: Shirt, livre: BookOpen, vinyle: Disc3, autre: Package }

export function PieceDetailPage({ piece, logementNom, objets, onBack, onCreateConteneur, onOpenObjet }) {
  if (!piece) {
    return (
      <div className="flex flex-1 flex-col">
        <ScreenHeader title="Pièce introuvable" onBack={onBack} />
      </div>
    )
  }

  const conteneurs = piece.conteneurs ?? []
  const objetsDansLaPiece = objets.filter((o) => o.piece?.id === piece.id)

  return (
    <div className="flex flex-1 flex-col pb-24 md:pb-10">
      <ScreenHeader title={piece.nom} subtitle={logementNom} onBack={onBack} />

      <div className="space-y-6 px-6 py-5 md:px-10">
        <section className="space-y-3">
          <SectionHeader title="Rangements" />
          {conteneurs.length === 0 && <EmptyState>Aucun rangement — étagère, armoire, tiroir…</EmptyState>}
          {conteneurs.map((c) => (
            <Row key={c.id} lead={<IconTile icon={Archive} size={44} />} title={c.nom} />
          ))}
          <InlineCreate label="Ajouter un rangement" placeholder="Étagère, armoire, tiroir…" onCreate={onCreateConteneur} />
        </section>

        <section className="space-y-3">
          <SectionHeader title="Objets rangés directement ici" />
          {objetsDansLaPiece.length === 0 && (
            <EmptyState>Aucun objet rangé directement dans cette pièce (ils peuvent être dans un rangement ci-dessus).</EmptyState>
          )}
          {objetsDansLaPiece.map((o) => (
            <Row
              key={o.id}
              onClick={onOpenObjet ? () => onOpenObjet(o.id) : undefined}
              lead={<IconTile icon={TYPE_ICON[o.type] ?? Package} size={44} photoSrc={photoUrl(o.photo)} />}
              title={o.nom}
              subtitle={o.categorie?.nom}
            />
          ))}
        </section>
      </div>
    </div>
  )
}
