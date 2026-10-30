import { useState } from 'react'
import { Calendar, Check, Shield, UserPlus } from 'lucide-react'
import { Chip, IconTile, Toggle } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

// Écran statique (pas d'API Partage branchée ici — l'entité Partage existe
// côté backend mais ce flux de composition reprend juste le Figma
// 09 — PARTAGE PRIVÉ, 09.1). Objet de démo repris du Figma ("Veste Zara").
const AMIS = [
  { id: 'tom', nom: 'Tom' },
  { id: 'lilou', nom: 'Lilou' },
  { id: 'max', nom: 'Max' },
]

export function PartagerObjetPage({ onBack }) {
  const [visibilite, setVisibilite] = useState('amis-choisis') // 'moi' | 'amis-choisis' | 'tous'
  const [choisis, setChoisis] = useState({ tom: true, lilou: true, max: false })
  const [masquerEmplacement, setMasquerEmplacement] = useState(true)
  const [expire, setExpire] = useState('30 octobre 2026')

  function toggleAmi(id) {
    setChoisis((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader title="Partager" subtitle="Veste Zara" onBack={onBack} close />

      <div className="mx-auto w-full max-w-xl space-y-5 px-6 py-5 md:px-10">
        <div className="space-y-2">
          <span className="block text-sm font-medium text-foreground">Qui peut voir ?</span>
          <div className="flex flex-wrap gap-2">
            <Chip active={visibilite === 'moi'} onClick={() => setVisibilite('moi')}>
              Moi seul
            </Chip>
            <Chip active={visibilite === 'amis-choisis'} onClick={() => setVisibilite('amis-choisis')}>
              Amis choisis
            </Chip>
            <Chip active={visibilite === 'tous'} onClick={() => setVisibilite('tous')}>
              Tous mes amis
            </Chip>
          </div>
        </div>

        {visibilite === 'amis-choisis' && (
          <div className="space-y-2">
            {AMIS.map((a) => (
              <div key={a.id} className="flex items-center gap-3.5 rounded-2xl bg-card px-3.5 py-3">
                <IconTile icon={UserPlus} size={40} />
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{a.nom}</p>
                <Toggle checked={Boolean(choisis[a.id])} onChange={() => toggleAmi(a.id)} label={`Partager avec ${a.nom}`} />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3.5 rounded-2xl bg-card px-3.5 py-3">
          <IconTile icon={Shield} size={40} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">Masquer l'emplacement</p>
            <p className="truncate text-xs text-muted-foreground">Caché aux amis</p>
          </div>
          <Toggle checked={masquerEmplacement} onChange={setMasquerEmplacement} label="Masquer l'emplacement" />
        </div>

        <label className="block space-y-1.5 text-left">
          <span className="text-sm font-medium text-foreground">Expire le</span>
          <span className="flex h-12 items-center gap-2.5 rounded-[14px] border border-border bg-card px-4">
            <Calendar className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
            <input
              value={expire}
              onChange={(e) => setExpire(e.target.value)}
              className="h-full w-full min-w-0 bg-transparent text-sm text-foreground outline-none"
            />
          </span>
        </label>

        <div className="flex gap-2.5 pt-1">
          <button type="button" onClick={onBack} className="h-[52px] flex-1 rounded-full border border-border text-[15px] font-semibold text-foreground">
            Annuler
          </button>
          <button
            type="button"
            onClick={onBack}
            className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground"
          >
            <Check className="h-[18px] w-[18px]" />
            Partager
          </button>
        </div>
      </div>
    </div>
  )
}
