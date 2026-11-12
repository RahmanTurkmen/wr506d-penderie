import { useState } from 'react'
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  CreditCard,
  Lock,
  Mail,
  MapPin,
  Tag,
  Truck,
  Users,
  Wrench,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Row } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

// Écran statique (Figma 11 — PAIEMENT & LIVRAISON). Parcours d'achat complet
// en 4 étapes, à la manière de l'assistant d'ajout d'objet (AddObjetPage).
// Aucune entité Paiement/Livraison n'existe côté backend : rien n'est
// envoyé à l'API, c'est une maquette interactive.
const TOTAL_STEPS = 3 // les étapes 2-4 affichent la barre de progression (1 à 3) ; l'étape 1 (offre) n'en a pas

const OBJET_NOM = 'Veste Zara'
const VENDEUR_NOM = 'Tom'
const PRIX = '45,00 €'
const FRAIS_PORT = '0,00 €'
const COLISSIMO_PRIX = '6,90 €'

export function AchatObjetPage({ onBack }) {
  const { t } = useTranslation('achat')
  const [step, setStep] = useState(1)
  const [message, setMessage] = useState('')
  const [remise, setRemise] = useState('main-propre')
  const [lieu, setLieu] = useState('Gare Part-Dieu, Lyon')
  const [date, setDate] = useState('Mardi 17 octobre · 15 h')
  const [paiement, setPaiement] = useState('carte')
  const [carte, setCarte] = useState('4242 4242 4242 4242')

  const REMISES = [
    { id: 'main-propre', icon: Users, label: t('delivery.inPerson.label'), sousTitre: t('delivery.inPerson.subtitle', { seller: VENDEUR_NOM }) },
    { id: 'colissimo', icon: Truck, label: t('delivery.colissimo.label'), sousTitre: t('delivery.colissimo.subtitle', { price: COLISSIMO_PRIX }) },
  ]

  const PAIEMENTS = [
    { id: 'carte', icon: CreditCard, label: t('payment.card.label'), sousTitre: t('payment.card.subtitle') },
    { id: 'sur-place', icon: Users, label: t('payment.inPerson.label'), sousTitre: t('payment.inPerson.subtitle') },
  ]

  const STEP_HEADER = {
    1: { title: t('header.buy.title'), subtitle: t('header.buy.subtitle', { object: OBJET_NOM, seller: VENDEUR_NOM }) },
    2: { title: t('header.delivery.title'), subtitle: t('header.delivery.subtitle') },
    3: { title: t('header.payment.title'), subtitle: t('header.payment.subtitle', { amount: PRIX }) },
    4: { title: t('header.confirmed.title'), subtitle: t('header.confirmed.subtitle') },
  }

  return (
    <div className="flex flex-1 flex-col pb-28 md:pb-10">
      <ScreenHeader
        title={STEP_HEADER[step].title}
        subtitle={STEP_HEADER[step].subtitle}
        onBack={step === 1 ? onBack : () => setStep(step - 1)}
        close={step === 1}
        step={step > 1 ? [step - 1, TOTAL_STEPS] : undefined}
      />

      <div className="mx-auto w-full max-w-xl space-y-5 px-6 py-5 md:px-10">
        {step === 1 && (
          <>
            <div className="flex h-[140px] items-center justify-center rounded-2xl bg-secondary">
              <Wrench className="h-[59px] w-[59px] text-primary" />
            </div>
            <div className="space-y-2 rounded-2xl bg-card p-4">
              <div className="flex justify-between text-sm text-foreground">
                <span>{t('order.price')}</span>
                <span>{PRIX}</span>
              </div>
              <div className="flex justify-between text-sm text-foreground">
                <span>{t('order.shippingFee')}</span>
                <span>{FRAIS_PORT}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
                <span>{t('order.total')}</span>
                <span>{PRIX}</span>
              </div>
            </div>
            <label className="block space-y-1.5 text-left">
              <span className="text-sm font-medium text-foreground">{t('order.messageLabel')}</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('order.messagePlaceholder')}
                rows={3}
                className="w-full resize-none rounded-[14px] border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
          </>
        )}

        {step === 2 && (
          <>
            {REMISES.map((r) => (
              <Row
                key={r.id}
                lead={<r.icon className="h-5 w-5 text-primary" />}
                title={r.label}
                subtitle={r.sousTitre}
                trailing={
                  remise === r.id ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )
                }
                onClick={() => setRemise(r.id)}
              />
            ))}
            {remise === 'main-propre' && (
              <label className="block space-y-1.5 text-left">
                <span className="text-sm font-medium text-foreground">{t('delivery.locationLabel')}</span>
                <span className="flex h-12 items-center gap-2.5 rounded-[14px] border border-border bg-card px-4">
                  <MapPin className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
                  <input
                    value={lieu}
                    onChange={(e) => setLieu(e.target.value)}
                    className="h-full w-full min-w-0 bg-transparent text-sm text-foreground outline-none"
                  />
                </span>
              </label>
            )}
            <label className="block space-y-1.5 text-left">
              <span className="text-sm font-medium text-foreground">{t('delivery.dateLabel')}</span>
              <span className="flex h-12 items-center gap-2.5 rounded-[14px] border border-border bg-card px-4">
                <Calendar className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-full w-full min-w-0 bg-transparent text-sm text-foreground outline-none"
                />
              </span>
            </label>
          </>
        )}

        {step === 3 && (
          <>
            {PAIEMENTS.map((p) => (
              <Row
                key={p.id}
                lead={<p.icon className="h-5 w-5 text-primary" />}
                title={p.label}
                subtitle={p.sousTitre}
                trailing={
                  paiement === p.id ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )
                }
                onClick={() => setPaiement(p.id)}
              />
            ))}
            {paiement === 'carte' && (
              <label className="block space-y-1.5 text-left">
                <span className="text-sm font-medium text-foreground">{t('payment.cardNumberLabel')}</span>
                <span className="flex h-12 items-center gap-2.5 rounded-[14px] border border-border bg-card px-4">
                  <CreditCard className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
                  <input
                    value={carte}
                    onChange={(e) => setCarte(e.target.value)}
                    className="h-full w-full min-w-0 bg-transparent text-sm text-foreground outline-none"
                  />
                </span>
              </label>
            )}
            <div className="flex items-start gap-2.5 rounded-2xl bg-secondary px-4 py-3 text-xs font-medium text-primary">
              <Lock className="mt-0.5 h-[18px] w-[18px] shrink-0" />
              {t('payment.secureNotice')}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
              <Check className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-3 rounded-2xl bg-card p-4">
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-[18px] w-[18px] text-muted-foreground" />
                <span className="flex-1 text-foreground">{t('confirmation.object')}</span>
                <span className="font-semibold text-foreground">{OBJET_NOM}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-[18px] w-[18px] text-muted-foreground" />
                <span className="flex-1 text-foreground">{t('confirmation.delivery')}</span>
                <span className="font-semibold text-foreground">{t('delivery.inPerson.label')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-[18px] w-[18px] text-muted-foreground" />
                <span className="flex-1 text-foreground">{t('confirmation.appointment')}</span>
                <span className="font-semibold text-foreground">Mar. 17 oct. · 15 h</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-[18px] w-[18px] text-muted-foreground" />
                <span className="flex-1 text-foreground">{t('confirmation.paid')}</span>
                <span className="font-semibold text-foreground">{PRIX}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-20 mx-auto flex w-full max-w-xl gap-2.5 bg-background/95 px-6 py-3 backdrop-blur">
        {step === 4 ? (
          <>
            <button
              type="button"
              className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full border border-border text-[15px] font-semibold text-foreground"
            >
              <Mail className="h-[18px] w-[18px]" />
              {t('actions.contact')}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="h-[52px] flex-1 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground"
            >
              {t('actions.backToSales')}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground"
          >
            {step === 3 ? t('actions.pay', { amount: '45 €' }) : t('actions.continue')}
            {step < 3 && <ChevronRight className="h-[18px] w-[18px]" />}
          </button>
        )}
      </div>
    </div>
  )
}
