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
import { ProfilMenu } from '@/components/shell/ProfilMenu'
import { listObjets, listPrets } from '@/lib/api'

const TYPE_ICON = { vetement: Shirt, livre: BookOpen, vinyle: Disc3, autre: Package }

function IconTile({ icon: Icon, className = '' }) {
  return (
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-secondary text-primary ${className}`}>
      <Icon className="h-5 w-5" />
    </span>
  )
}

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

function QuickAction({ icon: Icon, label, primary }) {
  return (
    <button
      type="button"
      disabled
      title="Bientôt disponible"
      className={`flex h-9 shrink-0 cursor-not-allowed items-center gap-2 rounded-full px-4 text-sm font-semibold opacity-60 ${
        primary ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'
      }`}
    >
      <Icon className="h-[15px] w-[15px]" />
      {label}
    </button>
  )
}

function Row({ lead, title, subtitle, trailing }) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl bg-card px-3.5 py-3">
      {lead}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {trailing}
    </div>
  )
}

function Badge({ children, tone = 'pink' }) {
  const toneClass = tone === 'solid' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClass}`}>{children}</span>
}

function IconButton({ icon: Icon, onClick, variant = 'ghost', ...props }) {
  const variantClass =
    variant === 'solid-light'
      ? 'bg-white/15 text-white hover:bg-white/25'
      : 'border border-border bg-card text-foreground hover:bg-muted'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${variantClass}`}
      {...props}
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  )
}

export function HomePage({ token, profils, activeProfil, onSwitchProfil }) {
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
              <QuickAction icon={Plus} label="Ajouter" primary />
              <QuickAction icon={ScanLine} label="Scanner" />
              <QuickAction icon={Sun} label="Tenue" />
            </div>

            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">Prêts à suivre</h2>
              </div>
              {enCours.length === 0 && (
                <p className="rounded-2xl bg-card px-4 py-5 text-center text-sm text-muted-foreground">
                  Aucun objet prêté pour le moment.
                </p>
              )}
              {enCours.slice(0, 3).map((o) => {
                const pret = prets[o.id]
                const retour = pret?.dateFinPrevue
                return (
                  <Row
                    key={o.id}
                    lead={<IconTile icon={RefreshCw} />}
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
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">Récemment ajoutés</h2>
              </div>
              {recents.length === 0 && (
                <p className="rounded-2xl bg-card px-4 py-5 text-center text-sm text-muted-foreground">
                  Aucun objet pour le moment — la création d'objet arrive dans une prochaine section.
                </p>
              )}
              {recents.map((o) => (
                <Row
                  key={o.id}
                  lead={<IconTile icon={TYPE_ICON[o.type] ?? Package} />}
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
