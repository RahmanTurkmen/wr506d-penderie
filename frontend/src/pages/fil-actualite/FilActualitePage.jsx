import { useState } from 'react'
import { Disc3, Heart, MessageCircle, Send, Wrench } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Chip } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'
import { PublicationDetailPage } from './PublicationDetailPage'

// Écran statique (pas d'entité "Publication"/"Fil d'actualité" côté
// backend) : données factices reprises telles quelles du Figma
// (16 — FIL D'ACTUALITÉ, 16.1). Les interactions (onglets, like) ne
// changent que l'état local, rien n'est persisté.
const PUBLICATIONS = [
  {
    id: 'tom-vente',
    type: 'ventes',
    auteur: 'Tom',
    avatar: 'L',
    quand: 'hours2',
    icon: Wrench,
    tone: 'sky',
    texte: 'Tom met en vente une Veste Zara · 45 €',
    likes: 12,
    commentairesCount: 3,
    commentaires: [
      { id: 1, auteur: 'Lilou', avatar: 'I', texte: 'Elle est compatible 18 V ?' },
      { id: 2, auteur: 'Tom', avatar: 'L', texte: 'Oui, 2 batteries fournies.' },
    ],
  },
  {
    id: 'lilou-collection',
    type: 'collections',
    auteur: 'Lilou',
    avatar: 'I',
    quand: 'yesterday',
    icon: Disc3,
    tone: 'violet',
    texte: 'Lilou a ajouté 6 vinyles à sa collection',
    likes: 12,
    commentairesCount: 3,
    commentaires: [],
  },
]

const FILTRE_IDS = ['tout', 'prets', 'ventes', 'collections']
const FILTRE_KEYS = { tout: 'all', prets: 'loans', ventes: 'sales', collections: 'collections' }

export function FilActualitePage({ onBack }) {
  const { t } = useTranslation('filActualite')
  const [filtre, setFiltre] = useState('tout')
  const [openId, setOpenId] = useState(null)
  const [likes, setLikes] = useState(() => Object.fromEntries(PUBLICATIONS.map((p) => [p.id, p.likes])))
  const [liked, setLiked] = useState({})

  function toggleLike(id) {
    setLiked((prev) => {
      const now = !prev[id]
      setLikes((l) => ({ ...l, [id]: l[id] + (now ? 1 : -1) }))
      return { ...prev, [id]: now }
    })
  }

  const ouverte = PUBLICATIONS.find((p) => p.id === openId)
  if (ouverte) {
    return <PublicationDetailPage publication={ouverte} likes={likes[ouverte.id]} onBack={() => setOpenId(null)} />
  }

  const visibles = filtre === 'tout' ? PUBLICATIONS : PUBLICATIONS.filter((p) => p.type === filtre)

  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader title={t('header.title')} subtitle={t('header.subtitle')} onBack={onBack} />

      <div className="space-y-4 px-6 py-5 md:px-10">
        <div className="flex gap-2 overflow-x-auto">
          {FILTRE_IDS.map((id) => (
            <Chip key={id} active={filtre === id} onClick={() => setFiltre(id)}>
              {t(`filters.${FILTRE_KEYS[id]}`)}
            </Chip>
          ))}
        </div>

        {visibles.length === 0 && (
          <p className="rounded-2xl bg-card px-4 py-5 text-center text-sm text-muted-foreground">{t('empty')}</p>
        )}

        {visibles.map((p) => (
          <article key={p.id} className="rounded-2xl bg-card p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                {p.avatar}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{p.auteur}</p>
                <p className="truncate text-xs text-muted-foreground">{t(`timeAgo.${p.quand}`)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpenId(p.id)}
              className={`mt-4 flex aspect-[295/110] w-full items-center justify-center rounded-2xl ${
                p.tone === 'violet' ? 'bg-violet-100 text-violet-700' : p.tone === 'amber' ? 'bg-amber-100 text-amber-700' : p.tone === 'sky' ? 'bg-sky-100 text-sky-700' : 'bg-secondary text-primary'
              }`}
            >
              <p.icon className="h-[50px] w-[50px]" />
            </button>
            <button type="button" onClick={() => setOpenId(p.id)} className="mt-3 block text-left text-sm text-foreground">
              {p.texte}
            </button>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <button type="button" onClick={() => toggleLike(p.id)} className={`flex items-center gap-1.5 ${liked[p.id] ? 'text-primary' : ''}`}>
                <Heart className={`h-[18px] w-[18px] ${liked[p.id] ? 'fill-current' : ''}`} />
                {likes[p.id]}
              </button>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="h-[18px] w-[18px]" />
                {p.commentairesCount}
              </span>
              <span className="flex items-center gap-1.5">
                <Send className="h-[18px] w-[18px]" />
                {t('share')}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
