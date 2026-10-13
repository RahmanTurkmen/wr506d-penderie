import { useEffect, useState } from 'react'
import { listCategories, listObjets } from '@/lib/api'
import { AddObjetPage } from './AddObjetPage'
import { InventoryListPage } from './InventoryListPage'
import { ObjetDetailPage } from './ObjetDetailPage'

export function InventorySection({ token, activeProfil, initialView = 'list', initialObjetId = null, onConsumeInitialView }) {
  const [view, setView] = useState(initialView)
  const [selectedId, setSelectedId] = useState(initialObjetId)

  const [objets, setObjets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    const [objetsRes, categoriesRes] = await Promise.all([
      listObjets(token, activeProfil?.id),
      listCategories(token, activeProfil?.id),
    ])
    if (!objetsRes.ok) {
      setError(objetsRes.data?.error ?? 'Impossible de charger tes objets.')
      setObjets([])
    } else {
      setError('')
      setObjets(objetsRes.data ?? [])
    }
    if (categoriesRes.ok) setCategories(categoriesRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (token && activeProfil?.id) refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeProfil?.id])

  useEffect(() => {
    if (initialView === 'add') {
      setView('add')
      onConsumeInitialView?.()
    } else if (initialView === 'detail' && initialObjetId) {
      setSelectedId(initialObjetId)
      setView('detail')
      onConsumeInitialView?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialView, initialObjetId])

  if (view === 'add') {
    return (
      <AddObjetPage
        token={token}
        activeProfil={activeProfil}
        onCancel={() => setView('list')}
        onCreated={async (created) => {
          await refresh()
          setSelectedId(created.id)
          setView('detail')
        }}
      />
    )
  }

  if (view === 'detail') {
    const objet = objets.find((o) => o.id === selectedId) ?? null
    return (
      <ObjetDetailPage
        token={token}
        activeProfil={activeProfil}
        objet={objet}
        onBack={() => setView('list')}
        onRefresh={refresh}
      />
    )
  }

  return (
    <InventoryListPage
      objets={objets}
      categories={categories}
      loading={loading}
      error={error}
      onOpenObjet={(id) => {
        setSelectedId(id)
        setView('detail')
      }}
      onAddObjet={() => setView('add')}
    />
  )
}
