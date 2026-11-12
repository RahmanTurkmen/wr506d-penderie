import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Chip } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'
import { AdminDashboardPage } from './AdminDashboardPage'
import { AdminSignalementsPage } from './AdminSignalementsPage'
import { AdminUtilisateursPage } from './AdminUtilisateursPage'

const SIGNALEMENTS_INITIAUX = [
  { id: 'montre', titre: 'Annonce « Montre de luxe »', detail: 'Signalée 3 fois · contenu suspect', urgence: 'urgent' },
  { id: 'litige-482', titre: 'Litige #482', detail: 'Colis non reçu · Tom ↔ Lilou', urgence: 'ouvert' },
  { id: 'bijoux', titre: 'Annonce « Bijoux de luxe »', detail: 'Signalée par Lilou, Max, Noa', urgence: 'urgent' },
  { id: 'ventepromo', titre: 'Profil « ventepromo »', detail: 'Spam · signalé 2 fois', urgence: 'ouvert' },
  { id: 'litige-146', titre: 'Litige #146', detail: 'Colis non reçu', urgence: 'ouvert' },
]

// Section statique (pas d'entité "Administration" côté backend) : reprend
// le Figma 14 — BACK-OFFICE ADMIN. La maquette ne dessine QUE des frames
// desktop pour cette section (pas de "M ·"), mais Lumen est une web app
// mobile-first qui garde la même mise en page quelle que soit la largeur
// de fenêtre : listes empilées (Row/Card), pas de tableau desktop dédié.
//
// La sidebar du Figma liste aussi "Ventes" et "Catégories" : non
// construits ici (pas de contenu propre dans la maquette au-delà de ce
// qui existe déjà dans la vraie section Ventes), affichés en onglets
// inertes pour garder les repères visuels, même schéma que les onglets
// "Tenues"/"Profil" désactivés dans la nav principale au tout début du
// projet.
export function AdminSection({ onBack }) {
  const { t } = useTranslation('admin')
  const [tab, setTab] = useState('dashboard') // 'dashboard' | 'utilisateurs' | 'signalements'
  const [signalements, setSignalements] = useState(SIGNALEMENTS_INITIAUX)

  function ignorer(id) {
    setSignalements((prev) => prev.filter((s) => s.id !== id))
  }

  function retirer(id) {
    setSignalements((prev) => prev.filter((s) => s.id !== id))
  }

  const TITLE = {
    dashboard: [t('section.tabs.dashboard'), t('section.subtitles.dashboard')],
    utilisateurs: [t('section.tabs.users'), t('section.subtitles.users', { count: 1284 })],
    signalements: [t('section.tabs.reports'), t('section.subtitles.reports', { count: signalements.length })],
  }

  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader title={TITLE[tab][0]} subtitle={TITLE[tab][1]} onBack={onBack} />

      <div className="space-y-5 px-6 py-5 md:px-10">
        <div className="flex flex-wrap gap-2">
          <Chip active={tab === 'dashboard'} onClick={() => setTab('dashboard')}>
            {t('section.tabs.dashboard')}
          </Chip>
          <Chip active={tab === 'utilisateurs'} onClick={() => setTab('utilisateurs')}>
            {t('section.tabs.users')}
          </Chip>
          <Chip active={tab === 'signalements'} onClick={() => setTab('signalements')}>
            {t('section.tabs.reportsWithCount', { count: signalements.length })}
          </Chip>
          <Chip onClick={() => {}}>{t('section.tabs.sales')}</Chip>
          <Chip onClick={() => {}}>{t('section.tabs.categories')}</Chip>
        </div>

        {tab === 'dashboard' && (
          <AdminDashboardPage signalements={signalements} onOpenSignalements={() => setTab('signalements')} />
        )}
        {tab === 'utilisateurs' && <AdminUtilisateursPage />}
        {tab === 'signalements' && (
          <AdminSignalementsPage signalements={signalements} onIgnorer={ignorer} onRetirer={retirer} />
        )}
      </div>
    </div>
  )
}
