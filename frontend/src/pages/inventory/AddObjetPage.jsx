import { useEffect, useState } from 'react'
import { BookOpen, Check, Disc3, Loader2, Package, Shirt } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Chip } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'
import { MultiPickOrCreate } from '@/components/inventory/MultiPickOrCreate'
import { PhotoScanStep } from '@/components/inventory/PhotoScanStep'
import { PickOrCreate } from '@/components/inventory/PickOrCreate'
import {
  createCategorie,
  createLogement,
  createObjet,
  createPiece,
  createTag,
  listCategories,
  listLogements,
  listTags,
} from '@/lib/api'

const TYPE_ICONS = {
  vetement: Shirt,
  livre: BookOpen,
  vinyle: Disc3,
  autre: Package,
}
const TYPE_ORDER = ['vetement', 'livre', 'vinyle', 'autre']

const TOTAL_STEPS = 3
const STEP_KEY = { 1: 'photo', 2: 'infos', 3: 'emplacement' }

export function AddObjetPage({ token, activeProfil, onCreated, onCancel }) {
  const { t } = useTranslation('inventory')
  const TYPES = TYPE_ORDER.map((value) => ({ value, label: t(`addObjet.types.${value}`), icon: TYPE_ICONS[value] }))
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [logements, setLogements] = useState([])

  const [nom, setNom] = useState('')
  const [type, setType] = useState('vetement')
  const [categorieId, setCategorieId] = useState(null)
  const [categorieSuggestion, setCategorieSuggestion] = useState('')
  const [marque, setMarque] = useState('')
  const [taille, setTaille] = useState('')
  const [couleur, setCouleur] = useState('')
  const [tagIds, setTagIds] = useState([])
  const [logementId, setLogementId] = useState(null)
  const [pieceId, setPieceId] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function run() {
      const [catRes, tagRes, logRes] = await Promise.all([
        listCategories(token, activeProfil?.id),
        listTags(token, activeProfil?.id),
        listLogements(token, activeProfil?.id),
      ])
      if (cancelled) return
      if (catRes.ok) setCategories(catRes.data ?? [])
      if (tagRes.ok) setTags(tagRes.data ?? [])
      if (logRes.ok) setLogements(logRes.data ?? [])
      setLoading(false)
    }
    if (token && activeProfil?.id) run()
    return () => {
      cancelled = true
    }
  }, [token, activeProfil?.id])

  const selectedLogement = logements.find((l) => l.id === logementId)
  const pieces = selectedLogement?.pieces ?? []

  async function handleCreateCategorie(nomCat) {
    const res = await createCategorie(token, activeProfil?.id, nomCat)
    if (!res.ok) {
      setError(res.data?.error ?? t('addObjet.errors.categorie'))
      return null
    }
    setCategories((prev) => [...prev, res.data])
    setCategorieId(res.data.id)
    return res.data
  }

  async function handleCreateTag(nomTag) {
    const res = await createTag(token, activeProfil?.id, nomTag)
    if (!res.ok) {
      setError(res.data?.error ?? t('addObjet.errors.tag'))
      return null
    }
    setTags((prev) => [...prev, res.data])
    setTagIds((prev) => [...prev, res.data.id])
    return res.data
  }

  async function handleCreateLogement(nomLog) {
    const res = await createLogement(token, activeProfil?.id, nomLog)
    if (!res.ok) {
      setError(res.data?.error ?? t('addObjet.errors.logement'))
      return null
    }
    setLogements((prev) => [...prev, { ...res.data, pieces: [] }])
    setLogementId(res.data.id)
    setPieceId(null)
    return res.data
  }

  async function handleCreatePiece(nomPiece) {
    if (!logementId) return null
    const res = await createPiece(token, activeProfil?.id, logementId, nomPiece)
    if (!res.ok) {
      setError(res.data?.error ?? t('addObjet.errors.piece'))
      return null
    }
    setLogements((prev) => prev.map((l) => (l.id === logementId ? { ...l, pieces: [...l.pieces, res.data] } : l)))
    setPieceId(res.data.id)
    return res.data
  }

  function toggleTag(id) {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  function handlePhotoResult({ file, suggestion }) {
    setPhotoFile(file ?? null)
    if (suggestion) {
      if (suggestion.nom) setNom(suggestion.nom)
      if (suggestion.type) setType(suggestion.type)
      if (suggestion.marque) setMarque(suggestion.marque)
      if (suggestion.couleur) setCouleur(suggestion.couleur)
      if (suggestion.categorie) {
        const match = categories.find((c) => c.nom.toLowerCase() === suggestion.categorie.toLowerCase())
        if (match) setCategorieId(match.id)
        else setCategorieSuggestion(suggestion.categorie)
      }
    }
    setStep(2)
  }

  const step2Valid = nom.trim().length > 0 && Boolean(categorieId)
  const step3Valid = Boolean(pieceId)

  async function handleSubmit() {
    setSaving(true)
    setError('')
    const res = await createObjet(
      token,
      activeProfil?.id,
      {
        nom: nom.trim(),
        type,
        categorieId,
        pieceId,
        tagIds,
        marque: marque.trim(),
        taille: taille.trim(),
        couleur: couleur.trim(),
      },
      photoFile,
    )
    setSaving(false)
    if (!res.ok) {
      setError(res.data?.error ?? t('addObjet.errors.objet'))
      return
    }
    onCreated(res.data)
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <ScreenHeader title={t('addObjet.title')} onBack={onCancel} close />
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col pb-28 md:pb-10">
      <ScreenHeader
        title={t('addObjet.title')}
        subtitle={t('addObjet.stepSubtitle', { step, total: TOTAL_STEPS, label: t(`addObjet.stepLabels.${STEP_KEY[step]}`) })}
        onBack={onCancel}
        close
        step={[step, TOTAL_STEPS]}
      />

      <div className="mx-auto w-full max-w-xl space-y-5 px-6 py-5 md:px-10">
        {error && <p className="rounded-2xl bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}

        {step === 1 && <PhotoScanStep token={token} activeProfil={activeProfil} onResult={handlePhotoResult} />}

        {step === 2 && (
          <>
            <label className="block space-y-1.5 text-left">
              <span className="text-sm font-medium text-foreground">{t('addObjet.fields.nomLabel')}</span>
              <input
                autoFocus
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder={t('addObjet.fields.nomPlaceholder')}
                data-cy="objet-nom"
                className="h-[52px] w-full rounded-[14px] border border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>

            <div className="space-y-2 text-left">
              <span className="block text-sm font-medium text-foreground">{t('addObjet.fields.typeLabel')}</span>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <Chip key={t.value} active={type === t.value} onClick={() => setType(t.value)} icon={t.icon}>
                    {t.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <label className="block space-y-1.5 text-left">
                <span className="text-sm font-medium text-foreground">{t('addObjet.fields.marqueLabel')}</span>
                <input
                  value={marque}
                  onChange={(e) => setMarque(e.target.value)}
                  placeholder={t('addObjet.fields.marquePlaceholder')}
                  className="h-11 w-full rounded-[14px] border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </label>
              <label className="block space-y-1.5 text-left">
                <span className="text-sm font-medium text-foreground">{t('addObjet.fields.tailleLabel')}</span>
                <input
                  value={taille}
                  onChange={(e) => setTaille(e.target.value)}
                  placeholder={t('addObjet.fields.taillePlaceholder')}
                  className="h-11 w-full rounded-[14px] border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </label>
              <label className="block space-y-1.5 text-left">
                <span className="text-sm font-medium text-foreground">{t('addObjet.fields.couleurLabel')}</span>
                <input
                  value={couleur}
                  onChange={(e) => setCouleur(e.target.value)}
                  placeholder={t('addObjet.fields.couleurPlaceholder')}
                  className="h-11 w-full rounded-[14px] border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </label>
            </div>

            <PickOrCreate
              label={t('addObjet.categorie.label')}
              items={categories}
              valueId={categorieId}
              onChange={setCategorieId}
              onCreate={handleCreateCategorie}
              placeholder={t('addObjet.categorie.placeholder')}
              suggestion={categorieSuggestion}
            />

            <MultiPickOrCreate
              label={t('addObjet.tags.label')}
              items={tags}
              valueIds={tagIds}
              onToggle={toggleTag}
              onCreate={handleCreateTag}
              placeholder={t('addObjet.tags.placeholder')}
            />
          </>
        )}

        {step === 3 && (
          <>
            <PickOrCreate
              label={t('addObjet.logement.label')}
              items={logements}
              valueId={logementId}
              onChange={(id) => {
                setLogementId(id)
                setPieceId(null)
              }}
              onCreate={handleCreateLogement}
              placeholder={t('addObjet.logement.placeholder')}
            />

            {logementId && (
              <PickOrCreate
                label={t('addObjet.piece.label')}
                items={pieces}
                valueId={pieceId}
                onChange={setPieceId}
                onCreate={handleCreatePiece}
                placeholder={t('addObjet.piece.placeholder')}
              />
            )}
          </>
        )}
      </div>

      {step > 1 && (
        <div className="fixed inset-x-0 bottom-20 mx-auto flex w-full max-w-xl gap-2.5 bg-background/95 px-6 py-3 backdrop-blur">
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="h-[52px] flex-1 rounded-full border border-border text-[15px] font-semibold text-foreground"
          >
            {t('addObjet.actions.back')}
          </button>
          {step === 2 && (
            <button
              type="button"
              disabled={!step2Valid}
              onClick={() => setStep(3)}
              data-cy="objet-continuer"
              className="h-[52px] flex-1 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground disabled:opacity-50"
            >
              {t('addObjet.actions.continue')}
            </button>
          )}
          {step === 3 && (
            <button
              type="button"
              disabled={!step3Valid || saving}
              onClick={handleSubmit}
              data-cy="objet-ajouter"
              className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Check className="h-[18px] w-[18px]" />}
              {t('addObjet.actions.add')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
