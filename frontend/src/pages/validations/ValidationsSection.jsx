import { useEffect, useState } from 'react'
import { decideValidation, listObjets, listValidations } from '@/lib/api'
import { ValidationsPage } from './ValidationsPage'

export function ValidationsSection({ token, onBack }) {
  const [validations, setValidations] = useState([])
  const [objetNoms, setObjetNoms] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  async function refresh() {
    const res = await listValidations(token)
    if (!res.ok) {
      setError(res.data?.error ?? 'Impossible de charger les demandes.')
      setValidations([])
      setLoading(false)
      return
    }
    setError('')
    const list = res.data ?? []
    setValidations(list)

    // Le payload d'une demande "mise en vente" ne contient que l'id de
    // l'objet (cf. ValidationController) : on résout son nom en listant les
    // objets du/des profil(s) concerné(s), pour afficher un titre lisible
    // comme sur le Figma ("Mettre « Vélo rose » en vente").
    const profilIds = [...new Set(list.filter((v) => v.type === 'objet_en_vente').map((v) => v.profil.id))]
    if (profilIds.length > 0) {
      const results = await Promise.all(profilIds.map((id) => listObjets(token, id)))
      const map = {}
      results.forEach((r) => {
        if (r.ok) for (const o of r.data ?? []) map[o.id] = o.nom
      })
      setObjetNoms(map)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (token) refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function handleDecide(id, statut) {
    setBusyId(id)
    await decideValidation(token, id, statut)
    await refresh()
    setBusyId(null)
  }

  return (
    <ValidationsPage
      validations={validations}
      objetNoms={objetNoms}
      loading={loading}
      error={error}
      onBack={onBack}
      onDecide={handleDecide}
      busyId={busyId}
    />
  )
}
