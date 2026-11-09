import { useEffect, useState } from 'react'
import { createBlocage, createProfil, deleteBlocage, listBlocages, listProfils } from '@/lib/api'
import { ConfidentialitePage } from './ConfidentialitePage'
import { NewProfilPage } from './NewProfilPage'
import { ProfilHomePage } from './ProfilHomePage'
import { ProfilsFoyerPage } from './ProfilsFoyerPage'

export function ProfilSection({ token, activeProfil, onLogout, onProfilsChanged }) {
  const [view, setView] = useState('home') // 'home' | 'foyer' | 'new-profil' | 'confidentialite'

  const [profils, setProfils] = useState([])
  const [blocages, setBlocages] = useState([])
  const [loadingProfils, setLoadingProfils] = useState(true)
  const [loadingBlocages, setLoadingBlocages] = useState(true)

  async function refreshProfils() {
    const res = await listProfils(token)
    if (res.ok) setProfils(res.data ?? [])
    setLoadingProfils(false)
  }

  async function refreshBlocages() {
    const res = await listBlocages(token, activeProfil?.id)
    if (res.ok) setBlocages(res.data ?? [])
    setLoadingBlocages(false)
  }

  useEffect(() => {
    if (token) refreshProfils()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    if (token && activeProfil?.id) refreshBlocages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeProfil?.id])

  async function handleCreateProfil(nom, estMineur) {
    const res = await createProfil(token, nom, estMineur)
    if (!res.ok) return false
    await refreshProfils()
    onProfilsChanged?.()
    setView('foyer')
    return true
  }

  async function handleBlock(email) {
    const res = await createBlocage(token, activeProfil?.id, email)
    if (!res.ok) return false
    await refreshBlocages()
    return true
  }

  async function handleUnblock(id) {
    await deleteBlocage(token, activeProfil?.id, id)
    await refreshBlocages()
  }

  if (view === 'foyer') {
    return (
      <ProfilsFoyerPage
        profils={profils}
        activeProfilId={activeProfil?.id}
        loading={loadingProfils}
        onBack={() => setView('home')}
        onNewProfil={() => setView('new-profil')}
      />
    )
  }

  if (view === 'new-profil') {
    return <NewProfilPage onCancel={() => setView('foyer')} onSubmit={handleCreateProfil} />
  }

  if (view === 'confidentialite') {
    return (
      <ConfidentialitePage
        blocages={blocages}
        loading={loadingBlocages}
        onBack={() => setView('home')}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
      />
    )
  }

  return (
    <ProfilHomePage
      activeProfil={activeProfil}
      profilsCount={profils.length}
      blocagesCount={blocages.length}
      loadingProfils={loadingProfils}
      loadingBlocages={loadingBlocages}
      onOpenFoyer={() => setView('foyer')}
      onOpenConfidentialite={() => setView('confidentialite')}
      onLogout={onLogout}
    />
  )
}
