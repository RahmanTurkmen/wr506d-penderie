import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { EmptyState } from '@/components/lumen/primitives'
import { MultiPickOrCreate } from '@/components/inventory/MultiPickOrCreate'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

export function NewTenuePage({ objets, onCancel, onSubmit }) {
  const [nom, setNom] = useState('')
  const [objetIds, setObjetIds] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function toggle(id) {
    setObjetIds((prev) => (prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nom.trim() || objetIds.length === 0) return
    setSaving(true)
    setError('')
    const ok = await onSubmit(nom.trim(), objetIds)
    setSaving(false)
    if (!ok) setError('Impossible de créer la tenue.')
  }

  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader title="Nouvelle tenue" subtitle="Choisis les objets qui la composent" onBack={onCancel} close />

      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-xl space-y-5 px-6 py-5 md:px-10">
        {error && <p className="rounded-2xl bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}

        <label className="block space-y-1.5 text-left">
          <span className="text-sm font-medium text-foreground">Nom</span>
          <input
            autoFocus
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Tenue du jour"
            data-cy="tenue-nom"
            className="h-[52px] w-full rounded-[14px] border border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary"
          />
        </label>

        {objets.length === 0 ? (
          <EmptyState>Aucun objet dans ton inventaire pour composer une tenue.</EmptyState>
        ) : (
          <MultiPickOrCreate label="Objets" items={objets} valueIds={objetIds} onToggle={toggle} allowCreate={false} />
        )}

        <button
          type="submit"
          disabled={saving || !nom.trim() || objetIds.length === 0}
          data-cy="tenue-creer"
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Check className="h-[18px] w-[18px]" />}
          Créer la tenue
        </button>
      </form>
    </div>
  )
}
