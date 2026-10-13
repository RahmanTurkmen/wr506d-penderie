// En dev, l'API tourne sur le même hôte que la page (nginx expose le port
// 8080). On se base sur l'hôte réellement utilisé pour charger la page
// plutôt que sur un "localhost" figé : indispensable pour tester depuis un
// téléphone sur le même réseau (ex. http://192.168.1.23:5173), où
// "localhost" désignerait le téléphone lui-même, pas le PC qui héberge l'API.
function defaultApiUrl() {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:8080`
  }
  return 'http://localhost:8080'
}

export const API_URL = import.meta.env.VITE_API_URL || defaultApiUrl()

// Les photos d'objets sont renvoyées en chemin relatif (ex. "/uploads/objets/xxx.jpg"),
// servi statiquement par nginx sur le même hôte que l'API.
export function photoUrl(path) {
  return path ? `${API_URL}${path}` : null
}

const TOKEN_KEY = 'lumen.auth.token'
const PROFIL_KEY = 'lumen.auth.profilId'

function readStorage(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key, value) {
  try {
    if (value) localStorage.setItem(key, value)
    else localStorage.removeItem(key)
  } catch {
    /* localStorage indisponible (navigation privée...) — on continue sans persister */
  }
}

export function getToken() {
  return readStorage(TOKEN_KEY)
}

export function setToken(token) {
  writeStorage(TOKEN_KEY, token)
}

export function getStoredProfilId() {
  return readStorage(PROFIL_KEY)
}

export function setStoredProfilId(id) {
  writeStorage(PROFIL_KEY, id)
}

function authHeaders(token, profilId) {
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  if (profilId) headers['X-Profil-Id'] = profilId
  return headers
}

async function request(method, path, { token, profilId, body, formData } = {}) {
  let res
  try {
    const headers = token ? authHeaders(token, profilId) : { 'Content-Type': 'application/json' }
    if (formData) delete headers['Content-Type'] // le navigateur fixe le boundary multipart lui-même
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
    })
  } catch {
    return { ok: false, status: 0, data: { error: 'Impossible de contacter le serveur. Vérifie ta connexion.' } }
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    /* réponse vide (ex. 204) */
  }
  return { ok: res.ok, status: res.status, data }
}

export function login(email, password) {
  return request('POST', '/api/login', { body: { email, password } })
}

export function register(email, password, nom) {
  return request('POST', '/api/register', { body: { email, password, nom } })
}

export function listProfils(token) {
  return request('GET', '/api/profils', { token })
}

export function listObjets(token, profilId) {
  return request('GET', '/api/objets', { token, profilId })
}

export function listPrets(token, profilId, objetId) {
  return request('GET', `/api/objets/${objetId}/prets`, { token, profilId })
}

export function createPret(token, profilId, objetId, emprunteurNom, dateFinPrevue) {
  return request('POST', `/api/objets/${objetId}/prets`, { token, profilId, body: { emprunteurNom, dateFinPrevue } })
}

export function updateObjetStatut(token, profilId, objetId, statut) {
  return request('PATCH', `/api/objets/${objetId}/statut`, { token, profilId, body: { statut } })
}

export function createObjet(token, profilId, payload, photoFile) {
  if (!photoFile) {
    return request('POST', '/api/objets', { token, profilId, body: payload })
  }
  const formData = new FormData()
  formData.append('nom', payload.nom)
  formData.append('type', payload.type)
  formData.append('categorieId', payload.categorieId)
  if (payload.pieceId) formData.append('pieceId', payload.pieceId)
  if (payload.conteneurId) formData.append('conteneurId', payload.conteneurId)
  for (const tagId of payload.tagIds ?? []) formData.append('tagIds[]', tagId)
  formData.append('photo', photoFile)
  return request('POST', '/api/objets', { token, profilId, formData })
}

export function listCategories(token, profilId) {
  return request('GET', '/api/categories', { token, profilId })
}

export function createCategorie(token, profilId, nom) {
  return request('POST', '/api/categories', { token, profilId, body: { nom } })
}

export function listTags(token, profilId) {
  return request('GET', '/api/tags', { token, profilId })
}

export function createTag(token, profilId, nom) {
  return request('POST', '/api/tags', { token, profilId, body: { nom } })
}

export function listLogements(token, profilId) {
  return request('GET', '/api/logements', { token, profilId })
}

export function createLogement(token, profilId, nom) {
  return request('POST', '/api/logements', { token, profilId, body: { nom } })
}

export function createPiece(token, profilId, logementId, nom) {
  return request('POST', `/api/logements/${logementId}/pieces`, { token, profilId, body: { nom } })
}

export function listPieces(token, profilId, logementId) {
  return request('GET', `/api/logements/${logementId}/pieces`, { token, profilId })
}

export function createConteneur(token, profilId, pieceId, nom) {
  return request('POST', `/api/pieces/${pieceId}/conteneurs`, { token, profilId, body: { nom } })
}

export function scanObjet(token, profilId, file) {
  const formData = new FormData()
  formData.append('photo', file)
  return request('POST', '/api/objets/scan', { token, profilId, formData })
}
