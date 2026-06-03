import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Favorites from './pages/Favorites'
import NotFound from './pages/NotFound'

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
              <Route path="*" element={<PageWrap><NotFound/></PageWrap>} />
            </Routes>
          </AnimatePresence>
        </div>
      </ToastProvider>
    </AuthProvider>
  )
}
