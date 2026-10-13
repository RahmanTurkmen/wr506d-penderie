import { useEffect, useState } from 'react'
import { listCategories, listObjets, listTags } from '@/lib/api'
import { AddObjetPage } from './AddObjetPage'
import { DressingPage } from './DressingPage'
import { InventoryListPage } from './InventoryListPage'
import { ObjetDetailPage } from './ObjetDetailPage'

export function InventorySection({ token, activeProfil, initialView = 'list', initialObjetId = null, onConsumeInitialView }) {
  const [view, setView] = useState(initialView)
  const [selectedId, setSelectedId] = useState(initialObjetId)
  const [returnView, setReturnView] = useState('list')

  const [objets, setObjets] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    const [objetsRes, categoriesRes, tagsRes] = await Promise.all([
      listObjets(token, activeProfil?.id),
      listCategories(token, activeProfil?.id),
      listTags(token, activeProfil?.id),
    ])
    if (!objetsRes.ok) {
      setError(objetsRes.data?.error ?? 'Impossible de charger tes objets.')
      setObjets([])
    } else {
      setError('')
      setObjets(objetsRes.data ?? [])
    }
    if (categoriesRes.ok) setCategories(categoriesRes.data ?? [])
    if (tagsRes.ok) setTags(tagsRes.data ?? [])
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

  if (view === 'dressing') {
    return (
      <DressingPage
        objets={objets}
        tags={tags}
        onBack={() => setView('list')}
        onOpenObjet={(id) => {
          setSelectedId(id)
          setReturnView('dressing')
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
        onBack={() => setView(returnView)}
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
        setReturnView('list')
        setView('detail')
      }}
      onAddObjet={() => setView('add')}
      onOpenDressing={() => setView('dressing')}
    />
  )
}
