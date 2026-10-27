import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { EmptyState } from '@/components/lumen/primitives'
import { PickOrCreate } from '@/components/inventory/PickOrCreate'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

export function NewPretPage({ objetsDisponibles, onCancel, onSubmit }) {
  const [objetId, setObjetId] = useState(null)
  const [emprunteurNom, setEmprunteurNom] = useState('')
  const [dateFinPrevue, setDateFinPrevue] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!objetId || !emprunteurNom.trim()) return
    setSaving(true)
    setError('')
    const ok = await onSubmit(objetId, emprunteurNom.trim(), dateFinPrevue || undefined)
    setSaving(false)
    if (!ok) setError("Impossible de créer le prêt.")
  }

  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader title="Nouveau prêt" subtitle="Prêter un objet à un ami" onBack={onCancel} close />

      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-xl space-y-5 px-6 py-5 md:px-10">
        {error && <p className="rounded-2xl bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}

        {objetsDisponibles.length === 0 ? (
          <EmptyState>Aucun objet disponible à prêter pour le moment.</EmptyState>
        ) : (
          <PickOrCreate
            label="Objet"
            items={objetsDisponibles}
            valueId={objetId}
            onChange={setObjetId}
            allowCreate={false}
            data-cy="pret-objet-picker"
          />
        )}

        <label className="block space-y-1.5 text-left">
          <span className="text-sm font-medium text-foreground">Prêté à</span>
          <input
            value={emprunteurNom}
            onChange={(e) => setEmprunteurNom(e.target.value)}
            placeholder="Nom de l'emprunteur"
            data-cy="pret-emprunteur"
            className="h-[52px] w-full rounded-[14px] border border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary"
          />
        </label>

        <label className="block space-y-1.5 text-left">
          <span className="text-sm font-medium text-foreground">Date de retour (facultatif)</span>
          <input
            type="date"
            value={dateFinPrevue}
            onChange={(e) => setDateFinPrevue(e.target.value)}
            className="h-[52px] w-full rounded-[14px] border border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary"
          />
        </label>

        <div className="flex gap-2.5 pt-1">
          <button type="button" onClick={onCancel} className="h-[52px] flex-1 rounded-full border border-border text-[15px] font-semibold text-foreground">
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving || !objetId || !emprunteurNom.trim()}
            data-cy="pret-preter"
            className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Check className="h-[18px] w-[18px]" />}
            Prêter
          </button>
        </div>
      </form>
    </div>
  )
}
