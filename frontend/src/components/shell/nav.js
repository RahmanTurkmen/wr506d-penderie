import { Boxes, Building2, Home, Shirt, User } from 'lucide-react'

// Les sections pas encore construites apparaissent déjà dans la nav pour
// garder les repères visuels du Figma, mais restent inertes.
export const NAV_ITEMS = [
  { screen: 'accueil', icon: Home, label: 'Accueil', ready: true },
  { screen: 'inventaire', icon: Boxes, label: 'Inventaire', ready: true },
  { screen: 'logements', icon: Building2, label: 'Logements', ready: true },
  { screen: 'tenues', icon: Shirt, label: 'Tenues', ready: false },
  { screen: 'profil', icon: User, label: 'Profil', ready: false },
]
