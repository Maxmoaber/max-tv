import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Carousel from '../components/Carousel'
import ModalDetail from '../components/ModalDetail'
import { SkeletonCarousel, SkeletonHero } from '../components/Skeleton'
import { getDemoTrending, getDemoGenre } from '../utils/demoData'
import { api, BACKEND } from '../utils/api'

function Hero({ items, onMoreInfo }){
  const [idx, setIdx] = useState(0)
  const [trailerKey, setTrailerKey] = useState(null)
  const item = items?.[idx]
  if(!item) return null

  const next = ()=> setIdx(i => (i+1) % items.length)
  const prev = ()=> setIdx(i => (i-1+items.length) % items.length)
  const bg = item.backdrop || item.poster

  useEffect(() => {
    let mounted = true
    setTrailerKey(null)
    async function loadTrailer(){
      try{
        const base = BACKEND.replace(/\/$/,'')
        const route = item.mediaType==='tv' ? 'tv' : 'movie'
        const r = await api.get(`${base}/api/tmdb/${route}/${item.id}`)
        if(mounted && r.data?.trailerKey) setTrailerKey(r.data.trailerKey)
      }catch(e){}
    }
    loadTrailer()
    return ()=> { mounted = false }
  }, [item.id, item.mediaType])

  return (
    <div className="hero relative overflow-hidden">
      {trailerKey ? (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&showinfo=0&rel=0&iv_load_policy=3`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] pointer-events-none"
            style={{ filter: 'brightness(0.6)' }}
            allow="autoplay; encrypted-media"
            title="bg"
          />
        </div>
      ) : (
        <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      )}
      <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(180deg, rgba(10,14,20,0.2) 0%, rgba(10,14,20,0.7) 60%, #0a0e14 100%)' }} />
      <div className="hero-inner z-[2] relative">
        <div className="flex items-center gap-2 mb-2">
          {items.slice(0,4).map((_,i)=>(
            <button key={i} onClick={()=>setIdx(i)} className={`h-1 rounded-full transition-all duration-300 ${i===idx ? 'w-8 bg-[#e50914]' : 'w-4 bg-white/40 hover:bg-white/60'}`} />
          ))}
        </div>
        <h1 className="text-white font-extrabold leading-tight text-2xl md:text-4xl lg:text-5xl drop-shadow-lg">{item.title}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="px-2 py-0.5 bg-[#e50914] text-white text-[10px] font-bold uppercase rounded">
            {item.mediaType === 'tv' ? 'SERIE' : 'PELÍCULA'}
          </span>
          <span className="text-xs md:text-sm text-gray-300">2026</span>
          {item.vote_average > 0 && (
            <span className="flex items-center gap-1 text-xs md:text-sm text-[#ffd700]">
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {item.vote_average.toFixed(1)}
            </span>
          )}
        </div>
        <p className="mt-3 max-w-2xl text-sm md:text-base text-gray-200 leading-relaxed line-clamp-3 md:line-clamp-none">{item.overview}</p>
        <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-5">
          <button className="px-5 py-2 md:px-6 md:py-2.5 bg-[#e50914] hover:bg-[#f6121d] text-white font-semibold rounded-lg transition-colors flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            Reproducir
          </button>
          <button onClick={() => onMoreInfo && onMoreInfo(item)} className="px-5 py-2 md:px-6 md:py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Más información
          </button>
          <div className="flex items-center gap-2 md:ml-auto">
            <button onClick={prev} className="p-1.5 md:p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button onClick={next} className="p-1.5 md:p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const GENRES_ES = [
  { id: 35, name: 'Comedia' },
  { id: 16, name: 'Animación' },
  { id: 28, name: 'Acción' },
  { id: 878, name: 'Ciencia Ficción' }
]

const GENRES_EN = [
  { id: 35, name: 'Comedy' },
  { id: 16, name: 'Animation' },
  { id: 28, name: 'Action' },
  { id: 878, name: 'Science Fiction' }
]

export default function Home(){
  const [trending, setTrending] = useState([])
  const [heroItems, setHeroItems] = useState([])
  const [genreFull, setGenreFull] = useState({})
  const [genreLimit, setGenreLimit] = useState({})
  const [loadingMore, setLoadingMore] = useState(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState('es-ES')

  const GENRES = language === 'es-ES' ? GENRES_ES : GENRES_EN

  const toggleLanguage = () => {
    const newLang = language === 'es-ES' ? 'en-US' : 'es-ES'
    setLanguage(newLang)
    setTrending([])
    setHeroItems([])
    setGenreFull({})
    setLoading(true)
  }

  useEffect(()=>{
    async function load(){
      const base = BACKEND.replace(/\/$/,'')
      try{
        const t = await api.get(`${base}/api/tmdb/trending?language=${language}`)
        setTrending(t.data.slice(0,20))
        setHeroItems(t.data.slice(0,4))
      }catch(e){
        try {
          const r = await api.get(`${base}/api/demo/movies`)
          const items = r.data || []
          setTrending(items.slice(0,20))
          setHeroItems(items.slice(0,4))
        } catch(e2) {
          const items = getDemoTrending()
          setTrending(items.slice(0,20))
          setHeroItems(items.slice(0,4))
        }
      }
      const results = await Promise.allSettled(
        GENRES.map(g => api.get(`${base}/api/tmdb/genre/${g.id}?language=${language}`))
      )
      const full = {}
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') full[GENRES[i].id] = r.value.data
        else full[GENRES[i].id] = getDemoGenre(GENRES[i].id)
      })
      setGenreFull(full)
      const limits = {}
      GENRES.forEach(g => { limits[g.id] = 12 })
      setGenreLimit(limits)
      setLoading(false)
    }
    load()
  },[language])

  const handleViewMore = async (genre) => {
    setLoadingMore(genre.id)
    const current = genreLimit[genre.id] || 12
    const full = genreFull[genre.id] || []
    if (current >= full.length) {
      try {
        const base = BACKEND.replace(/\/$/,'')
        const r = await api.get(`${base}/api/tmdb/genre/${genre.id}?language=${language}`)
        const merged = [...full, ...r.data]
        setGenreFull(p => ({ ...p, [genre.id]: merged }))
      } catch(e) {}
    }
    setGenreLimit(p => ({ ...p, [genre.id]: (genreLimit[genre.id] || 12) + 12 }))
    setLoadingMore(null)
  }

  return (
    <>
      <Header />
      <div className="flex justify-end max-w-7xl mx-auto px-6 pt-4">
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 rounded-lg bg-[#1a2533] border border-[#2a3a4a] text-sm text-gray-300 hover:bg-[#253545] hover:text-white transition-colors flex items-center gap-2"
        >
          <span className="text-base">{language === 'es-ES' ? '🇪🇸' : '🇺🇸'}</span>
          {language === 'es-ES' ? 'Español' : 'English'}
        </button>
      </div>
      {loading ? <SkeletonHero /> : <Hero items={heroItems} onMoreInfo={(i)=> setSelected(i)} />}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        {loading ? (
          <>
            <SkeletonCarousel />
            <SkeletonCarousel />
            <SkeletonCarousel />
            <SkeletonCarousel />
            <SkeletonCarousel />
          </>
        ) : (
          <>
            <Carousel title="Tendencias" items={trending.slice(0,12)} onPosterClick={(i)=> setSelected(i)} />
            {GENRES.map(g => (
              <Carousel
                key={g.id}
                title={g.name}
                items={(genreFull[g.id] || []).slice(0, genreLimit[g.id] || 12)}
                onPosterClick={(i)=> setSelected(i)}
                onViewMore={() => handleViewMore(g)}
                loadingMore={loadingMore === g.id}
              />
            ))}
          </>
        )}
      </div>
      <Footer />
      {selected && (
        <ModalDetail item={selected} onClose={()=>setSelected(null)} language={language} />
      )}
    </>
  )
}
