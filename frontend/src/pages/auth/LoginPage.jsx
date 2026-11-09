import { useState } from 'react'
import { Lock, Mail } from 'lucide-react'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { FieldInput } from '@/components/auth/FieldInput'
import { PillButton } from '@/components/auth/PillButton'
import { login } from '@/lib/api'

export function LoginPage({ onLogin, onNavigate }) {
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
      setError(data.error ?? data.message ?? 'Email ou mot de passe incorrect.')
    }
  }

  return (
    <>
      <AuthHeader title="Connexion" subtitle="Range, retrouve, prête. Entre amis." />
      <form onSubmit={handleSubmit} className="space-y-4">
        <FieldInput
          label="Adresse e-mail"
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
          label="Mot de passe"
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
          Mot de passe oublié ?
        </button>
        {error && (
          <p className="text-sm text-destructive" data-cy="login-error">
            {error}
          </p>
        )}
        <PillButton type="submit" loading={loading} data-cy="login-submit">
          Se connecter
        </PillButton>
      </form>
      <p className="mt-7 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{' '}
        <button type="button" onClick={() => onNavigate('register')} className="font-semibold text-primary">
          Créer un compte
        </button>
      </p>
    </>
  )
}
