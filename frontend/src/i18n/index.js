import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

export const NAMESPACES = [
  'common',
  'auth',
  'home',
  'shell',
  'inventory',
  'logements',
  'prets',
  'tenues',
  'validations',
  'profil',
  'admin',
  'amis',
  'ventes',
  'collections',
  'filActualite',
  'notifications',
  'achat',
  'partage',
]

const modules = import.meta.glob('./locales/*/*.json', { eager: true })

function buildResources() {
  const resources = {}
  for (const path in modules) {
    const match = path.match(/\.\/locales\/([a-z]{2})\/([A-Za-z]+)\.json$/)
    if (!match) continue
    const [, locale, ns] = match
    resources[locale] ??= {}
    resources[locale][ns] = modules[path].default
  }
  return resources
}

export const SUPPORTED_LOCALES = ['fr', 'en', 'ar']
export const RTL_LOCALES = ['ar']
const STORAGE_KEY = 'lumen.locale'

export function getStoredLocale() {
  const stored = localStorage.getItem(STORAGE_KEY)
  return SUPPORTED_LOCALES.includes(stored) ? stored : 'fr'
}

export function isRtl(locale) {
  return RTL_LOCALES.includes(locale)
}

export function applyDocumentDirection(locale) {
  document.documentElement.lang = locale
  document.documentElement.dir = isRtl(locale) ? 'rtl' : 'ltr'
}

export function setLocale(locale) {
  localStorage.setItem(STORAGE_KEY, locale)
  applyDocumentDirection(locale)
  i18n.changeLanguage(locale)
}

const initialLocale = getStoredLocale()
applyDocumentDirection(initialLocale)

i18n.use(initReactI18next).init({
  lng: initialLocale,
  fallbackLng: 'fr',
  defaultNS: 'common',
  ns: NAMESPACES,
  resources: buildResources(),
  interpolation: { escapeValue: false },
})

export default i18n
