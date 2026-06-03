require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Helpers
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

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

// Routes
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

app.get('/api/auth/me', async (req, res) => {
  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ id: user.id, email: user.email });
});

// Favorites
app.get('/api/favorites', async (req, res) => {
  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const favs = await prisma.favorite.findMany({ where: { userId: user.id } });
  res.json(favs);
});

app.post('/api/favorites', async (req, res) => {
  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const { tmdbId, mediaType, title, poster } = req.body;
  if (!tmdbId || !mediaType) return res.status(400).json({ error: 'Missing fields' });
  const fav = await prisma.favorite.create({ data: { userId: user.id, tmdbId, mediaType, title: title || '', poster } });
  res.json(fav);
});

app.delete('/api/favorites/:id', async (req, res) => {
  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const id = parseInt(req.params.id, 10);
  const fav = await prisma.favorite.findUnique({ where: { id } });
  if (!fav || fav.userId !== user.id) return res.status(404).json({ error: 'Not found' });
  await prisma.favorite.delete({ where: { id } });
  res.json({ success: true });
});

// Demo data endpoints to provide simple posters/trailers without TMDb
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

app.get('/api/demo/movies', (req, res) => {
  res.json(demoItems);
});

app.get('/api/demo/movies/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = demoItems.find(d=>d.id===id);
  if(!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.get('/', (req, res) => res.json({ ok: true }));

// TMDb proxy endpoints (use backend TMDB_API_KEY). If key missing, fall back to demo items.
let tmdbService = null;
try {
  tmdbService = require('./services/tmdb');
} catch (e) {
  console.warn('TMDb service not available', e && e.message);
}

app.get('/api/tmdb/trending', async (req, res) => {
  if (!process.env.TMDB_API_KEY || !tmdbService) return res.json(demoItems);
  try {
    const media = req.query.media || 'all';
    const page = req.query.page || 1;
    const items = await tmdbService.trending(media, page);
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'TMDb error' });
  }
});

app.get('/api/tmdb/search', async (req, res) => {
  if (!process.env.TMDB_API_KEY || !tmdbService) return res.json([]);
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'missing q' });
    const page = req.query.page || 1;
    const items = await tmdbService.search(q, page);
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'TMDb error' });
  }
});

app.get('/api/tmdb/movie/:id', async (req, res) => {
  if (!process.env.TMDB_API_KEY || !tmdbService) return res.status(404).json({ error: 'not available' });
  try {
    const id = req.params.id;
    const data = await tmdbService.movieDetails(id);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'TMDb error' });
  }
});

app.get('/api/tmdb/tv/:id', async (req, res) => {
  if (!process.env.TMDB_API_KEY || !tmdbService) return res.status(404).json({ error: 'not available' });
  try {
    const id = req.params.id;
    const data = await tmdbService.tvDetails(id);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'TMDb error' });
  }
});

app.get('/api/tmdb/genre/:genreId', async (req, res) => {
  if (!process.env.TMDB_API_KEY || !tmdbService) return res.status(404).json({ error: 'not available' });
  try {
    const genreId = parseInt(req.params.genreId);
    const page = req.query.page || 1;
    const items = await tmdbService.discover(genreId, page);
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'TMDb error' });
  }
});

const srv = http.createServer(app);
srv.listen({ port: PORT, reuseAddr: true }, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
