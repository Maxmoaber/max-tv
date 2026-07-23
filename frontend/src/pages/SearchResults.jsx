/*
 * ====================================================================
 *  SearchResults.jsx — Página de resultados de búsqueda
 * ====================================================================
 *
 *  Esta página se muestra cuando el usuario navega a /search?q=...
 *  (desde la barra de búsqueda del Header).
 *
 *  Funcionalidad:
 *    1. Lee el parámetro 'q' de la URL usando useSearchParams()
 *    2. Si hay idioma especificado (?lang=), lo usa; si no, español
 *    3. Llama a /api/tmdb/search?q=... con debounce de 300ms
 *    4. Muestra resultados en grilla con pósters, título, puntuación
 *    5. Botón para cambiar idioma (es-ES / en-US)
 *
 *  Diferencias con la búsqueda del Header:
 *    - Header: búsqueda inline con dropdown de sugerencias (máx 8)
 *    - SearchResults: página completa con todos los resultados
 */

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, BACKEND } from '../utils/api'
import Header from '../components/Header'

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [language, setLanguage] = useState(searchParams.get('lang') || 'es-ES')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  // Búsqueda con debounce de 300ms para evitar llamadas innecesarias
  useEffect(() => {
    if (!q) { setResults([]); return }
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const base = BACKEND.replace(/\/$/, '')
        const r = await api.get(`${base}/api/tmdb/search?q=${encodeURIComponent(q)}&language=${language}`)
        setResults(r.data)
      } catch (e) {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [q, language])

  const toggleLanguage = () => {
    const newLang = language === 'es-ES' ? 'en-US' : 'es-ES'
    setLanguage(newLang)
    setSearchParams({ q, lang: newLang })
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-white">
            {q ? `Resultados para "${q}"` : 'Buscar'}
          </h1>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 rounded-lg bg-[#1a2533] border border-[#2a3a4a] text-sm text-gray-300 hover:bg-[#253545] hover:text-white transition-colors flex items-center gap-2"
          >
            <span className="text-base">{language === 'es-ES' ? '🇪🇸' : '🇺🇸'}</span>
            {language === 'es-ES' ? 'Español' : 'English'}
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-8">
          {results.length > 0 && `${results.length} resultados encontrados`}
        </p>

        {/* Skeleton de carga */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-[#0f1923] border border-[#1e2a36] overflow-hidden animate-pulse">
                <div className="aspect-[2/3] bg-[#1a2533]" />
                <div className="p-3">
                  <div className="h-4 bg-[#1a2533] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#1a2533] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sin resultados */}
        {!loading && results.length === 0 && q && (
          <div className="text-center py-20 text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1a2533] flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            No se encontraron resultados para "{q}"
          </div>
        )}

        {/* Grilla de resultados */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {results.map(item => (
              <div
                key={`${item.mediaType}-${item.id}`}
                className="rounded-lg bg-[#0f1923] border border-[#1e2a36] overflow-hidden hover:border-[#e50914] transition-colors"
              >
                <img
                  src={item.poster || '/placeholder.png'}
                  alt={item.title}
                  className="w-full aspect-[2/3] object-cover"
                />
                <div className="p-3">
                  <h3 className="text-white font-semibold text-sm truncate mb-1">{item.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-1.5 py-0.5 text-[10px] uppercase font-semibold rounded bg-[#1a2533] text-gray-300">
                      {item.mediaType}
                    </span>
                    {item.raw?.vote_average > 0 && (
                      <span className="text-xs text-yellow-400">
                        ★ {item.raw.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                    {item.overview || 'Sin descripción disponible.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
