import { useState } from 'react'
import { Chip } from '@/components/lumen/primitives'
import { ScreenHeader } from '@/components/lumen/ScreenHeader'
import { AdminDashboardPage } from './AdminDashboardPage'
import { AdminSignalementsPage } from './AdminSignalementsPage'
import { AdminUtilisateursPage } from './AdminUtilisateursPage'

const SIGNALEMENTS_INITIAUX = [
  { id: 'montre', titre: 'Annonce « Montre de luxe »', detail: 'Signalée 3 fois · contenu suspect', urgence: 'Urgent' },
  { id: 'litige-482', titre: 'Litige #482', detail: 'Colis non reçu · Tom ↔ Lilou', urgence: 'Ouvert' },
  { id: 'bijoux', titre: 'Annonce « Bijoux de luxe »', detail: 'Signalée par Lilou, Max, Noa', urgence: 'Urgent' },
  { id: 'ventepromo', titre: 'Profil « ventepromo »', detail: 'Spam · signalé 2 fois', urgence: 'Ouvert' },
  { id: 'litige-146', titre: 'Litige #146', detail: 'Colis non reçu', urgence: 'Ouvert' },
]

// Section statique (pas d'entité "Administration" côté backend) : reprend
// le Figma 14 — BACK-OFFICE ADMIN. La maquette ne dessine QUE des frames
// desktop pour cette section (pas de "M ·"), mais l'écran suit le même
// principe mobile-first que tout le reste de Lumen : listes empilées
// (Row/Card) en mobile, classes `md:` pour l'enrichir au-delà — pas de
// mise en page "tableau desktop" dédiée.
//
// La sidebar du Figma liste aussi "Ventes" et "Catégories" : non
// construits ici (pas de contenu propre dans la maquette au-delà de ce
// qui existe déjà dans la vraie section Ventes), affichés en onglets
// inertes pour garder les repères visuels, même schéma que les onglets
// "Tenues"/"Profil" désactivés dans la nav principale au tout début du
// projet.
export function AdminSection({ onBack }) {
  const [tab, setTab] = useState('dashboard') // 'dashboard' | 'utilisateurs' | 'signalements'
  const [signalements, setSignalements] = useState(SIGNALEMENTS_INITIAUX)

  function ignorer(id) {
    setSignalements((prev) => prev.filter((s) => s.id !== id))
  }

  function retirer(id) {
    setSignalements((prev) => prev.filter((s) => s.id !== id))
  }

  const TITLE = {
    dashboard: ['Tableau de bord', "Vue d'ensemble de Lumen"],
    utilisateurs: ['Utilisateurs', '1 284 comptes'],
    signalements: ['Signalements', `${signalements.length} à traiter`],
  }

  return (
    <div className="flex flex-1 flex-col pb-10">
      <ScreenHeader title={TITLE[tab][0]} subtitle={TITLE[tab][1]} onBack={onBack} />

      <div className="space-y-5 px-6 py-5 md:px-10">
        <div className="flex flex-wrap gap-2">
          <Chip active={tab === 'dashboard'} onClick={() => setTab('dashboard')}>
            Tableau de bord
          </Chip>
          <Chip active={tab === 'utilisateurs'} onClick={() => setTab('utilisateurs')}>
            Utilisateurs
          </Chip>
          <Chip active={tab === 'signalements'} onClick={() => setTab('signalements')}>
            Signalements {signalements.length}
          </Chip>
          <Chip onClick={() => {}}>Ventes</Chip>
          <Chip onClick={() => {}}>Catégories</Chip>
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
