/*
 * ====================================================================
 *  server.js — Backend principal de Max.tv
 *  Tecnologías: Node.js, Express, Prisma ORM, JWT, bcrypt
 * ====================================================================
 *
 *  Este archivo levanta un servidor HTTP que expone una API REST.
 *  Se encarga de:
 *    1. Autenticación (registro / login / verificación de sesión)
 *    2. Gestión de favoritos por usuario (CRUD)
 *    3. Proxy hacia la API de TMDb (The Movie Database) para
 *       obtener películas, series, tendencias, búsqueda y detalles
 *    4. Endpoints de datos de demostración (fallback si falta API key)
 *
 *  Flujo general:
 *    - El cliente (frontend React) hace peticiones HTTP a estos
 *      endpoints.
 *    - El servidor valida tokens JWT donde sea necesario.
 *    - Para contenido multimedia, redirige las llamadas a TMDb
 *      (o devuelve datos demo si la API key no está configurada).
 */

require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ─── Inicialización ─────────────────────────────────────────────────

const prisma = new PrismaClient();
const app = express();

const PORT = parseInt(process.env.PORT, 10) || 4000;
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// Middleware globales
app.use(cors({ origin: true, credentials: true })); // Permite peticiones desde cualquier origen
app.use(express.json());                              // Parseo de cuerpos JSON

// ─── Funciones auxiliares ───────────────────────────────────────────

/**
 * generateToken(user)
 * Crea un token JWT para el usuario autenticado.
 * El token expira en 7 días y contiene el id y email del usuario.
 */
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * getUserFromToken(req)
 * Extrae el token JWT del header Authorization (o cookie) y
 * devuelve el usuario correspondiente desde la base de datos.
 * Retorna null si el token no es válido o no existe.
 */
async function getUserFromToken(req) {
  const auth = req.headers.authorization || req.cookies && req.cookies.token;
  if (!auth) return null;
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  try {
    const data = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: data.id } });
    return user;
  } catch (e) {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  ENDPOINTS DE AUTENTICACIÓN
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /api/auth/register
 * Crea un nuevo usuario con email y contraseña (hasheada con bcrypt).
 * Devuelve los datos del usuario y un token JWT.
 */
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashed } });
    const token = generateToken(user);
    res.json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/auth/login
 * Verifica email y contraseña contra la base de datos.
 * Si son correctos, devuelve los datos del usuario y un token JWT.
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = generateToken(user);
  res.json({ user: { id: user.id, email: user.email }, token });
});

/**
 * GET /api/auth/me
 * Devuelve los datos del usuario autenticado según el token JWT.
 * Útil para verificar si la sesión sigue activa al recargar la página.
 */
app.get('/api/auth/me', async (req, res) => {
  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ id: user.id, email: user.email });
});

// ═══════════════════════════════════════════════════════════════════
//  ENDPOINTS DE FAVORITOS (requieren autenticación)
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/favorites
 * Lista todos los favoritos del usuario autenticado.
 */
app.get('/api/favorites', async (req, res) => {
  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const favs = await prisma.favorite.findMany({ where: { userId: user.id } });
  res.json(favs);
});

/**
 * POST /api/favorites
 * Guarda un nuevo favorito (película o serie) para el usuario autenticado.
 * Recibe: tmdbId, mediaType, title, poster (opcional).
 */
app.post('/api/favorites', async (req, res) => {
  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const { tmdbId, mediaType, title, poster } = req.body;
  if (!tmdbId || !mediaType) return res.status(400).json({ error: 'Missing fields' });
  const fav = await prisma.favorite.create({ data: { userId: user.id, tmdbId, mediaType, title: title || '', poster } });
  res.json(fav);
});

/**
 * DELETE /api/favorites/:id
 * Elimina un favorito por su ID, siempre que pertenezca al usuario autenticado.
 */
app.delete('/api/favorites/:id', async (req, res) => {
  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const id = parseInt(req.params.id, 10);
  const fav = await prisma.favorite.findUnique({ where: { id } });
  if (!fav || fav.userId !== user.id) return res.status(404).json({ error: 'Not found' });
  await prisma.favorite.delete({ where: { id } });
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════════════
//  DATOS DE DEMOSTRACIÓN (fallback cuando TMDb no está disponible)
// ═══════════════════════════════════════════════════════════════════

/*
 * Estos datos se usan como respaldo cuando no hay API key de TMDb.
 * Permiten que la aplicación funcione visualmente aunque sin contenido real.
 */
const demoItems = [
  { id: 1, title: 'The Example Movie', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie1/400/600', description: 'Un thriller emocionante sobre decisiones y destinos.', trailerUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U' },
  { id: 2, title: 'Another Film', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie2/400/600', description: 'Comedia ligera que toca el corazón.', trailerUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4' },
  { id: 3, title: 'Space Saga', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie3/400/600', description: 'Aventura espacial épica con efectos sorprendentes.', trailerUrl: 'https://www.youtube.com/embed/5PSNL1qE6VY' },
  { id: 4, title: 'Detective Series', mediaType: 'tv', poster: 'https://picsum.photos/seed/tv1/400/600', description: 'Serie de misterio con casos semanales.', trailerUrl: 'https://www.youtube.com/embed/2Vv-BfVoq4g', episodes: [
    { season: 1, episode: 1, title: 'Pilot', synopsis: 'El primer caso que lo cambia todo.' },
    { season: 1, episode: 2, title: 'La Pista', synopsis: 'Una pista lleva a otra pregunta.' },
    { season: 1, episode: 3, title: 'Verdades', synopsis: 'Se revelan secretos inesperados.' }
  ] },
  { id: 5, title: 'Teen Drama', mediaType: 'tv', poster: 'https://picsum.photos/seed/tv2/400/600', description: 'Relaciones, retos y crecimiento.', trailerUrl: 'https://www.youtube.com/embed/3JZ_D3ELwOQ', episodes: [
    { season: 1, episode: 1, title: 'Comienzos', synopsis: 'Nuevos personajes y viejos problemas.' },
    { season: 1, episode: 2, title: 'Choques', synopsis: 'Conflictos y decisiones.' }
  ] }
];

app.get('/api/demo/movies', (req, res) => { res.json(demoItems); });
app.get('/api/demo/movies/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = demoItems.find(d=>d.id===id);
  if(!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.get('/', (req, res) => res.json({ ok: true, service: 'MaxTV Backend' }));

// ═══════════════════════════════════════════════════════════════════
//  PROXY HACIA TMDb (The Movie Database)
// ═══════════════════════════════════════════════════════════════════
/*
 *  Estos endpoints actúan como intermediarios entre el frontend y la
 *  API de TMDb. El frontend nunca llama directamente a TMDb; siempre
 *  pasa por nuestro backend para evitar exponer la API key y para
 *  tener control sobre los datos (caché, transformación, etc.).
 */

let tmdbService = null;
try {
  tmdbService = require('./services/tmdb');
} catch (e) {
  console.warn('TMDb service not available', e && e.message);
}

/**
 * GET /api/tmdb/trending
 * Devuelve las películas/series en tendencia de la semana.
 * Si no hay API key configurada, devuelve datos demo.
 */
app.get('/api/tmdb/trending', async (req, res) => {
  if (!process.env.TMDB_API_KEY || !tmdbService) return res.json(demoItems);
  try {
    const media = req.query.media || 'all';
    const page = req.query.page || 1;
    const language = req.query.language || 'es-ES';
    const items = await tmdbService.trending(media, page, language);
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'TMDb error' });
  }
});

/**
 * GET /api/tmdb/search
 * Busca películas, series y personas en TMDb.
 * Parámetros: q (término de búsqueda obligatorio), page, language.
 */
app.get('/api/tmdb/search', async (req, res) => {
  if (!process.env.TMDB_API_KEY || !tmdbService) return res.json([]);
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'missing q' });
    const page = req.query.page || 1;
    const language = req.query.language || 'es-ES';
    const items = await tmdbService.search(q, page, language);
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'TMDb error' });
  }
});

/**
 * GET /api/tmdb/movie/:id
 * Obtiene detalles completos de una película (incluyendo tráiler, créditos, etc.)
 */
app.get('/api/tmdb/movie/:id', async (req, res) => {
  if (!process.env.TMDB_API_KEY || !tmdbService) return res.status(404).json({ error: 'not available' });
  try {
    const id = req.params.id;
    const language = req.query.language || 'es-ES';
    const data = await tmdbService.movieDetails(id, language);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'TMDb error' });
  }
});

/**
 * GET /api/tmdb/tv/:id
 * Obtiene detalles completos de una serie de TV.
 */
app.get('/api/tmdb/tv/:id', async (req, res) => {
  if (!process.env.TMDB_API_KEY || !tmdbService) return res.status(404).json({ error: 'not available' });
  try {
    const id = req.params.id;
    const language = req.query.language || 'es-ES';
    const data = await tmdbService.tvDetails(id, language);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'TMDb error' });
  }
});

/**
 * GET /api/tmdb/genre/:genreId
 * Descubre contenido por género (usando /discover de TMDb).
 */
app.get('/api/tmdb/genre/:genreId', async (req, res) => {
  if (!process.env.TMDB_API_KEY || !tmdbService) return res.status(404).json({ error: 'not available' });
  try {
    const genreId = parseInt(req.params.genreId);
    const page = req.query.page || 1;
    const language = req.query.language || 'es-ES';
    const items = await tmdbService.discover(genreId, page, language);
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'TMDb error' });
  }
});

// ─── Arranque del servidor ──────────────────────────────────────────

const srv = http.createServer(app);
srv.listen(PORT, HOST, () => {
  console.log(`Backend running on http://${HOST}:${PORT}`);
});
