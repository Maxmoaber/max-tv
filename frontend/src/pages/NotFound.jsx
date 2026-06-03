import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound(){
  return (
    <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-extrabold text-[#e50914] mb-4">404</div>
        <div className="w-16 h-1 bg-[#e50914] mx-auto mb-6 rounded-full" />
        <h1 className="text-2xl font-bold text-white mb-3">Página no encontrada</h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          La página que buscas no existe o ha sido movida.
          Revisa la URL o vuelve al inicio.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#e50914] hover:bg-[#f6121d] text-white font-semibold rounded-lg transition-colors no-underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
