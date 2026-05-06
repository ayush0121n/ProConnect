import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/services'

const AuthContext = createContext()

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { checkAuth() }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const res = await authService.getMe()
        setUser(res.data)
      }
    } catch { localStorage.removeItem('token') }
    finally { setLoading(false) }
  }

  const login = async (credentials) => {
    const res = await authService.login(credentials)
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  const register = async (data) => {
    const res = await authService.register(data)
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  const logout = async () => {
    try { await authService.logout() } catch {}
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateUser = (data) => setUser(prev => ({ ...prev, ...data }))

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout, updateUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
