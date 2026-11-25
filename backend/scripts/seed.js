/*
 * seed.js — Genera el snapshot offline de Max.tv
 *
 * Ejecutar CON internet una sola vez:
 *   node scripts/seed.js
 *
 * Qué hace:
 *   1. Consulta TMDb: tendencias, 4 géneros, detalles de ~18 títulos
 *   2. Descarga pósters y backdrops a frontend/public/snapshot/
 *   3. Guarda todo normalizado en backend/data/snapshot.json
 *
 * El backend usa este snapshot como fallback cuando no hay
 * TMDB_API_KEY o no hay conexión a internet.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const API_KEY = process.env.TMDB_API_KEY;
const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';

const ROOT = path.join(__dirname, '..', '..');
const PUBLIC_SNAP = path.join(ROOT, 'frontend', 'public', 'snapshot');
const DATA_DIR = path.join(ROOT, 'backend', 'data');
const OUT_JSON = path.join(DATA_DIR, 'snapshot.json');

const GENRES = [35, 16, 28, 878]; // Comedia, Animación, Acción, Sci-Fi
const DETAIL_IDS = [
  { id: 27205, mediaType: 'movie' },
  { id: 157336, mediaType: 'movie' },
  { id: 155, mediaType: 'movie' },
  { id: 603, mediaType: 'movie' },
  { id: 299534, mediaType: 'movie' },
  { id: 244786, mediaType: 'movie' },
  { id: 324857, mediaType: 'movie' },
  { id: 438631, mediaType: 'movie' },
  { id: 1399, mediaType: 'tv' },
  { id: 66732, mediaType: 'tv' },
  { id: 1396, mediaType: 'tv' },
  { id: 71912, mediaType: 'tv' },
  { id: 60625, mediaType: 'tv' },
  { id: 46648, mediaType: 'tv' },
  { id: 87108, mediaType: 'tv' },
  { id: 63174, mediaType: 'tv' },
  { id: 2316, mediaType: 'tv' },
  { id: 1429, mediaType: 'tv' },
];

const client = axios.create({ baseURL: BASE, params: { api_key: API_KEY }, timeout: 30000 });

function normalizeListItem(r, mediaType) {
  const mt = mediaType || r.media_type || 'movie';
  return {
    id: r.id,
    title: r.title || r.name || 'Sin título',
    mediaType: mt,
    poster: r.poster_path ? `${IMG}/w500${r.poster_path}` : null,
    backdrop: r.backdrop_path ? `${IMG}/w1280${r.backdrop_path}` : null,
    overview: r.overview || '',
    vote_average: r.vote_average || 0,
    release_date: r.release_date || r.first_air_date || null,
    genre_ids: r.genre_ids || [],
  };
}

async function downloadImage(url, filename) {
  if (!url) return null;
  const dest = path.join(PUBLIC_SNAP, filename);
  if (fs.existsSync(dest)) return `/snapshot/${filename}`;
  try {
    const res = await axios.get(url, { responseType: 'stream', timeout: 30000 });
    await new Promise((resolve, reject) => {
      const ws = fs.createWriteStream(dest);
      res.data.pipe(ws);
      ws.on('finish', resolve);
      ws.on('error', reject);
    });
    process.stdout.write('.');
    return `/snapshot/${filename}`;
  } catch (e) {
    console.warn(`\n  ⚠ Falló imagen ${filename}: ${e.message}`);
    return null;
  }
}

async function fetchDetail(item) {
  const route = item.mediaType === 'tv' ? 'tv' : 'movie';
  const { data } = await client.get(`/${route}/${item.id}`, {
    params: { language: 'es-ES', append_to_response: 'credits,videos' },
  });
  const trailer = (data.videos?.results || []).find(v => v.site === 'YouTube' && v.type === 'Trailer');
  return {
    id: data.id,
    title: data.title || data.name,
    mediaType: item.mediaType,
    poster: data.poster_path ? `${IMG}/w500${data.poster_path}` : null,
    backdrop: data.backdrop_path ? `${IMG}/w1280${data.backdrop_path}` : null,
    overview: data.overview || '',
    vote_average: data.vote_average || 0,
    release_date: data.release_date || data.first_air_date || null,
    genres: (data.genres || []).map(g => ({ id: g.id, name: g.name })),
    runtime: data.runtime || null,
    episode_run_time: data.episode_run_time?.[0] || null,
    number_of_seasons: data.number_of_seasons || null,
    status: data.status || null,
    trailerKey: trailer ? trailer.key : null,
    tagline: data.tagline || '',
  };
}

async function main() {
  if (!API_KEY || API_KEY === 'your_tmdb_api_key_here') {
    console.error('❌ TMDB_API_KEY no configurada. Edita backend/.env o exporta la variable.');
    process.exit(1);
  }

  fs.mkdirSync(PUBLIC_SNAP, { recursive: true });
  fs.mkdirSync(DATA_DIR, { recursive: true });

  console.log('🎬 Generando snapshot offline de Max.tv...\n');

  // 1. Tendencias
  console.log('→ Tendencias (movie + tv)...');
  const [trendMovie, trendTv] = await Promise.all([
    client.get('/trending/movie/week', { params: { language: 'es-ES' } }),
    client.get('/trending/tv/week', { params: { language: 'es-ES' } }),
  ]);
  const trending = [
    ...trendMovie.data.results.map(r => normalizeListItem(r, 'movie')),
    ...trendTv.data.results.map(r => normalizeListItem(r, 'tv')),
  ].slice(0, 20);

  // 2. Géneros
  console.log('→ Géneros:', GENRES.join(', '));
  const genreMap = {};
  await Promise.all(GENRES.map(async g => {
    const { data } = await client.get('/discover/' + (g === 16 ? 'movie' : 'movie'), {
      params: { with_genres: g, language: 'es-ES', sort_by: 'popularity.desc' },
    });
    genreMap[g] = data.results.map(r => normalizeListItem(r, 'movie')).slice(0, 20);
  }));

  // 3. Detalles
  console.log('→ Detalles de', DETAIL_IDS.length, 'títulos...');
  const details = [];
  for (const item of DETAIL_IDS) {
    try {
      details.push(await fetchDetail(item));
      process.stdout.write('.');
    } catch (e) {
      console.warn(`\n  ⚠ Detalle ${item.id} falló: ${e.message}`);
    }
  }
  console.log('');

  // 4. Descargar imágenes únicas
  const imgJobs = [];
  const seen = new Set();
  const collect = (item) => {
    const pairs = [
      [item.poster, `poster_${item.id}.jpg`],
      [item.backdrop, `backdrop_${item.id}.jpg`],
    ];
    for (const [url, name] of pairs) {
      if (url && !seen.has(name)) {
        seen.add(name);
        imgJobs.push({ url, name, itemId: item.id, kind: name.startsWith('poster') ? 'poster' : 'backdrop' });
      }
    }
  };
  trending.forEach(collect);
  Object.values(genreMap).forEach(list => list.forEach(collect));
  details.forEach(collect);

  console.log(`\n→ Descargando ${imgJobs.length} imágenes...`);
  const localPaths = {};
  for (const job of imgJobs) {
    const local = await downloadImage(job.url, job.name);
    if (local) localPaths[`${job.kind}_${job.itemId}`] = local;
  }

  // Reemplazar URLs remotas por rutas locales
  const localize = (item) => {
    if (!item) return item;
    const p = localPaths[`poster_${item.id}`];
    const b = localPaths[`backdrop_${item.id}`];
    return { ...item, poster: p || item.poster, backdrop: b || item.backdrop };
  };

  const snapshot = {
    generatedAt: new Date().toISOString(),
    trending: trending.map(localize),
    genres: Object.fromEntries(Object.entries(genreMap).map(([k, v]) => [k, v.map(localize)])),
    details: details.map(localize),
  };

  fs.writeFileSync(OUT_JSON, JSON.stringify(snapshot, null, 2));
  console.log(`\n✅ Snapshot guardado en ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`✅ Imágenes en frontend/public/snapshot/ (${fs.readdirSync(PUBLIC_SNAP).length} archivos)`);
  console.log('\nAhora el backend puede servir todo sin internet.');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
