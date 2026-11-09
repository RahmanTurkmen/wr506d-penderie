import { useState } from 'react'
import { Lock, LogOut, Moon, Users } from 'lucide-react'
import { IconTile, Row, Toggle } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'
import { getTheme, setTheme } from '@/lib/theme'

export function ProfilHomePage({
  activeProfil,
  profilsCount,
  blocagesCount,
  loadingProfils,
  loadingBlocages,
  onOpenFoyer,
  onOpenConfidentialite,
  onLogout,
}) {
  const [dark, setDark] = useState(() => getTheme() === 'dark')

  function handleToggleDark(checked) {
    setDark(checked)
    setTheme(checked ? 'dark' : 'light')
  }

  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader
        title="Profil"
        subtitle={activeProfil?.nom ? `${activeProfil.nom} · ${activeProfil.type === 'principal' ? 'compte principal' : 'profil géré'}` : ''}
      />

      <div className="space-y-2.5 px-6 py-5 md:px-10">
        <Row
          lead={<IconTile icon={Users} size={44} />}
          title="Profils du foyer"
          subtitle={loadingProfils ? '…' : `${profilsCount} profil${profilsCount > 1 ? 's' : ''}`}
          onClick={onOpenFoyer}
        />
        <Row
          lead={<IconTile icon={Lock} size={44} />}
          title="Confidentialité"
          subtitle={loadingBlocages ? '…' : `${blocagesCount} utilisateur${blocagesCount > 1 ? 's' : ''} bloqué${blocagesCount > 1 ? 's' : ''}`}
          onClick={onOpenConfidentialite}
        />
        <Row
          lead={<IconTile icon={Moon} size={44} />}
          title="Mode sombre"
          trailing={<Toggle checked={dark} onChange={handleToggleDark} label="Mode sombre" />}
        />
        <Row lead={<IconTile icon={LogOut} size={44} />} title="Se déconnecter" onClick={onLogout} />
      </div>
    </div>
  )
}
