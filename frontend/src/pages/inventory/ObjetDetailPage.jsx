import { useState } from 'react'
import { BookOpen, Check, Clock, Disc3, Loader2, MapPin, Package, QrCode, RefreshCw, Shirt, ShoppingBag, Tag } from 'lucide-react'
import { Badge } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'
import { createPret, photoUrl, updateObjetStatut } from '@/lib/api'

const TYPE_ICON = { vetement: Shirt, livre: BookOpen, vinyle: Disc3, autre: Package }
const TYPE_LABEL = { vetement: 'Vêtement', livre: 'Livre', vinyle: 'Vinyle', autre: 'Autre' }
const STATUT_LABEL = { disponible: 'Disponible', prete: 'Prêté', en_vente: 'En vente' }
const STATUT_TONE = { disponible: 'pink', prete: 'gray', en_vente: 'solid' }

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Icon className="h-[18px] w-[18px] shrink-0 text-primary" />
      <span className="flex-1 text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}

export function ObjetDetailPage({ token, activeProfil, objet, onBack, onRefresh }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const [lending, setLending] = useState(false)
  const [emprunteurNom, setEmprunteurNom] = useState('')
  const [dateFinPrevue, setDateFinPrevue] = useState('')

  if (!objet) {
    return (
      <div className="flex flex-1 flex-col">
        <ScreenHeader title="Objet introuvable" onBack={onBack} />
        <p className="px-6 py-10 text-center text-sm text-muted-foreground">
          Cet objet n'existe plus ou a été supprimé.
        </p>
      </div>
    )
  }

  const Icon = TYPE_ICON[objet.type] ?? Package

  async function handleStatut(statut) {
    setBusy(true)
    setMessage(null)
    const res = await updateObjetStatut(token, activeProfil?.id, objet.id, statut)
    setBusy(false)
    if (res.status === 202) {
      setMessage({ tone: 'info', text: res.data?.message ?? 'Soumis au compte principal pour validation.' })
      return
    }
    if (!res.ok) {
      setMessage({ tone: 'error', text: res.data?.error ?? 'Action impossible.' })
      return
    }
    await onRefresh()
  }

  async function handleLend(e) {
    e.preventDefault()
    if (!emprunteurNom.trim()) return
    setBusy(true)
    setMessage(null)
    const res = await createPret(token, activeProfil?.id, objet.id, emprunteurNom.trim(), dateFinPrevue || undefined)
    setBusy(false)
    if (!res.ok) {
      setMessage({ tone: 'error', text: res.data?.error ?? 'Impossible de créer le prêt.' })
      return
    }
    setLending(false)
    setEmprunteurNom('')
    setDateFinPrevue('')
    await onRefresh()
  }

  return (
    <div className="flex flex-1 flex-col pb-28 md:pb-10">
      <ScreenHeader title={objet.nom} subtitle={[objet.categorie?.nom, objet.piece?.nom ?? objet.conteneur?.nom].filter(Boolean).join(' · ')} onBack={onBack} />

      <div className="mx-auto w-full max-w-xl space-y-5 px-6 py-5 md:px-10">
        {objet.photo ? (
          <img src={photoUrl(objet.photo)} alt={objet.nom} className="aspect-[16/10] w-full rounded-2xl object-cover" />
        ) : (
          <div className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl bg-secondary text-primary">
            <Icon className="h-16 w-16" />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge tone={STATUT_TONE[objet.statut]}>{STATUT_LABEL[objet.statut] ?? objet.statut}</Badge>
          <Badge tone="gray">{TYPE_LABEL[objet.type] ?? objet.type}</Badge>
          {objet.categorie && <Badge tone="gray">{objet.categorie.nom}</Badge>}
        </div>

        <div className="divide-y divide-border rounded-2xl bg-card px-4">
          <InfoRow icon={MapPin} label="Emplacement" value={objet.piece?.nom ?? objet.conteneur?.nom ?? '—'} />
          <InfoRow icon={QrCode} label="QR code" value={objet.qrCodeInterne} />
          {objet.tags?.length > 0 && <InfoRow icon={Tag} label="Tags" value={objet.tags.map((t) => t.nom).join(', ')} />}
        </div>

        {message && (
          <p
            className={`rounded-2xl px-4 py-3 text-sm ${
              message.tone === 'error' ? 'bg-destructive/5 text-destructive' : 'bg-secondary text-primary'
            }`}
          >
            {message.text}
          </p>
        )}

        {lending && (
          <form onSubmit={handleLend} className="space-y-3 rounded-2xl bg-card p-4">
            <p className="text-sm font-semibold text-foreground">Prêter cet objet</p>
            <input
              autoFocus
              value={emprunteurNom}
              onChange={(e) => setEmprunteurNom(e.target.value)}
              placeholder="Nom de l'emprunteur"
              className="h-11 w-full rounded-[14px] border border-border bg-background px-3.5 text-sm text-foreground outline-none focus:border-primary"
            />
            <input
              type="date"
              value={dateFinPrevue}
              onChange={(e) => setDateFinPrevue(e.target.value)}
              className="h-11 w-full rounded-[14px] border border-border bg-background px-3.5 text-sm text-foreground outline-none focus:border-primary"
            />
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setLending(false)}
                className="h-11 flex-1 rounded-full border border-border text-sm font-semibold text-foreground"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={busy || !emprunteurNom.trim()}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Confirmer
              </button>
            </div>
          </form>
        )}
      </div>

      {!lending && (
        <div className="fixed inset-x-0 bottom-20 mx-auto flex w-full max-w-xl gap-2.5 bg-background/95 px-6 py-3 backdrop-blur md:static md:mt-0 md:max-w-xl md:px-10 md:py-0">
          {objet.statut !== 'prete' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => setLending(true)}
              className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground disabled:opacity-60"
            >
              <RefreshCw className="h-[18px] w-[18px]" />
              Prêter
            </button>
          )}
          {objet.statut === 'prete' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => handleStatut('disponible')}
              className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Check className="h-[18px] w-[18px]" />}
              Marquer disponible
            </button>
          )}
          {objet.statut !== 'en_vente' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => handleStatut('en_vente')}
              className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card text-[15px] font-semibold text-foreground disabled:opacity-60"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              Vendre
            </button>
          )}
          {objet.statut === 'en_vente' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => handleStatut('disponible')}
              className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card text-[15px] font-semibold text-foreground disabled:opacity-60"
            >
              <Clock className="h-[18px] w-[18px]" />
              Retirer de la vente
            </button>
          )}
        </div>
      )}
    </div>
  )
}
