/*
 * ====================================================================
 *  postcss.config.js — Configuración de PostCSS
 * ====================================================================
 *
 *  PostCSS es una herramienta para transformar CSS con plugins.
 *  Vite la usa para procesar los archivos CSS.
 *
 *  Plugins usados:
 *    tailwindcss:  Genera las clases utilitarias de Tailwind
 *    autoprefixer: Añade prefijos CSS para compatibilidad entre
 *                  navegadores (ej. -webkit-, -moz-)
 */

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
