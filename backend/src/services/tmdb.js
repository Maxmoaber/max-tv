/*
 * ====================================================================
 *  tmdb.js — Servicio de integración con TMDb (The Movie Database)
 *  Tecnologías: Axios, NodeCache
 * ====================================================================
 *
 *  Este módulo encapsula todas las llamadas a la API REST de TMDb.
 *  Proporciona funciones para:
 *    - Obtener tendencias semanales
 *    - Buscar contenido multi (películas + series)
 *    - Obtener detalles de películas y series
 *    - Descubrir contenido por género
 *
 *  Incluye un sistema de caché en memoria (NodeCache) para evitar
 *  llamadas repetidas a la API y reducir la latencia.
 *
 *  Cada función:
 *    1. Genera una clave única basada en los parámetros
 *    2. Verifica si el resultado está en caché
 *    3. Si no está en caché, hace la petición a TMDb
 *    4. Transforma la respuesta a un formato uniforme
 *    5. Almacena en caché y retorna los datos
 */

const axios = require('axios');
const NodeCache = require('node-cache');

// ─── Configuración ──────────────────────────────────────────────────

const cache = new NodeCache();                                     // Caché en memoria con TTL por defecto
const TMDB_BASE = 'https://api.themoviedb.org/3';                  // URL base de la API de TMDb
const API_KEY = process.env.TMDB_API_KEY;                          // API key desde variable de entorno

// Cliente Axios preconfigurado con la base URL y la API key
const client = axios.create({ baseURL: TMDB_BASE, params: { api_key: API_KEY } });

// ─── Utilidades ─────────────────────────────────────────────────────

/**
 * fullImage(path, size)
 * Construye la URL completa de una imagen de TMDb.
 * Ejemplo: fullImage('/abc123.jpg', 'w500')
 *   → 'https://image.tmdb.org/t/p/w500/abc123.jpg'
 */
function fullImage(path, size = 'w300'){
  if(!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// ═══════════════════════════════════════════════════════════════════
//  FUNCIONES PRINCIPALES
// ═══════════════════════════════════════════════════════════════════

/**
 * trending(media, page, language)
 * Obtiene las tendencias de la semana.
 * @param {string} media - 'all', 'movie' o 'tv'
 * @param {number} page  - Número de página
 * @param {string} language - Código de idioma (ej. 'es-ES', 'en-US')
 * @returns {Array} Lista de items con formato uniforme
 */
async function trending(media = 'all', page = 1, language = 'es-ES'){
  const key = `trending:${media}:${page}:${language}`;
  const cached = cache.get(key);
  if(cached) return cached;

  const r = await client.get(`/trending/${media}/week`, { params: { page, language } });
  const items = r.data.results.map(i=>({
    id: i.id,
    title: i.title || i.name,
    mediaType: i.media_type || (i.title? 'movie' : 'tv'),
    poster: fullImage(i.poster_path),
    backdrop: fullImage(i.backdrop_path,'w780'),
    overview: i.overview,
    raw: i                                      // Datos originales por si se necesitan más campos
  }));
  cache.set(key, items, 60*10);                  // Caché por 10 minutos
  return items;
}

/**
 * search(q, page, language)
 * Busca contenido multimedia (películas, series, personas).
 * Usa el endpoint /search/multi de TMDb que abarca todos los tipos.
 * @param {string} q - Término de búsqueda
 * @returns {Array} Lista de resultados
 */
async function search(q, page=1, language='es-ES'){
  const key = `search:${q}:${page}:${language}`;
  const cached = cache.get(key);
  if(cached) return cached;

  const r = await client.get('/search/multi', { params: { query: q, page, language } });
  const items = r.data.results.map(i=>({
    id: i.id,
    title: i.title || i.name,
    mediaType: i.media_type || (i.title? 'movie' : 'tv'),
    poster: fullImage(i.poster_path),
    overview: i.overview,
    raw: i
  }));
  cache.set(key, items, 60*5);                   // Caché por 5 minutos
  return items;
}

/**
 * movieDetails(id, language)
 * Obtiene todos los detalles de una película, incluyendo:
 *   - Videos (tráilers)
 *   - Imágenes adicionales
 *   - Créditos (reparto y equipo)
 * @param {number} id - ID de TMDb
 * @returns {Object} Detalles de la película
 */
async function movieDetails(id, language = 'es-ES'){
  const key = `movie:${id}:${language}`;
  const cached = cache.get(key);
  if(cached) return cached;

  const r = await client.get(`/movie/${id}`, { params: { append_to_response: 'videos,images,credits', language } });
  const data = r.data;
  // Busca el primer tráiler de YouTube
  const trailer = (data.videos && data.videos.results && data.videos.results.find(v=>v.site==='YouTube' && v.type==='Trailer')) || null;
  const payload = {
    id: data.id,
    title: data.title,
    poster: fullImage(data.poster_path,'w500'),
    backdrop: fullImage(data.backdrop_path,'w780'),
    overview: data.overview,
    videos: data.videos,
    trailerKey: trailer? trailer.key : null,
    raw: data
  };
  cache.set(key, payload, 60*60);                // Caché por 1 hora
  return payload;
}

/**
 * tvDetails(id, language)
 * Obtiene todos los detalles de una serie de TV, similar a movieDetails.
 */
async function tvDetails(id, language = 'es-ES'){
  const key = `tv:${id}:${language}`;
  const cached = cache.get(key);
  if(cached) return cached;

  const r = await client.get(`/tv/${id}`, { params: { append_to_response: 'videos,images,credits', language } });
  const data = r.data;
  const trailer = (data.videos && data.videos.results && data.videos.results.find(v=>v.site==='YouTube' && v.type==='Trailer')) || null;
  const payload = {
    id: data.id,
    title: data.name,
    poster: fullImage(data.poster_path,'w500'),
    backdrop: fullImage(data.backdrop_path,'w780'),
    overview: data.overview,
    videos: data.videos,
    trailerKey: trailer? trailer.key : null,
    raw: data
  };
  cache.set(key, payload, 60*60);
  return payload;
}

/**
 * discover(genreId, page, language)
 * Descubre películas por género usando el endpoint /discover/movie.
 * Ordenado por popularidad descendente.
 */
async function discover(genreId, page = 1, language = 'es-ES'){
  const key = `discover:${genreId}:${page}:${language}`;
  const cached = cache.get(key);
  if(cached) return cached;

  const r = await client.get('/discover/movie', { params: { with_genres: genreId, page, sort_by: 'popularity.desc', language } });
  const items = r.data.results.map(i=>({
    id: i.id,
    title: i.title,
    mediaType: 'movie',
    poster: fullImage(i.poster_path),
    backdrop: fullImage(i.backdrop_path,'w780'),
    overview: i.overview,
    raw: i
  }));
  cache.set(key, items, 60*10);
  return items;
}

module.exports = { trending, search, movieDetails, tvDetails, discover };
