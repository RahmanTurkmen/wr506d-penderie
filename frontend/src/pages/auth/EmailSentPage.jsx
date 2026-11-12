import { ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { PillButton } from '@/components/auth/PillButton'

export function EmailSentPage({ email, onNavigate }) {
  const { t } = useTranslation('auth')
  return (
    <>
      <AuthHeader
        icon={CheckCircle2}
        title={t('emailSent.title')}
        subtitle={t('emailSent.subtitle', { email: email || t('emailSent.fallbackAddress') })}
      />
      <div className="space-y-3">
        <PillButton variant="outline" icon={RefreshCw} onClick={() => onNavigate('forgot')}>
          {t('emailSent.resend')}
        </PillButton>
        <PillButton variant="ghost" icon={ArrowLeft} onClick={() => onNavigate('login')}>
          {t('emailSent.backToLogin')}
        </PillButton>
      </div>
    </>
  )
}
