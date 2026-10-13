export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

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

async function request(method, path, { token, profilId, body } = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: token ? authHeaders(token, profilId) : { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
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
