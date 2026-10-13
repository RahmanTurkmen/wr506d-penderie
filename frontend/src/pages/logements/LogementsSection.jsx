import { useEffect, useState } from 'react'
import { createConteneur, createLogement, createPiece, listLogements, listObjets, listPieces } from '@/lib/api'
import { LogementDetailPage } from './LogementDetailPage'
import { LogementsListPage } from './LogementsListPage'
import { PieceDetailPage } from './PieceDetailPage'

export function LogementsSection({ token, activeProfil, onOpenObjet }) {
  const [view, setView] = useState('list') // 'list' | 'logement' | 'piece'
  const [logementId, setLogementId] = useState(null)
  const [pieceId, setPieceId] = useState(null)

  const [logements, setLogements] = useState([])
  const [objets, setObjets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pièces avec leurs rangements (conteneurs) pour la pièce actuellement ouverte.
  const [piecesDetail, setPiecesDetail] = useState([])

  async function refresh() {
    const [logRes, objRes] = await Promise.all([listLogements(token, activeProfil?.id), listObjets(token, activeProfil?.id)])
    if (!logRes.ok) {
      setError(logRes.data?.error ?? 'Impossible de charger tes logements.')
      setLogements([])
    } else {
      setError('')
      setLogements(logRes.data ?? [])
    }
    if (objRes.ok) setObjets(objRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (token && activeProfil?.id) refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeProfil?.id])

  async function refreshPiecesDetail(forLogementId) {
    const res = await listPieces(token, activeProfil?.id, forLogementId)
    if (res.ok) setPiecesDetail(res.data ?? [])
  }

  async function handleCreateLogement(nom) {
    const res = await createLogement(token, activeProfil?.id, nom)
    if (!res.ok) return null
    setLogements((prev) => [...prev, { ...res.data, pieces: [] }])
    return res.data
  }

  async function handleCreatePiece(nom) {
    if (!logementId) return null
    const res = await createPiece(token, activeProfil?.id, logementId, nom)
    if (!res.ok) return null
    setLogements((prev) => prev.map((l) => (l.id === logementId ? { ...l, pieces: [...(l.pieces ?? []), res.data] } : l)))
    return res.data
  }

  async function handleCreateConteneur(nom) {
    if (!pieceId) return null
    const res = await createConteneur(token, activeProfil?.id, pieceId, nom)
    if (!res.ok) return null
    setPiecesDetail((prev) => prev.map((p) => (p.id === pieceId ? { ...p, conteneurs: [...(p.conteneurs ?? []), res.data] } : p)))
    return res.data
  }

  if (view === 'piece') {
    const logement = logements.find((l) => l.id === logementId)
    const piece = piecesDetail.find((p) => p.id === pieceId)
    return (
      <PieceDetailPage
        piece={piece}
        logementNom={logement?.nom}
        objets={objets}
        onBack={() => setView('logement')}
        onCreateConteneur={handleCreateConteneur}
        onOpenObjet={onOpenObjet}
      />
    )
  }

  if (view === 'logement') {
    const logement = logements.find((l) => l.id === logementId)
    return (
      <LogementDetailPage
        logement={logement}
        objets={objets}
        onBack={() => setView('list')}
        onCreatePiece={handleCreatePiece}
        onOpenPiece={async (id) => {
          setPieceId(id)
          await refreshPiecesDetail(logementId)
          setView('piece')
        }}
      />
    )
  }

  return (
    <LogementsListPage
      logements={logements}
      objets={objets}
      loading={loading}
      error={error}
      onCreateLogement={handleCreateLogement}
      onOpenLogement={(id) => {
        setLogementId(id)
        setView('logement')
      }}
    />
  )
}
