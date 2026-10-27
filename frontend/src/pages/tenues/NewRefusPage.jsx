import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { Chip } from '@/components/lumen/primitives'
import { PickOrCreate } from '@/components/inventory/PickOrCreate'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

// RefusTenue cible exactement un Objet OU une Categorie, jamais les deux
// (invariant côté backend, cf. RefusTenue::validateCible) — l'écran ne
// propose donc qu'un choix exclusif entre les deux, pas un formulaire avec
// les deux à la fois.
export function NewRefusPage({ objets, categories, onCancel, onSubmit }) {
  const [mode, setMode] = useState('objet') // 'objet' | 'categorie'
  const [objetId, setObjetId] = useState(null)
  const [categorieId, setCategorieId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const valid = mode === 'objet' ? Boolean(objetId) : Boolean(categorieId)

  async function handleSubmit() {
    if (!valid) return
    setSaving(true)
    setError('')
    const ok = await onSubmit(mode === 'objet' ? { objetId } : { categorieId })
    setSaving(false)
    if (!ok) setError('Impossible d\'enregistrer ce refus.')
  }

  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader title="Pas cette tenue ?" subtitle="Exclure un objet ou toute une catégorie" onBack={onCancel} close />

      <div className="mx-auto w-full max-w-xl space-y-5 px-6 py-5 md:px-10">
        {error && <p className="rounded-2xl bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Chip active={mode === 'objet'} onClick={() => setMode('objet')}>
            Un objet précis
          </Chip>
          <Chip active={mode === 'categorie'} onClick={() => setMode('categorie')}>
            Toute une catégorie
          </Chip>
        </div>

        {mode === 'objet' ? (
          <PickOrCreate label="Objet" items={objets} valueId={objetId} onChange={setObjetId} allowCreate={false} />
        ) : (
          <PickOrCreate label="Catégorie" items={categories} valueId={categorieId} onChange={setCategorieId} allowCreate={false} />
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || !valid}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Check className="h-[18px] w-[18px]" />}
          Enregistrer
        </button>
      </div>
    </div>
  )
}
