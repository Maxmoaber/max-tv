import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PosterCard from '../components/PosterCard'
import ModalDetail from '../components/ModalDetail'
import { SkeletonGrid } from '../components/Skeleton'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4001'

export default function Favorites(){
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(()=>{
    if(!token) { navigate('/auth'); return }
    async function load(){
      try{
        const r = await axios.get(`${BACKEND}/api/favorites`, { headers: { Authorization: `Bearer ${token}` } })
        const mapped = r.data.map(f => ({
          id: f.tmdbId,
          title: f.title,
          mediaType: f.mediaType,
          poster: f.poster,
          favoriteId: f.id
        }))
        setItems(mapped)
      }catch(e){ console.error(e) }
      setLoading(false)
    }
    load()
  }, [token])

  const filtered = items.filter(i => {
    if (filterType !== 'all' && i.mediaType !== filterType) return false
    if (searchQuery && !i.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  if(!user) return null

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Mis Favoritos</h1>
            <p className="text-gray-400 text-sm mt-1">{items.length} {items.length === 1 ? 'título guardado' : 'títulos guardados'}</p>
          </div>
          <Link to="/" className="px-4 py-2 rounded-lg bg-[#1a2533] hover:bg-[#253545] transition-colors text-sm text-gray-300 hover:text-white flex items-center gap-2 no-underline self-start">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            Volver
          </Link>
        </div>

        {!loading && items.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar en favoritos..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#121a24] border border-[#1e2a36] text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914] text-sm"
              />
            </div>
            <div className="flex gap-1 bg-[#121a24] rounded-lg p-1 self-start">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'movie', label: 'Películas' },
                { value: 'tv', label: 'Series' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilterType(opt.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    filterType === opt.value
                      ? 'bg-[#e50914] text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <SkeletonGrid count={8} />
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#121a24] flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">No tienes favoritos</h3>
            <p className="text-gray-400 text-sm mb-6">Explora películas y series y guárdalas aquí</p>
            <Link to="/" className="px-6 py-2.5 bg-[#e50914] hover:bg-[#f6121d] text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2 no-underline">
              Explorar contenido
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#121a24] flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Sin resultados</h3>
            <p className="text-gray-400 text-sm">No hay favoritos que coincidan con tu búsqueda</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {filtered.map(i => (
              <PosterCard key={`${i.id}-${i.mediaType}`} item={i} onClick={(item)=> setSelected(item)} />
            ))}
          </div>
        )}
      </div>
      {selected && <ModalDetail item={selected} onClose={()=>setSelected(null)} />}
      <Footer />
    </div>
  )
}
