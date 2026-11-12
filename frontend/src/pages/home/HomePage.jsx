import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertCircle,
  Bell,
  BookOpen,
  Boxes,
  ChevronDown,
  Disc3,
  Package,
  Plus,
  RefreshCw,
  ScanLine,
  Search,
  Shield,
  Shirt,
  ShoppingBag,
  Sun,
} from 'lucide-react'
import { Badge, EmptyState, IconButton, IconTile, Row, SectionHeader, Skeleton } from '@/components/lumen/primitives'
import { ProfilMenu } from '@/components/shell/ProfilMenu'
import { listObjets, listPrets, listValidations, photoUrl } from '@/lib/api'

const TYPE_ICON = { vetement: Shirt, livre: BookOpen, vinyle: Disc3, autre: Package }

function StatCard({ value, label, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3.5 transition-transform duration-150 active:scale-[0.98]">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-primary">{value}</span>
        <IconTile icon={Icon} size={32} tone={tone} />
      </div>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  )
}

function QuickAction({ icon: Icon, label, primary, onClick, disabled, 'data-cy': dataCy }) {
  const { t } = useTranslation('common')
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={disabled ? t('comingSoon') : undefined}
      data-cy={dataCy}
      className={`flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-all duration-150 ${
        disabled ? 'cursor-not-allowed opacity-60' : 'active:scale-95'
      } ${primary ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'}`}
    >
      <Icon className="h-[15px] w-[15px]" />
      {label}
    </button>
  )
}

export function HomePage({ token, profils, activeProfil, onSwitchProfil, onAddObjet, onOpenObjet, onOpenPrets, onOpenValidations, onLogout }) {
  const { t, i18n } = useTranslation('home')
  const i18nLocaleForDate = { fr: 'fr-FR', en: 'en-US', ar: 'ar' }[i18n.language] ?? 'fr-FR'
  const [objets, setObjets] = useState(null)
  const [prets, setPrets] = useState({})
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [validationsCount, setValidationsCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    setObjets(null)
    setError('')

    async function run() {
      const { ok, data } = await listObjets(token, activeProfil?.id)
      if (cancelled) return
      if (!ok) {
        setError(data?.error ?? t('errorLoading'))
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

  useEffect(() => {
    let cancelled = false
    if (token) {
      listValidations(token).then(({ ok, data }) => {
        if (!cancelled && ok) setValidationsCount((data ?? []).length)
      })
    }
    return () => {
      cancelled = true
    }
  }, [token])

  const loading = objets === null
  const list = objets ?? []
  const enCours = list.filter((o) => o.statut === 'prete')
  const enVente = list.filter((o) => o.statut === 'en_vente')
  const recents = [...list].slice(-4).reverse()

  return (
    <div className="flex flex-1 flex-col">
      <header className="relative rounded-b-[28px] bg-primary px-6 pb-6 pt-8 text-primary-foreground">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={() => setMenuOpen((v) => !v)} data-cy="profil-menu-toggle" className="min-w-0 text-left">
            <span className="flex items-center gap-1">
              <h1 className="truncate text-2xl font-bold">{t('greeting', { name: activeProfil?.nom ?? '...' })}</h1>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
            </span>
            <p className="mt-0.5 text-sm text-secondary">{t('subtitle')}</p>
          </button>
          <div className="flex shrink-0 gap-2">
            <IconButton icon={Search} variant="solid-light" disabled title="Bientôt disponible" />
            <IconButton icon={Bell} variant="solid-light" disabled title="Bientôt disponible" />
          </div>
        </div>
        {menuOpen && (
          <ProfilMenu profils={profils} activeId={activeProfil?.id} onSwitch={onSwitchProfil} onClose={() => setMenuOpen(false)} onLogout={onLogout} />
        )}
      </header>

      <div className="flex-1 space-y-6 px-6 py-6">
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-[78px]" />
              <Skeleton className="h-[78px]" />
              <Skeleton className="h-[78px]" />
            </div>
            <div className="space-y-2.5">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-[18px] w-[18px] shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && validationsCount > 0 && (
          <button
            type="button"
            onClick={onOpenValidations}
            data-cy="home-validations-banner"
            className="flex w-full items-start gap-2.5 rounded-2xl bg-secondary px-4 py-3 text-left text-xs font-medium text-primary"
          >
            <Shield className="mt-0.5 h-[18px] w-[18px] shrink-0" />
            <span>
              <span className="block text-sm font-semibold">{t('validationsBanner', { count: validationsCount })}</span>
              {t('validationsDetail')}
            </span>
          </button>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-3 gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <StatCard value={list.length} label={t('stats.objects')} icon={Boxes} tone="pink" />
              <StatCard value={enCours.length} label={t('stats.activeLoans')} icon={RefreshCw} tone="sky" />
              <StatCard value={enVente.length} label={t('stats.forSale')} icon={ShoppingBag} tone="amber" />
            </div>

            <div className="-mx-6 flex gap-2.5 overflow-x-auto px-6">
              <QuickAction icon={Plus} label={t('quickActions.add')} primary onClick={onAddObjet} data-cy="home-ajouter" />
              <QuickAction icon={ScanLine} label={t('quickActions.scan')} disabled />
              <QuickAction icon={Sun} label={t('quickActions.outfit')} disabled />
            </div>

            <section className="space-y-2.5">
              <SectionHeader
                title={t('loansSection.title')}
                action={
                  enCours.length > 0 && (
                    <button type="button" onClick={onOpenPrets} className="text-sm font-semibold text-primary">
                      {t('loansSection.seeAll')}
                    </button>
                  )
                }
              />
              {enCours.length === 0 && <EmptyState>{t('loansSection.empty')}</EmptyState>}
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
                        ? retour
                          ? t('loansSection.lentToWithReturn', {
                              name: pret.emprunteurNom,
                              date: new Date(retour).toLocaleDateString(i18nLocaleForDate),
                            })
                          : t('loansSection.lentTo', { name: pret.emprunteurNom })
                        : t('loansSection.lent')
                    }
                    trailing={
                      <Badge tone={pret?.late ? 'solid' : 'pink'}>{pret?.late ? t('loansSection.late') : t('loansSection.ongoing')}</Badge>
                    }
                  />
                )
              })}
            </section>

            <section className="space-y-2.5">
              <SectionHeader title={t('recentSection.title')} />
              {recents.length === 0 && <EmptyState>{t('recentSection.empty')}</EmptyState>}
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
