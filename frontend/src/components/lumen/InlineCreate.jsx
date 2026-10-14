import { useState } from 'react'
import { Check, Loader2, Plus } from 'lucide-react'

// Bouton « + Ajouter un X » qui se transforme en champ texte pour créer
// l'élément à la volée (logement, pièce, rangement...).
export function InlineCreate({ label, placeholder, onCreate }) {
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!draft.trim()) return
    setSaving(true)
    const created = await onCreate(draft.trim())
    setSaving(false)
    if (created) {
      setDraft('')
      setCreating(false)
    }
  }

  if (!creating) {
    return (
      <button
        type="button"
        onClick={() => setCreating(true)}
        className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-3.5 text-sm font-semibold text-primary"
      >
        <Plus className="h-4 w-4" />
        {label}
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input
        autoFocus
        aria-label={label}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="h-12 min-w-0 flex-1 rounded-2xl border border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={saving || !draft.trim()}
        aria-label="Confirmer"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </button>
    </form>
  )
}
