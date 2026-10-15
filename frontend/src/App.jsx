import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AppShell } from '@/components/shell/AppShell'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { EmailSentPage } from '@/pages/auth/EmailSentPage'
import { HomePage } from '@/pages/home/HomePage'
import { InventorySection } from '@/pages/inventory/InventorySection'
import { LogementsSection } from '@/pages/logements/LogementsSection'
import { PretsSection } from '@/pages/prets/PretsSection'
import { getStoredProfilId, getToken, listProfils, setStoredProfilId, setToken } from '@/lib/api'

export default function App() {
  const [token, setTokenState] = useState(() => getToken())
  const [screen, setScreen] = useState('login')
  const [pendingEmail, setPendingEmail] = useState('')

  const [profils, setProfils] = useState([])
  const [activeProfilId, setActiveProfilId] = useState(() => getStoredProfilId())
  const [profilsLoading, setProfilsLoading] = useState(false)

  const [activeTab, setActiveTab] = useState('accueil')
  const [inventoryRequest, setInventoryRequest] = useState(null)

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
    setActiveTab('accueil')
    setInventoryRequest(null)
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
      <AppShell active={activeTab} onNavigate={setActiveTab} profilNom={activeProfil?.nom} profilSubtitle={subtitle} onLogout={handleLogout}>
        {activeTab === 'inventaire' && (
          <InventorySection
            token={token}
            activeProfil={activeProfil}
            initialView={inventoryRequest?.view ?? 'list'}
            initialObjetId={inventoryRequest?.objetId ?? null}
            onConsumeInitialView={() => setInventoryRequest(null)}
          />
        )}
        {activeTab === 'logements' && (
          <LogementsSection
            token={token}
            activeProfil={activeProfil}
            onOpenObjet={(id) => {
              setInventoryRequest({ view: 'detail', objetId: id })
              setActiveTab('inventaire')
            }}
          />
        )}
        {activeTab === 'prets' && (
          <PretsSection
            token={token}
            activeProfil={activeProfil}
            onBack={() => setActiveTab('accueil')}
            onOpenObjet={(id) => {
              setInventoryRequest({ view: 'detail', objetId: id })
              setActiveTab('inventaire')
            }}
          />
        )}
        {activeTab === 'accueil' && (
          <HomePage
            token={token}
            profils={profils}
            activeProfil={activeProfil}
            onSwitchProfil={handleSwitchProfil}
            onLogout={handleLogout}
            onAddObjet={() => {
              setInventoryRequest({ view: 'add' })
              setActiveTab('inventaire')
            }}
            onOpenObjet={(id) => {
              setInventoryRequest({ view: 'detail', objetId: id })
              setActiveTab('inventaire')
            }}
            onOpenPrets={() => setActiveTab('prets')}
          />
        )}
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
