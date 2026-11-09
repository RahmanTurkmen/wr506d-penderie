import { useState } from 'react'
import { Lock, Mail, ShieldCheck, User } from 'lucide-react'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { FieldInput } from '@/components/auth/FieldInput'
import { PillButton } from '@/components/auth/PillButton'
import { register } from '@/lib/api'

export function RegisterPage({ onRegistered, onNavigate }) {
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
      setError(data.error ?? 'Impossible de créer le compte.')
    }
  }

  return (
    <>
      <AuthHeader title="Créer un compte" subtitle="Un compte principal, des profils pour toute la famille." />
      <form onSubmit={handleSubmit} className="space-y-4">
        <FieldInput
          label="Nom du profil"
          icon={User}
          autoComplete="name"
          placeholder="rahman"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          data-cy="register-nom"
        />
        <FieldInput
          label="Adresse e-mail"
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
          label="Mot de passe"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          placeholder="8 caractères minimum"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          data-cy="register-password"
        />
        <div className="flex items-start gap-2.5 rounded-[14px] bg-secondary px-3.5 py-3 text-xs font-medium text-primary">
          <ShieldCheck className="mt-0.5 h-[18px] w-[18px] shrink-0" />
          Ton dressing reste privé tant que tu ne partages rien.
        </div>
        {error && (
          <p className="text-sm text-destructive" data-cy="register-error">
            {error}
          </p>
        )}
        <PillButton type="submit" loading={loading} data-cy="register-submit">
          Créer mon compte
        </PillButton>
      </form>
      <p className="mt-7 text-center text-sm text-muted-foreground">
        Déjà un compte ?{' '}
        <button type="button" onClick={() => onNavigate('login')} className="font-semibold text-primary">
          Se connecter
        </button>
      </p>
    </>
  )
}
