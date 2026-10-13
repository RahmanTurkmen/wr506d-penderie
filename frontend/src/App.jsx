import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AppShell } from '@/components/shell/AppShell'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { EmailSentPage } from '@/pages/auth/EmailSentPage'
import { HomePage } from '@/pages/home/HomePage'
import { getStoredProfilId, getToken, listProfils, setStoredProfilId, setToken } from '@/lib/api'

export default function App() {
  const [token, setTokenState] = useState(() => getToken())
  const [screen, setScreen] = useState('login')
  const [pendingEmail, setPendingEmail] = useState('')

  const [profils, setProfils] = useState([])
  const [activeProfilId, setActiveProfilId] = useState(() => getStoredProfilId())
  const [profilsLoading, setProfilsLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setProfilsLoading(true)
    listProfils(token).then(({ ok, data }) => {
      if (cancelled) return
      setProfilsLoading(false)
      if (!ok) return
      setProfils(data ?? [])
      setActiveProfilId((current) => {
        if (current && (data ?? []).some((p) => p.id === current)) return current
        const first = data?.[0]?.id ?? null
        setStoredProfilId(first)
        return first
      })
    })
    return () => {
      cancelled = true
    }
  }, [token])

  function handleLogin(newToken) {
    setToken(newToken)
    setTokenState(newToken)
  }

  function handleLogout() {
    setToken(null)
    setTokenState(null)
    setStoredProfilId(null)
    setActiveProfilId(null)
    setProfils([])
    setScreen('login')
  }

  function handleSwitchProfil(id) {
    setActiveProfilId(id)
    setStoredProfilId(id)
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
    if (profilsLoading && profils.length === 0) {
      return (
        <div className="flex min-h-svh items-center justify-center bg-background text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )
    }

    const activeProfil = profils.find((p) => p.id === activeProfilId)
    const subtitle = activeProfil
      ? activeProfil.type === 'principal'
        ? 'Compte principal'
        : activeProfil.estMineur
          ? 'Profil enfant'
          : 'Profil géré'
      : ''

    return (
      <AppShell active="accueil" onNavigate={() => {}} profilNom={activeProfil?.nom} profilSubtitle={subtitle} onLogout={handleLogout}>
        <HomePage token={token} profils={profils} activeProfil={activeProfil} onSwitchProfil={handleSwitchProfil} />
      </AppShell>
    )
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
