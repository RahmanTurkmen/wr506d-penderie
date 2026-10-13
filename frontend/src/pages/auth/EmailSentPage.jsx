import { ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { PillButton } from '@/components/auth/PillButton'

export function EmailSentPage({ email, onNavigate }) {
  return (
    <>
      <AuthHeader
        icon={CheckCircle2}
        title="Vérifie ta boîte mail"
        subtitle={`On vient d'envoyer un lien à ${email || 'ton adresse'}. Il est valable 30 minutes.`}
      />
      <div className="space-y-3">
        <PillButton variant="outline" icon={RefreshCw} onClick={() => onNavigate('forgot')}>
          Renvoyer le lien
        </PillButton>
        <PillButton variant="ghost" icon={ArrowLeft} onClick={() => onNavigate('login')}>
          Retour à la connexion
        </PillButton>
      </div>
    </>
  )
}
