/*
 * ====================================================================
 *  AuthContext.jsx — Contexto de autenticación (React Context API)
 * ====================================================================
 *
 *  ¿Qué es React Context?
 *    Es una forma de compartir datos entre componentes sin tener que
 *    pasarlos manualmente por props. Aquí usamos Context para que
 *    cualquier componente pueda acceder a la información del usuario
 *    autenticado (token, email, etc.) sin importar su profundidad.
 *
 *  Este contexto provee:
 *    - user:    Objeto con datos del usuario (null si no autenticado)
 *    - token:   JWT almacenado en localStorage
 *    - loading: Indica si se está verificando la sesión
 *    - login(email, password):    Inicia sesión
 *    - register(email, password): Registra un nuevo usuario
 *    - logout():                   Cierra la sesión
 *
 *  Flujo de autenticación:
 *    1. Al cargar la app, si hay un token en localStorage, se verifica
 *       contra GET /api/auth/me.
 *    2. Si el token es válido, se guarda el usuario en el estado.
 *    3. Si no es válido, se limpia el token y se redirige al login.
 *    4. login() y register() guardan el token en localStorage y
 *       actualizan el estado global.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, BACKEND } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Al montar el componente, verificar si hay sesión activa
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

// Hook personalizado para consumir el contexto
export function useAuth(){ return useContext(AuthContext) }
