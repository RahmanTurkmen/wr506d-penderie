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
import { Row } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'

// Écran statique (Figma 11 — PAIEMENT & LIVRAISON). Parcours d'achat complet
// en 4 étapes, à la manière de l'assistant d'ajout d'objet (AddObjetPage).
// Aucune entité Paiement/Livraison n'existe côté backend : rien n'est
// envoyé à l'API, c'est une maquette interactive.
const TOTAL_STEPS = 3 // les étapes 2-4 affichent la barre de progression (1 à 3) ; l'étape 1 (offre) n'en a pas

const REMISES = [
  { id: 'main-propre', icon: Users, label: 'Main propre', sousTitre: 'Rendez-vous avec Tom · gratuit' },
  { id: 'colissimo', icon: Truck, label: 'Colissimo', sousTitre: 'Livraison à domicile · 6,90 €' },
]

const PAIEMENTS = [
  { id: 'carte', icon: CreditCard, label: 'Carte bancaire', sousTitre: 'Visa •••• 4242' },
  { id: 'sur-place', icon: Users, label: 'Sur place', sousTitre: 'Payer en main propre' },
]

export function AchatObjetPage({ onBack }) {
  const [step, setStep] = useState(1)
  const [message, setMessage] = useState('')
  const [remise, setRemise] = useState('main-propre')
  const [lieu, setLieu] = useState('Gare Part-Dieu, Lyon')
  const [date, setDate] = useState('Mardi 17 octobre · 15 h')
  const [paiement, setPaiement] = useState('carte')
  const [carte, setCarte] = useState('4242 4242 4242 4242')

  const STEP_HEADER = {
    1: { title: 'Acheter', subtitle: 'Veste Zara · vendue par Tom' },
    2: { title: 'Remise', subtitle: "Comment récupérer l'objet ?" },
    3: { title: 'Paiement', subtitle: 'Total : 45,00 €' },
    4: { title: 'Commande confirmée', subtitle: 'Merci !' },
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
                <span>Prix</span>
                <span>45,00 €</span>
              </div>
              <div className="flex justify-between text-sm text-foreground">
                <span>Frais de port</span>
                <span>0,00 €</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
                <span>Total</span>
                <span>45,00 €</span>
              </div>
            </div>
            <label className="block space-y-1.5 text-left">
              <span className="text-sm font-medium text-foreground">Message au vendeur (facultatif)</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Bonjour, dispo mardi ?"
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
                <span className="text-sm font-medium text-foreground">Lieu de rendez-vous</span>
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
              <span className="text-sm font-medium text-foreground">Date</span>
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
                <span className="text-sm font-medium text-foreground">Numéro de carte</span>
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
              Paiement sécurisé. Le vendeur est payé à la remise de l'objet.
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
                <span className="flex-1 text-foreground">Objet</span>
                <span className="font-semibold text-foreground">Veste Zara</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-[18px] w-[18px] text-muted-foreground" />
                <span className="flex-1 text-foreground">Remise</span>
                <span className="font-semibold text-foreground">Main propre</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-[18px] w-[18px] text-muted-foreground" />
                <span className="flex-1 text-foreground">Rendez-vous</span>
                <span className="font-semibold text-foreground">Mar. 17 oct. · 15 h</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-[18px] w-[18px] text-muted-foreground" />
                <span className="flex-1 text-foreground">Payé</span>
                <span className="font-semibold text-foreground">45,00 €</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-20 mx-auto flex w-full max-w-xl gap-2.5 bg-background/95 px-6 py-3 backdrop-blur md:static md:mt-0 md:max-w-xl md:px-10 md:py-0">
        {step === 4 ? (
          <>
            <button
              type="button"
              className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full border border-border text-[15px] font-semibold text-foreground"
            >
              <Mail className="h-[18px] w-[18px]" />
              Contacter
            </button>
            <button
              type="button"
              onClick={onBack}
              className="h-[52px] flex-1 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground"
            >
              Retour aux ventes
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground"
          >
            {step === 3 ? 'Payer 45 €' : 'Continuer'}
            {step < 3 && <ChevronRight className="h-[18px] w-[18px]" />}
          </button>
        )}
      </div>
    </div>
  )
}
