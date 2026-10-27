import { useEffect, useState } from 'react'
import { cloturerPret, createPret, listObjets, listPrets } from '@/lib/api'
import { NewPretPage } from './NewPretPage'
import { PretsListPage } from './PretsListPage'

export function PretsSection({ token, activeProfil, onOpenObjet, onBack }) {
  const [view, setView] = useState('list')
  const [objets, setObjets] = useState([])
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  async function refresh() {
    const objetsRes = await listObjets(token, activeProfil?.id)
    if (!objetsRes.ok) {
      setError(objetsRes.data?.error ?? 'Impossible de charger tes objets.')
      setObjets([])
      setLoans([])
      setLoading(false)
      return
    }
    setError('')
    const list = objetsRes.data ?? []
    setObjets(list)

    const results = await Promise.all(list.map((o) => listPrets(token, activeProfil?.id, o.id)))
    const now = Date.now()
    const allLoans = []
    list.forEach((objet, i) => {
      const res = results[i]
      if (res.ok) {
        for (const pret of res.data ?? []) {
          const late = pret.actif && Boolean(pret.dateFinPrevue) && new Date(pret.dateFinPrevue).getTime() < now
          allLoans.push({ objet, pret: { ...pret, late } })
        }
      }
    })
    allLoans.sort((a, b) => new Date(b.pret.dateDebut) - new Date(a.pret.dateDebut))
    setLoans(allLoans)
    setLoading(false)
  }

  useEffect(() => {
    if (token && activeProfil?.id) refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeProfil?.id])

  async function handleCloturer(pretId) {
    setBusyId(pretId)
    await cloturerPret(token, activeProfil?.id, pretId)
    setBusyId(null)
    await refresh()
  }

  async function handleCreate(objetId, emprunteurNom, dateFinPrevue) {
    const res = await createPret(token, activeProfil?.id, objetId, emprunteurNom, dateFinPrevue)
    if (!res.ok) return false
    await refresh()
    setView('list')
    return true
  }

  if (view === 'new') {
    const objetsDisponibles = objets.filter((o) => o.statut === 'disponible')
    return <NewPretPage objetsDisponibles={objetsDisponibles} onCancel={() => setView('list')} onSubmit={handleCreate} />
  }

  return (
    <PretsListPage
      loans={loans}
      loading={loading}
      error={error}
      busyId={busyId}
      onOpenObjet={onOpenObjet}
      onNewPret={() => setView('new')}
      onCloturer={handleCloturer}
      onBack={onBack}
    />
  )
}
