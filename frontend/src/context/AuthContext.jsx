import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, BACKEND } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if(!token) { setLoading(false); return }
    api.get(`${BACKEND}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setUser(r.data))
      .catch(() => { localStorage.removeItem('token'); setToken(null) })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const r = await api.post(`${BACKEND}/api/auth/login`, { email, password })
    localStorage.setItem('token', r.data.token)
    setToken(r.data.token)
    setUser(r.data.user)
    return r.data
  }, [])

  const register = useCallback(async (email, password) => {
    const r = await api.post(`${BACKEND}/api/auth/register`, { email, password })
    localStorage.setItem('token', r.data.token)
    setToken(r.data.token)
    setUser(r.data.user)
    return r.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){ return useContext(AuthContext) }
