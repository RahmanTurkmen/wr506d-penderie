export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const TOKEN_KEY = 'lumen.auth.token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* localStorage indisponible (navigation privée...) — on continue sans persister */
  }
}

async function postJson(path, body) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    return { ok: false, status: 0, data: { error: 'Impossible de contacter le serveur. Vérifie ta connexion.' } }
  }

  let data = {}
  try {
    data = await res.json()
  } catch {
    /* réponse vide (ex. 204) */
  }
  return { ok: res.ok, status: res.status, data }
}

export function login(email, password) {
  return postJson('/api/login', { email, password })
}

export function register(email, password, nom) {
  return postJson('/api/register', { email, password, nom })
}
