import { Boxes, Building2, Home, Shirt, User } from 'lucide-react'

// Seul "accueil" est construit pour le moment (section 02 du Figma). Les
// autres apparaissent déjà dans la nav pour garder les repères visuels du
// Figma, mais restent inertes tant que leur section n'existe pas.
export const NAV_ITEMS = [
  { screen: 'accueil', icon: Home, label: 'Accueil', ready: true },
  { screen: 'inventaire', icon: Boxes, label: 'Inventaire', ready: false },
  { screen: 'logements', icon: Building2, label: 'Logements', ready: false },
  { screen: 'tenues', icon: Shirt, label: 'Tenues', ready: false },
  { screen: 'profil', icon: User, label: 'Profil', ready: false },
]
