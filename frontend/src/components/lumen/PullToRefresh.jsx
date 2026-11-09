import { useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'

const THRESHOLD = 60
const MAX_PULL = 80

// Geste tactile basique (pas de librairie tierce) : on ne suit le doigt que
// si le conteneur est déjà tout en haut de son scroll (sinon on laisserait
// un simple scroll vers le bas déclencher un refresh). "Rubber-band" plafonné
// à MAX_PULL pour que le tiré ne devienne jamais infini.
export function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(null)
  const containerRef = useRef(null)

  function handleTouchStart(e) {
    if (containerRef.current?.scrollTop > 0 || refreshing) {
      startY.current = null
      return
    }
    startY.current = e.touches[0].clientY
  }

  function handleTouchMove(e) {
    if (startY.current === null) return
    const delta = e.touches[0].clientY - startY.current
    if (delta <= 0) {
      setPull(0)
      return
    }
    // Rubber-band : ralentit au fur et à mesure qu'on approche de MAX_PULL.
    const damped = Math.min(MAX_PULL, delta * 0.5)
    setPull(damped)
  }

  async function handleTouchEnd() {
    if (startY.current === null) return
    startY.current = null
    if (pull >= THRESHOLD) {
      setRefreshing(true)
      setPull(THRESHOLD)
      try {
        await onRefresh?.()
      } finally {
        setRefreshing(false)
        setPull(0)
      }
    } else {
      setPull(0)
    }
  }

  const indicatorOpacity = Math.min(1, pull / THRESHOLD)
  const indicatorRotation = refreshing ? undefined : pull * 3

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative flex-1 overflow-y-auto"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"
        style={{ height: MAX_PULL, transform: `translateY(${pull - MAX_PULL}px)`, opacity: indicatorOpacity }}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-primary shadow">
          <RefreshCw
            className={`h-[18px] w-[18px] ${refreshing ? 'animate-spin' : ''}`}
            style={indicatorRotation !== undefined ? { transform: `rotate(${indicatorRotation}deg)` } : undefined}
          />
        </span>
      </div>
      <div style={{ transform: `translateY(${pull}px)`, transition: pull === 0 ? 'transform 200ms ease-out' : undefined }}>
        {children}
      </div>
    </div>
  )
}
