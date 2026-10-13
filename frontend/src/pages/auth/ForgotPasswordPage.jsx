import { useState } from 'react'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { FieldInput } from '@/components/auth/FieldInput'
import { PillButton } from '@/components/auth/PillButton'

// NB : il n'existe pas encore d'endpoint backend de réinitialisation de mot
// de passe. Cet écran est pour l'instant une maquette fonctionnelle côté UI :
// il enchaîne simplement sur l'écran "E-mail envoyé".
export function ForgotPasswordPage({ onSent, onNavigate }) {
  const [email, setEmail] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSent(email)
  }

  return (
    <>
      <AuthHeader
        icon={Mail}
        title="Mot de passe oublié"
        subtitle="Entre ton e-mail, on t'envoie un lien pour en choisir un nouveau."
      />
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
        />
        <PillButton type="submit" icon={Send}>
          Envoyer le lien
        </PillButton>
        <PillButton type="button" variant="outline" icon={ArrowLeft} onClick={() => onNavigate('login')}>
          Retour à la connexion
        </PillButton>
      </form>
    </>
  )
}
