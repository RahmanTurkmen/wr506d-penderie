import { useEffect, useRef, useState } from 'react'
import { AlertCircle, X } from 'lucide-react'

// Caméra live via getUserMedia (webcam PC, ou caméra du téléphone depuis le
// navigateur). Ne marche qu'en contexte sécurisé (https, ou localhost) — sur
// http://<ip-lan>:5173 le navigateur refuse l'accès caméra, d'où le fallback
// vers l'input `capture` natif géré par PhotoScanStep dans ce cas.
export function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setReady(true)
      } catch {
        if (!cancelled) setError("Impossible d'accéder à la caméra. Vérifie les autorisations du navigateur pour ce site.")
      }
    }

    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  function handleClose() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    onClose()
  }

  function capture() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        streamRef.current?.getTracks().forEach((t) => t.stop())
        onCapture(new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' }))
      },
      'image/jpeg',
      0.9,
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <button
        type="button"
        onClick={handleClose}
        aria-label="Fermer la caméra"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white"
      >
        <X className="h-5 w-5" />
      </button>

      {error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-10 text-center text-white">
          <AlertCircle className="h-8 w-8" />
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <video ref={videoRef} playsInline muted className="h-full w-full flex-1 object-cover" />
      )}

      {!error && (
        <div className="flex items-center justify-center bg-black/85 py-6">
          <button
            type="button"
            disabled={!ready}
            onClick={capture}
            aria-label="Prendre la photo"
            className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white disabled:opacity-40"
          >
            <span className="h-12 w-12 rounded-full bg-white" />
          </button>
        </div>
      )}
    </div>
  )
}
