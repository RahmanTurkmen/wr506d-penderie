import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { PillButton } from '@/components/auth/PillButton'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { EmailSentPage } from '@/pages/auth/EmailSentPage'
import { getToken, setToken } from '@/lib/api'

// Placeholder le temps de construire les sections suivantes (02 — Accueil, ...).
function SignedInPlaceholder({ onLogout }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-primary text-primary-foreground">
        <span className="text-2xl font-bold">L</span>
      </div>
      <div>
        <h1 className="text-xl font-bold text-foreground">Connecté</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          L'accueil (section 02) arrive bientôt. En attendant, la connexion fonctionne.
        </p>
      </div>
      <PillButton variant="outline" icon={LogOut} className="w-auto px-6" onClick={onLogout}>
        Se déconnecter
      </PillButton>
    </div>
  )
}

export default function App() {
  const [token, setTokenState] = useState(() => getToken())
  const [screen, setScreen] = useState('login')
  const [pendingEmail, setPendingEmail] = useState('')

  function handleLogin(newToken) {
    setToken(newToken)
    setTokenState(newToken)
  }

  function handleLogout() {
    setToken(null)
    setTokenState(null)
    setScreen('login')
  }

  function handleRegistered(email) {
    setPendingEmail(email)
    setScreen('login')
  }

  function handleForgotSent(email) {
    setPendingEmail(email)
    setScreen('sent')
  }

  if (token) {
    return <SignedInPlaceholder onLogout={handleLogout} />
  }

  let page
  if (screen === 'register') {
    page = <RegisterPage onRegistered={handleRegistered} onNavigate={setScreen} />
  } else if (screen === 'forgot') {
    page = <ForgotPasswordPage onSent={handleForgotSent} onNavigate={setScreen} />
  } else if (screen === 'sent') {
    page = <EmailSentPage email={pendingEmail} onNavigate={setScreen} />
  } else {
    page = <LoginPage onLogin={handleLogin} onNavigate={setScreen} />
  }

  return <AuthLayout>{page}</AuthLayout>
}
