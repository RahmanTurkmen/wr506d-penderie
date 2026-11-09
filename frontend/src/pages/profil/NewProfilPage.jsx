import { useState } from 'react'
import { Check, Loader2, Shield, User } from 'lucide-react'
import { IconTile, Row, Toggle } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

// Pas de champ "âge" : le modèle de données (Profil) ne stocke que
// nom + estMineur, rien d'autre — on ne crée pas de champ fictif qui ne
// serait jamais sauvegardé.
export function NewProfilPage({ onCancel, onSubmit }) {
  const [nom, setNom] = useState('')
  const [estMineur, setEstMineur] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nom.trim()) return
    setSaving(true)
    setError('')
    const ok = await onSubmit(nom.trim(), estMineur)
    setSaving(false)
    if (!ok) setError('Impossible de créer ce profil.')
  }

  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader title="Nouveau profil" subtitle="Profil géré par toi" onBack={onCancel} close />

      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-xl space-y-5 px-6 py-5 md:px-10">
        {error && <p className="rounded-2xl bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}

        <label className="block space-y-1.5 text-left">
          <span className="text-sm font-medium text-foreground">Prénom</span>
          <span className="flex h-12 items-center gap-2.5 rounded-[14px] border border-border bg-card px-4">
            <User className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Eva"
              data-cy="profil-nom"
              className="h-full w-full min-w-0 bg-transparent text-sm text-foreground outline-none"
            />
          </span>
        </label>

        <Row
          lead={<IconTile icon={Shield} size={40} />}
          title="Profil enfant"
          subtitle="Validation parentale pour partager/vendre, prix masqués"
          trailing={<Toggle checked={estMineur} onChange={setEstMineur} label="Profil enfant" />}
        />

        <button
          type="submit"
          disabled={saving || !nom.trim()}
          data-cy="profil-creer"
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Check className="h-[18px] w-[18px]" />}
          Créer
        </button>
      </form>
    </div>
  )
}
