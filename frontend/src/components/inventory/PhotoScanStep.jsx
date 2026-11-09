import { useRef, useState } from 'react'
import { AlertCircle, Camera, ImageUp, Loader2, Sparkles, X } from 'lucide-react'
import { scanObjet } from '@/lib/api'
import { CameraCapture } from './CameraCapture'

export function PhotoScanStep({ token, activeProfil, onResult }) {
  const cameraInputRef = useRef(null)
  const libraryInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [suggestion, setSuggestion] = useState(null)
  const [liveCamera, setLiveCamera] = useState(false)

  function setPickedFile(f) {
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setSuggestion(null)
    setError('')
  }

  function pickFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setPickedFile(f)
  }

  function openCamera() {
    // getUserMedia exige un contexte sécurisé (https, ou localhost) : sur
    // http://<ip-lan>:5173 (téléphone sur le même réseau), il n'est pas
    // disponible — on retombe sur l'input natif (ouvre l'appli caméra).
    if (navigator.mediaDevices?.getUserMedia) {
      setLiveCamera(true)
    } else {
      cameraInputRef.current?.click()
    }
  }

  function handleLiveCapture(capturedFile) {
    setLiveCamera(false)
    setPickedFile(capturedFile)
  }

  function reset() {
    setFile(null)
    setPreviewUrl(null)
    setSuggestion(null)
    setError('')
    if (cameraInputRef.current) cameraInputRef.current.value = ''
    if (libraryInputRef.current) libraryInputRef.current.value = ''
  }

  async function analyze() {
    if (!file) return
    setAnalyzing(true)
    setError('')
    const res = await scanObjet(token, activeProfil?.id, file)
    setAnalyzing(false)
    if (!res.ok) {
      setError(res.data?.error ?? "Impossible d'analyser la photo.")
      return
    }
    setSuggestion(res.data)
  }

  return (
    <div className="space-y-4">
      {liveCamera && <CameraCapture onCapture={handleLiveCapture} onClose={() => setLiveCamera(false)} />}

      {!previewUrl && (
        <div className="space-y-3">
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={openCamera}
              className="flex h-[108px] flex-1 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary text-primary"
            >
              <Camera className="h-7 w-7" />
              <span className="text-sm font-semibold">Prendre une photo</span>
            </button>
            <button
              type="button"
              onClick={() => libraryInputRef.current?.click()}
              className="flex h-[108px] flex-1 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary text-primary"
            >
              <ImageUp className="h-7 w-7" />
              <span className="text-sm font-semibold">Importer une photo</span>
            </button>
          </div>
          <p className="px-2 text-center text-xs text-muted-foreground">
            Lumen essaie de reconnaître l'objet pour toi (modèles gratuits, parfois un peu lents)
          </p>
        </div>
      )}
      {/* Deux inputs distincts : `capture` force l'appareil photo sur mobile
          (sans accès à la galerie) — on le réserve donc au bouton dédié. */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={pickFile}
        className="hidden"
      />
      <input ref={libraryInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pickFile} className="hidden" />

      {previewUrl && (
        <div className="relative overflow-hidden rounded-2xl">
          <img src={previewUrl} alt="Photo de l'objet" className="aspect-[4/3] w-full object-cover" />
          <button
            type="button"
            onClick={reset}
            aria-label="Retirer la photo"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {previewUrl && !suggestion && (
        <button
          type="button"
          disabled={analyzing}
          onClick={analyze}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground disabled:opacity-60"
        >
          {analyzing ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Sparkles className="h-[18px] w-[18px]" />}
          {analyzing ? "Analyse en cours… (jusqu'à 1 min, modèles gratuits)" : 'Analyser la photo'}
        </button>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-[18px] w-[18px] shrink-0" />
          {error}
        </div>
      )}

      {suggestion && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-secondary px-4 py-3 text-sm text-primary">
          <Sparkles className="mt-0.5 h-[18px] w-[18px] shrink-0" />
          <span>
            Reconnaissance : « {suggestion.nom || '?'} » · {suggestion.confidence}% — modifiable à l'étape suivante.
          </span>
        </div>
      )}

      <div className="flex gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => onResult({ file, suggestion: null })}
          data-cy="objet-skip-photo"
          className="h-[52px] flex-1 rounded-full border border-border text-[15px] font-semibold text-foreground"
        >
          {!file ? 'Continuer sans photo' : suggestion ? 'Ignorer la suggestion' : 'Passer avec cette photo'}
        </button>
        {suggestion && (
          <button
            type="button"
            onClick={() => onResult({ file, suggestion })}
            className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground"
          >
            Utiliser cette suggestion
          </button>
        )}
      </div>
    </div>
  )
}
