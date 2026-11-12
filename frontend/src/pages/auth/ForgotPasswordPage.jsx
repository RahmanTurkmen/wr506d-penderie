import { useState } from 'react'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { FieldInput } from '@/components/auth/FieldInput'
import { PillButton } from '@/components/auth/PillButton'

// NB : il n'existe pas encore d'endpoint backend de réinitialisation de mot
// de passe. Cet écran est pour l'instant une maquette fonctionnelle côté UI :
// il enchaîne simplement sur l'écran "E-mail envoyé".
export function ForgotPasswordPage({ onSent, onNavigate }) {
  const { t } = useTranslation('auth')
  const [email, setEmail] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSent(email)
  }

  return (
    <>
      <AuthHeader icon={Mail} title={t('forgot.title')} subtitle={t('forgot.subtitle')} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <FieldInput
          label={t('forgot.emailLabel')}
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="rahman@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PillButton type="submit" icon={Send}>
          {t('forgot.submit')}
        </PillButton>
        <PillButton type="button" variant="outline" icon={ArrowLeft} onClick={() => onNavigate('login')}>
          {t('forgot.backToLogin')}
        </PillButton>
      </form>
    </>
  )
}
