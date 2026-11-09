import { Heart, MessageCircle, Send } from 'lucide-react'
import { Row } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

// Figma 16.2 — Détail d'une publication. Statique, voir FilActualitePage.jsx.
export function PublicationDetailPage({ publication, likes, onBack }) {
  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader title="Publication" subtitle={`${publication.auteur} · ${publication.quand}`} onBack={onBack} />

      <div className="space-y-5 px-6 py-5 md:px-10">
        <article className="rounded-2xl bg-card p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
              {publication.avatar}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{publication.auteur}</p>
              <p className="truncate text-xs text-muted-foreground">{publication.quand}</p>
            </div>
          </div>
          <div className="mt-4 flex aspect-[295/110] w-full items-center justify-center rounded-2xl bg-secondary text-primary">
            <publication.icon className="h-[50px] w-[50px]" />
          </div>
          <p className="mt-3 text-sm text-foreground">{publication.texte}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Heart className="h-[18px] w-[18px]" />
              {likes}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-[18px] w-[18px]" />
              {publication.commentaires.length}
            </span>
            <span className="flex items-center gap-1.5">
              <Send className="h-[18px] w-[18px]" />
              Partager
            </span>
          </div>
        </article>

        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-foreground">Commentaires</h2>
          {publication.commentaires.length === 0 ? (
            <p className="rounded-2xl bg-card px-4 py-5 text-center text-sm text-muted-foreground">Aucun commentaire pour le moment.</p>
          ) : (
            publication.commentaires.map((c) => (
              <Row
                key={c.id}
                lead={
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                    {c.avatar}
                  </span>
                }
                title={c.auteur}
                subtitle={c.texte}
              />
            ))
          )}
        </section>
      </div>

      <div className="px-6 pb-6 md:px-10">
        <button
          type="button"
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground"
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          Je suis intéressé
        </button>
      </div>
    </div>
  )
}
