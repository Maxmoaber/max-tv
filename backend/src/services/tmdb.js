const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache();

const TMDB_BASE = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

const client = axios.create({ baseURL: TMDB_BASE, params: { api_key: API_KEY } });

function fullImage(path, size = 'w300'){
  if(!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

async function trending(media = 'all', page = 1){
  const key = `trending:${media}:${page}`;
  const cached = cache.get(key);
  if(cached) return cached;
  const r = await client.get(`/trending/${media}/week`, { params: { page } });
  const items = r.data.results.map(i=>({
    id: i.id,
    title: i.title || i.name,
    mediaType: i.media_type || (i.title? 'movie' : 'tv'),
    poster: fullImage(i.poster_path),
    backdrop: fullImage(i.backdrop_path,'w780'),
    overview: i.overview,
    raw: i
  }));
  cache.set(key, items, 60*10);
  return items;
}

async function search(q, page=1){
  const key = `search:${q}:${page}`;
  const cached = cache.get(key);
  if(cached) return cached;
  const r = await client.get('/search/multi', { params: { query: q, page } });
  const items = r.data.results.map(i=>({
    id: i.id,
    title: i.title || i.name,
    mediaType: i.media_type || (i.title? 'movie' : 'tv'),
    poster: fullImage(i.poster_path),
    overview: i.overview,
    raw: i
  }));
  cache.set(key, items, 60*5);
  return items;
}

async function movieDetails(id){
  const key = `movie:${id}`;
  const cached = cache.get(key);
  if(cached) return cached;
  const r = await client.get(`/movie/${id}`, { params: { append_to_response: 'videos,images,credits' } });
  const data = r.data;
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
  cache.set(key, payload, 60*60);
  return payload;
}

async function tvDetails(id){
  const key = `tv:${id}`;
  const cached = cache.get(key);
  if(cached) return cached;
  const r = await client.get(`/tv/${id}`, { params: { append_to_response: 'videos,images,credits' } });
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

async function discover(genreId, page = 1){
  const key = `discover:${genreId}:${page}`;
  const cached = cache.get(key);
  if(cached) return cached;
  const r = await client.get('/discover/movie', { params: { with_genres: genreId, page, sort_by: 'popularity.desc' } });
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
