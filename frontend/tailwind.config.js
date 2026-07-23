/*
 * ====================================================================
 *  tailwind.config.js — Configuración de Tailwind CSS
 * ====================================================================
 *
 *  Tailwind CSS genera las clases utilitarias basándose en esta
 *  configuración.
 *
 *  content:   Define qué archivos escanear para encontrar clases.
 *             Solo las clases usadas en estos archivos se incluyen
 *             en el CSS final (purga automática en producción).
 *  theme:     Aquí se pueden extender colores, fuentes, etc.
 *  plugins:   Plugins adicionales de Tailwind.
 *
 *  Más info: https://tailwindcss.com/docs/configuration
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {}
  },
  plugins: []
}
