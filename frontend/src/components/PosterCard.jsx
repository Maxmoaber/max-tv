import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getGenreNames } from '../utils/genres'
import { api, BACKEND } from '../utils/api'

export default function PosterCard({ item, onClick }){
  const { token } = useAuth()
  const { addToast } = useToast()
  const [hover, setHover] = useState(false)
  const [miniSrc, setMiniSrc] = useState(null)
  const [muted, setMuted] = useState(true)
  const [showOverlay, setShowOverlay] = useState(true)
  const [isFav, setIsFav] = useState(false)
  const [favId, setFavId] = useState(null)
  const [favLoading, setFavLoading] = useState(false)
  const hoverTimer = useRef()
  const fetchTimer = useRef()
  const idleTimer = useRef()

  useEffect(() => { if(!hover){ setMiniSrc(null); setShowOverlay(true) } }, [hover])

  const resetIdle = () => {
    clearTimeout(idleTimer.current)
    setShowOverlay(true)
    idleTimer.current = setTimeout(() => setShowOverlay(false), 2500)
  }

  const startHover = ()=>{
    hoverTimer.current = setTimeout(()=>{
      setHover(true)
      setShowOverlay(true)
      resetIdle()
      fetchTimer.current = setTimeout(async ()=>{
        if(miniSrc) return
        try{
          const base = BACKEND.replace(/\/$/,'')
          const route = item.mediaType==='tv' ? 'tv' : 'movie'
          const r = await api.get(`${base}/api/tmdb/${route}/${item.id}`)
          if(r.data && r.data.trailerKey){
            setMiniSrc(`https://www.youtube.com/embed/${r.data.trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${r.data.trailerKey}`)
          }
        }catch(e){}
      },400)
    },200)
  }

  const endHover = ()=>{
    clearTimeout(hoverTimer.current)
    clearTimeout(fetchTimer.current)
    clearTimeout(idleTimer.current)
    setHover(false)
    setShowOverlay(true)
  }

  const handleMouseMove = () => { if(hover) resetIdle() }

  const toggleFav = async (e) => {
    e.stopPropagation()
    if(!token || favLoading) return
    setFavLoading(true)
    const base = BACKEND.replace(/\/$/,'')
    try{
      if(isFav && favId){
        await api.delete(`${base}/api/favorites/${favId}`, { headers: { Authorization: `Bearer ${token}` } })
        setIsFav(false)
        setFavId(null)
        addToast('Eliminado de favoritos', 'info')
      }else{
        const r = await api.post(`${base}/api/favorites`, {
          tmdbId: item.id, mediaType: item.mediaType, title: item.title, poster: item.poster
        }, { headers: { Authorization: `Bearer ${token}` } })
        setIsFav(true)
        setFavId(r.data.id)
        addToast('Agregado a favoritos', 'success')
      }
    }catch(e){
      addToast('Error al guardar favorito', 'error')
    }
    setFavLoading(false)
  }

  const imgSrc = item.poster || item.poster_path || item.backdrop || '/placeholder.png'

  return (
    <div
      className={`flex-shrink-0 transition-all duration-300 ease-out cursor-pointer ${hover ? 'w-[360px] z-30' : 'w-[170px] z-10'}`}
      onClick={()=> onClick && onClick(item)}
      onMouseEnter={startHover}
      onMouseLeave={endHover}
      onMouseMove={handleMouseMove}
    >
      <div className="relative overflow-hidden rounded-xl bg-[#121a24] w-full h-[255px] ring-1 ring-white/10">
        {/* poster */}
        <img
          src={imgSrc}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover rounded-xl"
          loading="lazy"
        />

        {/* trailer */}
        {miniSrc && hover && (
          <div className="absolute inset-0 z-10 rounded-xl overflow-hidden">
            <iframe key={String(muted)} src={miniSrc.replace('mute=1', muted ? 'mute=1' : 'mute=0')} frameBorder="0" allow="autoplay; encrypted-media" className="absolute inset-0 w-full h-full pointer-events-none"></iframe>
            <div className="absolute inset-0 bg-black/5"></div>
          </div>
        )}

        {/* overlay (auto-hide after 2.5s idle) */}
        {hover && showOverlay && (
          <div className="absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/10 to-transparent p-4 transition-opacity duration-200">
            {miniSrc && (
              <button
                onClick={(e)=>{ e.stopPropagation(); setMuted(v => !v) }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
              >
                {muted ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                )}
              </button>
            )}
            <div className="text-white font-semibold text-sm leading-tight mb-1 flex items-center gap-2">
              {item.title}
              {item.vote_average > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] text-[#ffd700] font-normal">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  {item.vote_average.toFixed(1)}
                </span>
              )}
            </div>
            {item.genre_ids && item.genre_ids.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {getGenreNames(item.genre_ids).slice(0, 2).map(name => (
                  <span key={name} className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-white/10 text-gray-300">
                    {name}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={onClick ? (e) => { e.stopPropagation(); onClick(item) } : undefined}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#e50914] hover:bg-[#f6121d] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                Ver
              </button>
              <button
                onClick={toggleFav}
                disabled={favLoading}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                  isFav
                    ? 'bg-[#e50914]/20 border-[#e50914] text-[#e50914]'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <svg className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                {isFav ? 'Guardado' : 'Favoritos'}
              </button>
            </div>
          </div>
        )}

        {/* badges */}
        {!hover && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
            <div className="bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white">
              {item.mediaType === 'tv' ? 'TV' : '4K'}
            </div>
            {item.vote_average > 0 && (
              <div className="bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-semibold text-[#ffd700] flex items-center gap-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {item.vote_average.toFixed(1)}
              </div>
            )}
          </div>
        )}

        {/* bookmark */}
        {isFav && !hover && (
          <div className="absolute top-2 right-2 z-10">
            <svg className="w-5 h-5 text-[#e50914]" fill="currentColor" viewBox="0 0 24 24"><path d="M5 4a2 2 0 00-2 2v14l9-4 9 4V6a2 2 0 00-2-2H5z"/></svg>
          </div>
        )}
      </div>
    </div>
  )
}
