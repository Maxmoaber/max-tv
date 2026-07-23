/*
 * ====================================================================
 *  api.js — Configuración de Axios y URL del backend
 * ====================================================================
 *
 *  Este módulo exporta:
 *    - BACKEND: La URL base del backend, obtenida de la variable de
 *      entorno VITE_BACKEND_URL (Vite expone las variables con prefijo
 *      VITE_ al frontend). Si no está definida, usa localhost:4001
 *      para desarrollo local.
 *    - api: Una instancia preconfigurada de Axios con timeout de 60s.
 *
 *  ¿Por qué una instancia separada?
 *    - Centraliza la configuración HTTP (timeout, headers por defecto)
 *    - Permite usar interceptores en el futuro (ej. refrescar tokens)
 */

import axios from 'axios'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4001'

const api = axios.create({ timeout: 60000 })

export { BACKEND, api }
export default api
