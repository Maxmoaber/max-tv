/*
 * ====================================================================
 *  ModalDetail.jsx — Modal lateral de detalle de contenido
 * ====================================================================
 *
 *  Se abre al hacer click en un póster (desde Home, Favoritos, etc.)
 *  y muestra información detallada de la película o serie.
 *
 *  Contenido:
 *    - Imagen de fondo (backdrop)
 *    - Póster y título
 *    - Tipo (película/serie) y puntuación
 *    - Descripción (overview)
 *    - Tráiler de YouTube (si está disponible)
 *
 *  Comportamiento:
 *    - Se abre desde la derecha con animación (framer-motion spring)
 *    - Se cierra al hacer click fuera, presionar Escape, o en la X
 *    - Carga detalles completos desde el backend al abrirse
 *
 *  Props:
 *    - item: Objeto con datos básicos (id, mediaType, etc.)
 *    - onClose: Función para cerrar el modal
 *    - language: Código de idioma para los detalles
 *
 *  Tecnologías: React, framer-motion, Tailwind CSS
 */

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, BACKEND } from '../utils/api'

export default function ModalDetail({ item, onClose, language = 'es-ES' }){
  const [details, setDetails] = useState(item)

  // Cerrar con tecla Escape
  useEffect(()=>{
    function onKey(e){ if(e.key==='Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  },[])

  // Cargar detalles completos desde el backend
  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const base = BACKEND.replace(/\/$/,'')
        const route = item.mediaType==='tv' ? 'tv' : 'movie'
        const r = await api.get(`${base}/api/tmdb/${route}/${item.id}?language=${language}`)
        if(mounted) setDetails(d=> ({...d, ...r.data}))
      }catch(e){}
    }
    load()
    return ()=> mounted = false
  },[item, language])

  return (
    <AnimatePresence>
      {details && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/70 z-50 flex justify-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-full max-w-2xl bg-[#0f1923] border-l border-[#1e2a36] overflow-y-auto"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Cabecera sticky */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-[#0f1923]/90 backdrop-blur-sm border-b border-[#1e2a36]">
              <h2 className="text-lg font-bold text-white truncate">{details.title}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#e50914] flex items-center justify-center transition-colors flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="relative">
              {/* Imagen de fondo */}
              {details.backdrop && (
                <div className="relative h-56 md:h-72 overflow-hidden">
                  <img src={details.backdrop} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1923] via-[#0f1923]/30 to-transparent" />
                </div>
              )}
              <div className="px-6 pb-8 -mt-16 relative z-10">
                <div className="flex gap-4 mb-4">
                  {details.poster && (
                    <img src={details.poster} alt={details.title} className="w-24 h-36 object-cover rounded-lg shadow-2xl ring-1 ring-white/10 flex-shrink-0 hidden sm:block" />
                  )}
                  <div className="flex-1 min-w-0 pt-16 sm:pt-0 sm:self-end">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {details.mediaType && (
                        <span className="px-2 py-0.5 bg-[#e50914] text-white text-[10px] font-bold uppercase rounded">
                          {details.mediaType === 'tv' ? 'Serie' : 'Película'}
                        </span>
                      )}
                      {details.vote_average > 0 && (
                        <span className="flex items-center gap-1 text-sm text-[#ffd700]">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          {details.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{details.overview || 'Sin descripción disponible.'}</p>
                  </div>
                </div>

                {/* Tráiler de YouTube */}
                {details.trailerKey && (
                  <div className="mt-4 rounded-xl overflow-hidden ring-1 ring-white/10">
                    <div style={{position:'relative',paddingTop:'56.25%'}}>
                      <iframe
                        src={`https://www.youtube.com/embed/${details.trailerKey}`}
                        title="trailer"
                        frameBorder="0"
                        allowFullScreen
                        allow="autoplay; encrypted-media"
                        style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
