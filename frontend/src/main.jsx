/*
 * ====================================================================
 *  main.jsx — Punto de entrada de la aplicación React
 * ====================================================================
 *
 *  Este archivo:
 *    1. Monta la aplicación React en el elemento HTML <div id="root">
 *    2. Envuelve la app con <BrowserRouter> para el enrutamiento
 *       (React Router DOM). Esto permite la navegación entre páginas
 *       sin recargar el navegador.
 *    3. Renderiza el componente <App /> que contiene todas las rutas.
 *
 *  Tecnología: React 18 con createRoot (nuevo API de React 18).
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'

// Configuración de features futuras de React Router v7
const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true }

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={routerFuture}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
