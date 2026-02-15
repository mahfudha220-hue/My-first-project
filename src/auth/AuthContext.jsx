import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('auth_user')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function bootstrapAuth() {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const currentUser = await apiRequest('/api/auth/me')
        setUser(currentUser)
        localStorage.setItem('auth_user', JSON.stringify(currentUser))
      } catch {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    bootstrapAuth()
  }, [])

  useEffect(() => {
    function onForcedLogout() {
      setUser(null)
    }
    window.addEventListener('auth:logout', onForcedLogout)
    return () => window.removeEventListener('auth:logout', onForcedLogout)
  }, [])

  async function login(username, password, role) {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
      auth: false
    })
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('auth_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  async function logout() {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore logout failures and clear local auth anyway.
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      setUser(null)
    }
  }

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, logout }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
