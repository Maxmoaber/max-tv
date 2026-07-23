/*
 * ====================================================================
 *  Auth.jsx — Página de inicio de sesión y registro
 * ====================================================================
 *
 *  Esta página permite al usuario:
 *    - Iniciar sesión con email y contraseña
 *    - Crear una cuenta nueva
 *
 *  Tiene dos modos que se alternan con tabs: 'login' y 'register'.
 *  Al enviar el formulario, llama a AuthContext.login() o .register()
 *  que internamente hacen peticiones POST al backend.
 *
 *  Si el usuario ya está autenticado, redirige automáticamente al home.
 *
 *  Validaciones:
 *    - Email y contraseña obligatorios
 *    - Contraseña mínimo 6 caracteres
 *    - Muestra errores del backend (ej. "Email already exists")
 */

import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Auth(){
  const { user, login, register } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Si ya está autenticado, redirigir al home
  if(user){ navigate('/'); return null }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if(!email || !password) { setError('Completa todos los campos'); return }
    if(password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)
    try{
      if(mode === 'login') {
        await login(email, password)
        addToast('Sesión iniciada correctamente', 'success')
      } else {
        await register(email, password)
        addToast('Cuenta creada correctamente', 'success')
      }
      navigate('/')
    }catch(err){
      setError(err.response?.data?.error || err.message || 'Error de conexión')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage:'radial-gradient(circle at 25% 25%, #e50914 0%, transparent 50%), radial-gradient(circle at 75% 75%, #e50914 0%, transparent 50%)'}}></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl font-extrabold text-[#e50914] no-underline">Max.tv</Link>
          <p className="text-gray-400 text-sm mt-2">
            {mode === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta gratis'}
          </p>
        </div>

        <div className="bg-gradient-to-b from-[#121a24] to-[#0f1923] rounded-2xl border border-[#1e2a36] p-8 shadow-2xl">
          {/* Tabs para cambiar entre login y registro */}
          <div className="flex mb-6 bg-[#0a0e14] rounded-lg p-1">
            <button onClick={()=>{ setMode('login'); setError('') }} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'login' ? 'bg-[#e50914] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Iniciar sesión</button>
            <button onClick={()=>{ setMode('register'); setError('') }} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'register' ? 'bg-[#e50914] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Crear cuenta</button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5">Email</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0a0e14] border border-[#1e2a36] text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] transition-all text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5">Contraseña</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0a0e14] border border-[#1e2a36] text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] transition-all text-sm" />
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="bg-[#e50914]/10 border border-[#e50914]/30 rounded-lg px-4 py-2.5 text-sm text-[#e50914] flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-3 bg-[#e50914] hover:bg-[#f6121d] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#e50914]/20">
              {loading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            Al continuar, aceptas nuestros <span className="text-gray-400 hover:text-white cursor-pointer">Términos de uso</span> y <span className="text-gray-400 hover:text-white cursor-pointer">Política de privacidad</span>.
          </div>
        </div>
      </div>
    </div>
  )
}
