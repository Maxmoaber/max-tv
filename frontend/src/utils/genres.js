const GENRE_MAP = {
  28: 'Acción', 12: 'Aventura', 16: 'Animación', 35: 'Comedia',
  80: 'Crimen', 99: 'Documental', 18: 'Drama', 10751: 'Familiar',
  14: 'Fantasía', 36: 'Historia', 27: 'Terror', 10402: 'Música',
  9648: 'Misterio', 10749: 'Romance', 878: 'Ciencia Ficción',
  10770: 'TV', 53: 'Suspenso', 10752: 'Bélica', 37: 'Western'
}

export function getGenreNames(ids) {
  if (!ids || !Array.isArray(ids)) return []
  return ids.map(id => GENRE_MAP[id]).filter(Boolean)
}
