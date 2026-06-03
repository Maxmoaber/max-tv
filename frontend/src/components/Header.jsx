import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Header({ onSearchResult }){
  const { user, logout } = useAuth()
  const { addToast } = useToast()
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [focused, setFocused] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(()=>{
    if (!q) { setResults([]); return }
    const t = setTimeout(async ()=>{
      try{
        const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4001'
        const r = await axios.get(`${base}/api/tmdb/search?q=${encodeURIComponent(q)}`)
        setResults(r.data.slice(0,8))
        if (onSearchResult) onSearchResult(r.data)
      }catch(e){ setResults([]) }
    },300)
    return ()=>clearTimeout(t)
  },[q])

  return (
    <header className="bg-gradient-to-r from-[#0a0e14] to-[#121a24] text-white shadow-lg sticky top-0 z-40 border-b border-[#1e2a36]">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-8">
        <Link to="/" className="text-3xl font-extrabold tracking-tight text-[#e50914] flex-shrink-0 no-underline">Max.tv</Link>

        <div className="flex-1 relative max-w-xl">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input value={q} onChange={e=>setQ(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setTimeout(()=>setFocused(false),200)} placeholder="Buscar películas, series, actores..." className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#1a2533] border border-[#2a3a4a] text-white placeholder-gray-400 focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] transition-all text-sm" />
          </div>
          {focused && q && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#0f1923] border border-[#1e2a36] rounded-xl shadow-2xl overflow-hidden z-50">
              {results.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#1a2533] flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </div>
                  No se encontraron resultados para "{q}"
                </div>
              ) : results.map(r=> (
                <div key={`${r.mediaType}-${r.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[#1a2533] cursor-pointer transition-colors border-b border-[#1a2533] last:border-0">
                  <img src={r.poster || '/placeholder.png'} alt="" className="w-10 h-14 object-cover rounded flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{r.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-1.5 py-0.5 text-[10px] uppercase font-semibold rounded bg-[#1a2533] text-gray-300">{r.mediaType}</span>
                      {r.overview && <span className="text-xs text-gray-400 truncate">{r.overview.slice(0,60)}...</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <nav className="flex items-center gap-4 text-sm flex-shrink-0">
          <Link to="/favorites" className="px-4 py-2 rounded-lg bg-[#1a2533] hover:bg-[#253545] transition-colors flex items-center gap-2 no-underline text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
            Favoritos
          </Link>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(v => !v)}
                onBlur={() => setTimeout(() => setShowMenu(false), 150)}
                className="w-8 h-8 rounded-full bg-[#e50914] flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-white/30 transition-all"
              >
                {user.email.charAt(0).toUpperCase()}
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#0f1923] border border-[#1e2a36] rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-[#1e2a36]">
                    <div className="text-sm text-white font-medium truncate">{user.email}</div>
                  </div>
                  <Link to="/favorites" onClick={() => setShowMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-[#1a2533] transition-colors no-underline">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                    Mis Favoritos
                  </Link>
                  <button onClick={()=>{ logout(); addToast('Sesión cerrada', 'info'); setShowMenu(false) }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-[#1a2533] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="px-4 py-2 rounded-lg bg-[#e50914] hover:bg-[#f6121d] transition-colors font-semibold flex items-center gap-2 no-underline text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
