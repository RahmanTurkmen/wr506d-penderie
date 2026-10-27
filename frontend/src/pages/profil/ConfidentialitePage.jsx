import { useState } from 'react'
import { Check, Loader2, Lock, X } from 'lucide-react'
import { EmptyState, IconTile, Row } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

export function ConfidentialitePage({ blocages, loading, onBack, onBlock, onUnblock }) {
  const [adding, setAdding] = useState(false)
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setSaving(true)
    setError('')
    const ok = await onBlock(email.trim())
    setSaving(false)
    if (ok) {
      setEmail('')
      setAdding(false)
    } else {
      setError('Impossible de bloquer cet utilisateur (email inconnu ou déjà bloqué).')
    }
  }

  async function handleUnblock(id) {
    setBusyId(id)
    await onUnblock(id)
    setBusyId(null)
  }

  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader title="Confidentialité" subtitle="Utilisateurs bloqués" onBack={onBack} />

      <div className="space-y-4 px-6 py-5 md:px-10">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement…
          </div>
        )}

        {!loading && blocages.length === 0 && <EmptyState>Aucun utilisateur bloqué.</EmptyState>}

        {!loading &&
          blocages.map((b) => (
            <Row
              key={b.id}
              lead={<IconTile icon={Lock} size={44} />}
              title={b.userEmail}
              subtitle="Bloqué"
              trailing={
                <button
                  type="button"
                  disabled={busyId === b.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUnblock(b.id)
                  }}
                  className="flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground disabled:opacity-50"
                >
                  {busyId === b.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                  Débloquer
                </button>
              }
            />
          ))}

        {!loading && !adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-3.5 text-sm font-semibold text-primary"
          >
            + Bloquer un utilisateur
          </button>
        )}

        {adding && (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="rounded-2xl bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemple.com"
                className="h-12 min-w-0 flex-1 rounded-[14px] border border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={saving || !email.trim()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
