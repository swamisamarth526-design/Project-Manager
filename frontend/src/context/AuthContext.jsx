import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('tf_token') || null)
  const [loading, setLoading] = useState(true)

  // On mount: verify stored token
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) { setLoading(false); return }
      try {
        const { data } = await api.get('/auth/me')
        setUser(data.user)
      } catch {
        // Token invalid/expired — clear it
        localStorage.removeItem('tf_token')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    verifyToken()
  }, [token])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('tf_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('tf_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('tf_token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook for consuming auth context
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
