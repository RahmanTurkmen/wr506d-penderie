import { useState } from 'react'
import { Check, Loader2, Plus, Sparkles } from 'lucide-react'
import { Chip } from '@/components/lumen/primitives'

// Sélection simple (catégorie, logement, pièce...) parmi une liste existante,
// avec un bouton « + » qui permet d'en créer une nouvelle à la volée quand
// celle qu'on veut n'existe pas encore.
export function PickOrCreate({
  label,
  items,
  valueId,
  onChange,
  onCreate,
  placeholder = 'Nouveau nom',
  error,
  suggestion,
  allowCreate = true,
  'data-cy': dataCy,
}) {
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
    <div className="space-y-2 text-left" data-cy={dataCy}>
      {label && <span className="block text-sm font-medium text-foreground">{label}</span>}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Chip key={item.id} active={item.id === valueId} onClick={() => onChange(item.id)}>
            {item.nom}
          </Chip>
        ))}
        {allowCreate && !creating && (
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
      {suggestion && !valueId && !creating && (
        <button
          type="button"
          onClick={() => onCreate(suggestion)}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Suggestion de la photo : « {suggestion} » — utiliser
        </button>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
