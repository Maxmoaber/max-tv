import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4001'
const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if(!token) { setLoading(false); return }
    axios.get(`${BACKEND}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setUser(r.data))
      .catch(() => { localStorage.removeItem('token'); setToken(null) })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const r = await axios.post(`${BACKEND}/api/auth/login`, { email, password })
    localStorage.setItem('token', r.data.token)
    setToken(r.data.token)
    setUser(r.data.user)
    return r.data
  }, [])

  const register = useCallback(async (email, password) => {
    const r = await axios.post(`${BACKEND}/api/auth/register`, { email, password })
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
