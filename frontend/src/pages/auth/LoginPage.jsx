import { useState } from 'react'
import { Lock, Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { FieldInput } from '@/components/auth/FieldInput'
import { PillButton } from '@/components/auth/PillButton'
import { login } from '@/lib/api'

export function LoginPage({ onLogin, onNavigate }) {
  const { t } = useTranslation('auth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { ok, data } = await login(email, password)
    setLoading(false)
    if (ok && data.token) {
      onLogin(data.token)
    } else {
      setError(data.error ?? data.message ?? t('login.defaultError'))
    }
  }

  return (
    <>
      <AuthHeader title={t('login.title')} subtitle={t('login.subtitle')} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <FieldInput
          label={t('login.emailLabel')}
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="rahman@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          data-cy="login-email"
        />
        <FieldInput
          label={t('login.passwordLabel')}
          icon={Lock}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          data-cy="login-password"
        />
        <button
          type="button"
          onClick={() => onNavigate('forgot')}
          className="block w-full text-right text-sm font-semibold text-primary"
        >
          {t('login.forgotPassword')}
        </button>
        {error && (
          <p className="text-sm text-destructive" data-cy="login-error">
            {error}
          </p>
        )}
        <PillButton type="submit" loading={loading} data-cy="login-submit">
          {t('login.submit')}
        </PillButton>
      </form>
      <p className="mt-7 text-center text-sm text-muted-foreground">
        {t('login.noAccount')}{' '}
        <button type="button" onClick={() => onNavigate('register')} className="font-semibold text-primary">
          {t('login.createAccount')}
        </button>
      </p>
    </>
  )
}
