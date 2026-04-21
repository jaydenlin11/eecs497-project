const BASE = '/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || 'Request failed')
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  // Children
  getChildren: () => request('/children'),
  createChild: (data) => request('/children', { method: 'POST', body: JSON.stringify(data) }),
  updateChild: (id, data) => request(`/children/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteChild: (id) => request(`/children/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  verifyPin: (pin) => request('/settings/verify-pin', { method: 'POST', body: JSON.stringify({ pin }) }),
  setPin: (pin) => request('/settings/set-pin', { method: 'POST', body: JSON.stringify({ pin }) }),

  // Sessions
  createSession: (data) => request('/sessions', { method: 'POST', body: JSON.stringify(data) }),

  // High scores
  getHighScore: (childId, game) => request(`/high-scores/${childId}/${game}`),
  updateHighScore: (data) => request('/high-scores', { method: 'POST', body: JSON.stringify(data) }),

  // XP
  getChildXp: (childId) => request(`/xp/${childId}`),
  spendForestEntryXp: (childId) => request('/xp/spend-forest-entry', { method: 'POST', body: JSON.stringify({ child_id: childId }) }),

  // Insights & screen time
  getInsights: (childId) => request(`/insights/${childId}`),
  getScreenTime: (childId) => request(`/screen-time/${childId}`),
}
