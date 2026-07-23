/*
 * ====================================================================
 *  App.jsx — Componente raíz con las rutas de la aplicación
 * ====================================================================
 *
 *  Este componente define la estructura principal de la app:
 *    1. AuthProvider: Provee el contexto de autenticación a toda la app.
 *    2. ToastProvider: Provee el sistema de notificaciones (toasts).
 *    3. <Routes>: Define las rutas disponibles en la aplicación.
 *       Cada ruta carga una página específica con una transición
 *       animada (framer-motion).
 *
 *  Rutas definidas:
 *    /          → Home (página principal)
 *    /auth      → Auth (inicio de sesión / registro)
 *    /favorites → Favorites (favoritos del usuario)
 *    /search    → SearchResults (resultados de búsqueda)
 *    *          → NotFound (página 404)
 *
 *  Tecnologías: React Router DOM (v6), Framer Motion (animaciones)
 */

import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Favorites from './pages/Favorites'
import SearchResults from './pages/SearchResults'
import NotFound from './pages/NotFound'

/**
 * PageWrap: Envuelve cada página con una animación de transición.
 * framer-motion aplica fade-in + slide-up al entrar y fade-out + slide-up al salir.
 */
function PageWrap({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

export default function App(){
  const location = useLocation()
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[#0a0e14]">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrap><Home/></PageWrap>} />
              <Route path="/auth" element={<PageWrap><Auth/></PageWrap>} />
              <Route path="/favorites" element={<PageWrap><Favorites/></PageWrap>} />
              <Route path="/search" element={<PageWrap><SearchResults/></PageWrap>} />
              <Route path="*" element={<PageWrap><NotFound/></PageWrap>} />
            </Routes>
          </AnimatePresence>
        </div>
      </ToastProvider>
    </AuthProvider>
  )
}
