import { useState } from 'react'
import { Lock, Mail, ShieldCheck, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { FieldInput } from '@/components/auth/FieldInput'
import { PillButton } from '@/components/auth/PillButton'
import { register } from '@/lib/api'

export function RegisterPage({ onRegistered, onNavigate }) {
  const { t } = useTranslation('auth')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { ok, data } = await register(email, password, nom)
    setLoading(false)
    if (ok) {
      onRegistered(email)
    } else {
      setError(data.error ?? t('register.defaultError'))
    }
  }

  return (
    <>
      <AuthHeader title={t('register.title')} subtitle={t('register.subtitle')} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <FieldInput
          label={t('register.nameLabel')}
          icon={User}
          autoComplete="name"
          placeholder="rahman"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          data-cy="register-nom"
        />
        <FieldInput
          label={t('register.emailLabel')}
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="rahman@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          data-cy="register-email"
        />
        <FieldInput
          label={t('register.passwordLabel')}
          icon={Lock}
          type="password"
          autoComplete="new-password"
          placeholder={t('register.passwordHint')}
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          data-cy="register-password"
        />
        <div className="flex items-start gap-2.5 rounded-[14px] bg-secondary px-3.5 py-3 text-xs font-medium text-primary">
          <ShieldCheck className="mt-0.5 h-[18px] w-[18px] shrink-0" />
          {t('register.privacyNotice')}
        </div>
        {error && (
          <p className="text-sm text-destructive" data-cy="register-error">
            {error}
          </p>
        )}
        <PillButton type="submit" loading={loading} data-cy="register-submit">
          {t('register.submit')}
        </PillButton>
      </form>
      <p className="mt-7 text-center text-sm text-muted-foreground">
        {t('register.haveAccount')}{' '}
        <button type="button" onClick={() => onNavigate('login')} className="font-semibold text-primary">
          {t('register.login')}
        </button>
      </p>
    </>
  )
}
