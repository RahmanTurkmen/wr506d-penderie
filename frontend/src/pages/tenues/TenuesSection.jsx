import { useEffect, useState } from 'react'
import { createRefusTenue, createTenue, listCategories, listObjets, listRefusTenues, listTenues } from '@/lib/api'
import { NewRefusPage } from './NewRefusPage'
import { NewTenuePage } from './NewTenuePage'
import { TenuesListPage } from './TenuesListPage'

export function TenuesSection({ token, activeProfil, onOpenObjet }) {
  const [view, setView] = useState('list') // 'list' | 'new-tenue' | 'new-refus'

  const [tenues, setTenues] = useState([])
  const [refus, setRefus] = useState([])
  const [objets, setObjets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    const [tenuesRes, refusRes, objetsRes, categoriesRes] = await Promise.all([
      listTenues(token, activeProfil?.id),
      listRefusTenues(token, activeProfil?.id),
      listObjets(token, activeProfil?.id),
      listCategories(token, activeProfil?.id),
    ])
    if (!tenuesRes.ok) {
      setError(tenuesRes.data?.error ?? 'Impossible de charger tes tenues.')
    } else {
      setError('')
      setTenues(tenuesRes.data ?? [])
    }
    if (refusRes.ok) setRefus(refusRes.data ?? [])
    if (objetsRes.ok) setObjets(objetsRes.data ?? [])
    if (categoriesRes.ok) setCategories(categoriesRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (token && activeProfil?.id) refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeProfil?.id])

  async function handleCreateTenue(nom, objetIds) {
    const res = await createTenue(token, activeProfil?.id, nom, objetIds)
    if (!res.ok) return false
    await refresh()
    setView('list')
    return true
  }

  async function handleCreateRefus(payload) {
    const res = await createRefusTenue(token, activeProfil?.id, payload)
    if (!res.ok) return false
    await refresh()
    setView('list')
    return true
  }

  if (view === 'new-tenue') {
    return <NewTenuePage objets={objets} onCancel={() => setView('list')} onSubmit={handleCreateTenue} />
  }

  if (view === 'new-refus') {
    return (
      <NewRefusPage
        objets={objets}
        categories={categories}
        onCancel={() => setView('list')}
        onSubmit={handleCreateRefus}
      />
    )
  }

  return (
    <TenuesListPage
      tenues={tenues}
      refus={refus}
      loading={loading}
      error={error}
      onNewTenue={() => setView('new-tenue')}
      onNewRefus={() => setView('new-refus')}
      onOpenObjet={onOpenObjet}
    />
  )
}
