import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Bell,
  BookOpen,
  Boxes,
  ChevronDown,
  Disc3,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  ScanLine,
  Search,
  Shirt,
  ShoppingBag,
  Sun,
  Users,
} from 'lucide-react'
import { Badge, EmptyState, IconButton, IconTile, Row, SectionHeader } from '@/components/lumen/primitives'
import { ProfilMenu } from '@/components/shell/ProfilMenu'
import { listObjets, listPrets, photoUrl } from '@/lib/api'

const TYPE_ICON = { vetement: Shirt, livre: BookOpen, vinyle: Disc3, autre: Package }

function StatCard({ value, label, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3.5">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-primary">{value}</span>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  )
}

function QuickAction({ icon: Icon, label, primary, onClick, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={disabled ? 'Bientôt disponible' : undefined}
      className={`flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-opacity ${
        disabled ? 'cursor-not-allowed opacity-60' : ''
      } ${primary ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'}`}
    >
      <Icon className="h-[15px] w-[15px]" />
      {label}
    </button>
  )
}

export function HomePage({ token, profils, activeProfil, onSwitchProfil, onAddObjet, onOpenObjet }) {
  const [objets, setObjets] = useState(null)
  const [prets, setPrets] = useState({})
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setObjets(null)
    setError('')

    async function run() {
      const { ok, data } = await listObjets(token, activeProfil?.id)
      if (cancelled) return
      if (!ok) {
        setError(data?.error ?? 'Impossible de charger tes objets.')
        setObjets([])
        return
      }
      setObjets(data ?? [])

      const enCours = (data ?? []).filter((o) => o.statut === 'prete').slice(0, 3)
      const now = Date.now()
      const entries = await Promise.all(
        enCours.map(async (o) => {
          const res = await listPrets(token, activeProfil?.id, o.id)
          const actif = res.ok ? (res.data ?? []).find((p) => p.actif) : null
          const late = Boolean(actif?.dateFinPrevue) && new Date(actif.dateFinPrevue).getTime() < now
          return [o.id, actif ? { ...actif, late } : null]
        }),
      )
      if (!cancelled) setPrets(Object.fromEntries(entries))
    }

    if (token && activeProfil?.id) run()
    return () => {
      cancelled = true
    }
  }, [token, activeProfil?.id])

  const loading = objets === null
  const list = objets ?? []
  const enCours = list.filter((o) => o.statut === 'prete')
  const enVente = list.filter((o) => o.statut === 'en_vente')
  const recents = [...list].slice(-4).reverse()

  return (
    <div className="flex flex-1 flex-col">
      {/* En-tête mobile */}
      <header className="relative rounded-b-[28px] bg-primary px-6 pb-6 pt-8 text-primary-foreground md:hidden">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={() => setMenuOpen((v) => !v)} className="min-w-0 text-left">
            <span className="flex items-center gap-1">
              <h1 className="truncate text-2xl font-bold">Bonjour {activeProfil?.nom ?? '...'}</h1>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
            </span>
            <p className="mt-0.5 text-sm text-secondary">Voici l'état de ton foyer</p>
          </button>
          <div className="flex shrink-0 gap-2">
            <IconButton icon={Search} variant="solid-light" disabled title="Bientôt disponible" />
            <IconButton icon={Bell} variant="solid-light" disabled title="Bientôt disponible" />
          </div>
        </div>
        {menuOpen && (
          <ProfilMenu profils={profils} activeId={activeProfil?.id} onSwitch={onSwitchProfil} onClose={() => setMenuOpen(false)} />
        )}
      </header>

      {/* En-tête desktop */}
      <header className="relative hidden items-center justify-between px-10 pb-2 pt-9 md:flex">
        <div>
          <h1 className="text-[28px] font-bold text-foreground">Bonjour {activeProfil?.nom ?? '...'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Voici l'état de ton foyer</p>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3.5 text-sm font-semibold text-foreground hover:bg-muted"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary">
            <Users className="h-4 w-4" />
          </span>
          {activeProfil?.nom ?? '...'}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
        {menuOpen && (
          <ProfilMenu
            profils={profils}
            activeId={activeProfil?.id}
            onSwitch={onSwitchProfil}
            onClose={() => setMenuOpen(false)}
            align="right"
          />
        )}
      </header>

      <div className="flex-1 space-y-6 px-6 py-6 md:px-10">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement…
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-[18px] w-[18px] shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <StatCard value={list.length} label="Objets" icon={Boxes} />
              <StatCard value={enCours.length} label="Prêts en cours" icon={RefreshCw} />
              <StatCard value={enVente.length} label="En vente" icon={ShoppingBag} />
            </div>

            <div className="-mx-6 flex gap-2.5 overflow-x-auto px-6 md:mx-0 md:px-0">
              <QuickAction icon={Plus} label="Ajouter" primary onClick={onAddObjet} />
              <QuickAction icon={ScanLine} label="Scanner" disabled />
              <QuickAction icon={Sun} label="Tenue" disabled />
            </div>

            <section className="space-y-2.5">
              <SectionHeader title="Prêts à suivre" />
              {enCours.length === 0 && <EmptyState>Aucun objet prêté pour le moment.</EmptyState>}
              {enCours.slice(0, 3).map((o) => {
                const pret = prets[o.id]
                const retour = pret?.dateFinPrevue
                return (
                  <Row
                    key={o.id}
                    onClick={onOpenObjet ? () => onOpenObjet(o.id) : undefined}
                    lead={<IconTile icon={RefreshCw} photoSrc={photoUrl(o.photo)} />}
                    title={o.nom}
                    subtitle={
                      pret
                        ? `Prêté à ${pret.emprunteurNom}${retour ? ` · retour le ${new Date(retour).toLocaleDateString('fr-FR')}` : ''}`
                        : 'Prêté'
                    }
                    trailing={<Badge tone={pret?.late ? 'solid' : 'pink'}>{pret?.late ? 'En retard' : 'En cours'}</Badge>}
                  />
                )
              })}
            </section>

            <section className="space-y-2.5">
              <SectionHeader title="Récemment ajoutés" />
              {recents.length === 0 && <EmptyState>Aucun objet pour le moment — ajoute ton premier objet.</EmptyState>}
              {recents.map((o) => (
                <Row
                  key={o.id}
                  onClick={onOpenObjet ? () => onOpenObjet(o.id) : undefined}
                  lead={<IconTile icon={TYPE_ICON[o.type] ?? Package} photoSrc={photoUrl(o.photo)} />}
                  title={o.nom}
                  subtitle={[o.categorie?.nom, o.piece?.nom ?? o.conteneur?.nom].filter(Boolean).join(' · ')}
                />
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
