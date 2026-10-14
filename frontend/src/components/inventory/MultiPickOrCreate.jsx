import { useState } from 'react'
import { Check, Loader2, Plus } from 'lucide-react'
import { Chip } from '@/components/lumen/primitives'

// Même principe que PickOrCreate, mais plusieurs éléments peuvent être
// sélectionnés en même temps (les tags d'un objet).
export function MultiPickOrCreate({ label, items, valueIds, onToggle, onCreate, placeholder = 'Nouveau tag' }) {
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  async function submitCreate(e) {
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

  return (
    <div className="space-y-2 text-left">
      {label && <span className="block text-sm font-medium text-foreground">{label}</span>}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Chip key={item.id} active={valueIds.includes(item.id)} onClick={() => onToggle(item.id)}>
            {item.nom}
          </Chip>
        ))}
        {!creating && (
          <Chip onClick={() => setCreating(true)} icon={Plus}>
            Nouveau
          </Chip>
        )}
      </div>
      {creating && (
        <form onSubmit={submitCreate} className="flex items-center gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            className="h-10 min-w-0 flex-1 rounded-[14px] border border-border bg-card px-3.5 text-sm text-foreground outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={saving || !draft.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </button>
        </form>
      )}
    </div>
  )
}
