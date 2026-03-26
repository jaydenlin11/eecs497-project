import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [parent, setParent] = useState(null)
  const [childProfiles, setChildProfiles] = useState([])
  const [activeChild, setActiveChildState] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('activeChild')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  // Persist token changes
  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  // Persist activeChild in sessionStorage
  const setActiveChild = useCallback((child) => {
    setActiveChildState(child)
    if (child) sessionStorage.setItem('activeChild', JSON.stringify(child))
    else sessionStorage.removeItem('activeChild')
  }, [])

  const refreshChildren = useCallback(async () => {
    const kids = await api.getChildren()
    setChildProfiles(kids)
    return kids
  }, [])

  // On mount: verify token and load parent + children
  useEffect(() => {
    if (!token) { setLoading(false); return }
    ;(async () => {
      try {
        const [me, kids] = await Promise.all([api.getMe(), api.getChildren()])
        setParent(me)
        setChildProfiles(kids)
      } catch {
        // Token invalid — clear everything
        setToken(null)
        setParent(null)
        setChildProfiles([])
        setActiveChild(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password })
    localStorage.setItem('token', data.token) // write synchronously before next API call
    setToken(data.token)
    setParent(data.parent)
    const kids = await api.getChildren()
    setChildProfiles(kids)
    return kids
  }, [])

  const register = useCallback(async (formData) => {
    const data = await api.register(formData)
    localStorage.setItem('token', data.token) // write synchronously before next API call
    setToken(data.token)
    setParent(data.parent)
    const kids = await api.getChildren()
    setChildProfiles(kids)
    return kids
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setParent(null)
    setChildProfiles([])
    setActiveChild(null)
  }, [setActiveChild])

  return (
    <AuthContext.Provider value={{
      token, parent, childProfiles, activeChild,
      loading,
      login, register, logout,
      setActiveChild, refreshChildren,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
