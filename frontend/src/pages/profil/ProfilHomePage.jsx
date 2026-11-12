import { useEffect, useState } from 'react'
import {
  Bell,
  Bookmark,
  Boxes,
  Building2,
  CreditCard,
  Globe,
  Lock,
  LogOut,
  Newspaper,
  RefreshCw,
  Share2,
  Shield,
  ShieldCheck,
  ShoppingBag,
  UserPlus,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IconTile, Row, SectionHeader } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { setLocale } from '@/i18n'
import { getProfilStats } from '@/lib/api'

const LANGUAGE_NAMES = { fr: 'Français', en: 'English', ar: 'العربية' }

function StatTile({ value, label, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3.5">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-primary">{value}</span>
        <IconTile icon={Icon} size={32} tone={tone} />
      </div>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  )
}

export function ProfilHomePage({
  token,
  activeProfil,
  profilsCount,
  blocagesCount,
  loadingProfils,
  loadingBlocages,
  onOpenFoyer,
  onOpenConfidentialite,
  onOpenAmis,
  onOpenVentes,
  onOpenPartage,
  onOpenAchat,
  onOpenNotifications,
  onOpenCollections,
  onOpenFilActualite,
  onOpenAdmin,
  onLogout,
}) {
  const { t, i18n } = useTranslation('common')
  const { t: tp } = useTranslation('profil')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false
    setStats(null)
    if (token && activeProfil?.id) {
      getProfilStats(token, activeProfil.id).then(({ ok, data }) => {
        if (!cancelled && ok) setStats(data)
      })
    }
    return () => {
      cancelled = true
    }
  }, [token, activeProfil?.id])

  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader
        title={tp('home.title')}
        subtitle={
          activeProfil?.nom
            ? `${activeProfil.nom} · ${activeProfil.type === 'principal' ? tp('home.subtitleMainAccount') : tp('home.subtitleManagedProfile')}`
            : ''
        }
      />

      <div className="space-y-2.5 px-6 py-5 md:px-10">
        {stats && (
          <section className="space-y-2.5 pb-1.5">
            <SectionHeader title={tp('home.stats.title')} />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatTile value={stats.nbObjets} label={tp('home.stats.objets')} icon={Boxes} tone="pink" />
              <StatTile value={stats.nbLogements} label={tp('home.stats.logements')} icon={Building2} tone="sky" />
              <StatTile value={stats.nbPretsActifs} label={tp('home.stats.pretsActifs')} icon={RefreshCw} tone="amber" />
              <StatTile value={stats.nbEnVente} label={tp('home.stats.enVente')} icon={ShoppingBag} tone="violet" />
              <StatTile value={stats.nbVentesTerminees} label={tp('home.stats.ventesTerminees')} icon={CreditCard} tone="pink" />
              <StatTile value={stats.nbPartages} label={tp('home.stats.partages')} icon={Share2} tone="sky" />
              {stats.nbValidationsEnAttente > 0 && (
                <StatTile value={stats.nbValidationsEnAttente} label={tp('home.stats.validationsEnAttente')} icon={Shield} tone="amber" />
              )}
            </div>
          </section>
        )}

        <Row
          lead={<IconTile icon={Users} size={44} />}
          title={tp('home.rows.foyer.title')}
          subtitle={loadingProfils ? '…' : tp('home.rows.foyer.subtitle', { count: profilsCount })}
          onClick={onOpenFoyer}
        />
        <Row
          lead={<IconTile icon={Lock} size={44} />}
          title={tp('home.rows.confidentialite.title')}
          subtitle={loadingBlocages ? '…' : tp('home.rows.confidentialite.subtitle', { count: blocagesCount })}
          onClick={onOpenConfidentialite}
        />
        <Row lead={<IconTile icon={UserPlus} size={44} />} title={tp('home.rows.amis')} subtitle={tp('home.comingSoon')} onClick={onOpenAmis} />
        <Row lead={<IconTile icon={ShoppingBag} size={44} />} title={tp('home.rows.ventes')} subtitle={tp('home.comingSoon')} onClick={onOpenVentes} />
        <Row lead={<IconTile icon={Share2} size={44} />} title={tp('home.rows.partage')} subtitle={tp('home.comingSoon')} onClick={onOpenPartage} />
        <Row lead={<IconTile icon={CreditCard} size={44} />} title={tp('home.rows.achat')} subtitle={tp('home.comingSoon')} onClick={onOpenAchat} />
        <Row lead={<IconTile icon={Bell} size={44} />} title={tp('home.rows.notifications')} subtitle={tp('home.comingSoon')} onClick={onOpenNotifications} />
        <Row lead={<IconTile icon={Bookmark} size={44} />} title={tp('home.rows.collections')} subtitle={tp('home.comingSoon')} onClick={onOpenCollections} />
        <Row lead={<IconTile icon={Newspaper} size={44} />} title={tp('home.rows.filActualite')} subtitle={tp('home.comingSoon')} onClick={onOpenFilActualite} />
        <Row lead={<IconTile icon={ShieldCheck} size={44} />} title={tp('home.rows.admin')} subtitle={tp('home.comingSoon')} onClick={onOpenAdmin} />

        <div className="flex items-center gap-3.5 rounded-2xl bg-card px-3.5 py-3">
          <IconTile icon={Globe} size={44} />
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{t('language')}</p>
          <Select value={i18n.language} onValueChange={(value) => setLocale(value)}>
            <SelectTrigger className="h-9 w-32 rounded-full border-border bg-secondary text-sm font-semibold text-primary">
              <SelectValue>{(value) => LANGUAGE_NAMES[value] ?? value}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Row lead={<IconTile icon={LogOut} size={44} />} title={tp('home.logout')} onClick={onLogout} />
      </div>
    </div>
  )
}
