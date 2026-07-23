/*
 * ====================================================================
 *  ToastContext.jsx — Sistema de notificaciones (toasts)
 * ====================================================================
 *
 *  Implementa notificaciones temporales (toasts) que aparecen en la
 *  esquina superior derecha y desaparecen automáticamente.
 *
 *  Usa React Context para que cualquier componente pueda mostrar un
 *  toast con solo llamar a addToast(mensaje, tipo).
 *
 *  Tipos de toast:
 *    - 'success' → verde (operación exitosa)
 *    - 'error'   → rojo (error)
 *    - 'info'    → gris (información)
 *
 *  Cada toast se auto-destruye después de 3.5 segundos.
 */

import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Renderizado de los toasts activos */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            className={`pointer-events-auto cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl text-sm font-medium transition-all duration-300 animate-slide-in ${
              t.type === 'success'
                ? 'bg-green-600 text-white'
                : t.type === 'error'
                  ? 'bg-[#e50914] text-white'
                  : 'bg-[#121a24] text-white border border-[#1e2a36]'
            }`}
          >
            {t.type === 'success' && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            )}
            {t.type === 'error' && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            )}
            {t.type === 'info' && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
