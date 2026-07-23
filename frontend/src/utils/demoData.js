/*
 * ====================================================================
 *  demoData.js — Datos de demostración (fallback visual)
 * ====================================================================
 *
 *  Este archivo contiene datos ficticios de películas y series que
 *  se usan como respaldo cuando:
 *    1. No hay conexión al backend
 *    2. El backend no tiene configurada la API key de TMDb
 *
 *  Así la aplicación siempre muestra contenido visual aunque sea
 *  de prueba. Las imágenes son de https://picsum.photos (generadas).
 *
 *  Exporta:
 *    - getDemoTrending() → lista completa de items demo
 *    - getDemoGenre(id)  → items demo filtrados por género
 */

const DEMO_ITEMS = [
  { id: 1, title: 'The Example Movie', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie1/400/600', backdrop: 'https://picsum.photos/seed/movie1b/1280/720', overview: 'Un thriller emocionante sobre decisiones y destinos.', vote_average: 8.2 },
  { id: 2, title: 'Another Film', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie2/400/600', backdrop: 'https://picsum.photos/seed/movie2b/1280/720', overview: 'Comedia ligera que toca el corazón.', vote_average: 7.5 },
  { id: 3, title: 'Space Saga', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie3/400/600', backdrop: 'https://picsum.photos/seed/movie3b/1280/720', overview: 'Aventura espacial épica con efectos sorprendentes.', vote_average: 9.0 },
  { id: 4, title: 'Detective Series', mediaType: 'tv', poster: 'https://picsum.photos/seed/tv1/400/600', backdrop: 'https://picsum.photos/seed/tv1b/1280/720', overview: 'Serie de misterio con casos semanales.', vote_average: 8.8 },
  { id: 5, title: 'Teen Drama', mediaType: 'tv', poster: 'https://picsum.photos/seed/tv2/400/600', backdrop: 'https://picsum.photos/seed/tv2b/1280/720', overview: 'Relaciones, retos y crecimiento.', vote_average: 7.9 },
  { id: 6, title: 'The Lost City', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie4/400/600', backdrop: 'https://picsum.photos/seed/movie4b/1280/720', overview: 'Una exploradora busca una ciudad perdida.', vote_average: 7.3 },
  { id: 7, title: 'Cyber Nights', mediaType: 'tv', poster: 'https://picsum.photos/seed/tv3/400/600', backdrop: 'https://picsum.photos/seed/tv3b/1280/720', overview: 'En un futuro distópico, un hacker lucha por la libertad.', vote_average: 8.5 },
  { id: 8, title: 'Ocean Depths', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie5/400/600', backdrop: 'https://picsum.photos/seed/movie5b/1280/720', overview: 'Buzos descubren un secreto en las profundidades.', vote_average: 7.8 },
  { id: 9, title: 'Family Ties', mediaType: 'tv', poster: 'https://picsum.photos/seed/tv4/400/600', backdrop: 'https://picsum.photos/seed/tv4b/1280/720', overview: 'Las aventuras de una familia poco convencional.', vote_average: 8.1 },
  { id: 10, title: 'Midnight Express', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie6/400/600', backdrop: 'https://picsum.photos/seed/movie6b/1280/720', overview: 'Un viaje en tren se convierte en pesadilla.', vote_average: 7.6 },
  { id: 11, title: 'Cooking Showdown', mediaType: 'tv', poster: 'https://picsum.photos/seed/tv5/400/600', backdrop: 'https://picsum.photos/seed/tv5b/1280/720', overview: 'Los mejores chefs compiten por la gloria culinaria.', vote_average: 8.0 },
  { id: 12, title: 'Storm Chasers', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie7/400/600', backdrop: 'https://picsum.photos/seed/movie7b/1280/720', overview: 'Un equipo persigue tornados para la ciencia.', vote_average: 7.4 },
  { id: 13, title: 'Medieval Tales', mediaType: 'tv', poster: 'https://picsum.photos/seed/tv6/400/600', backdrop: 'https://picsum.photos/seed/tv6b/1280/720', overview: 'Leyendas y batallas en la edad media.', vote_average: 8.7 },
  { id: 14, title: 'The Heist', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie8/400/600', backdrop: 'https://picsum.photos/seed/movie8b/1280/720', overview: 'El robo del siglo en el corazón de la ciudad.', vote_average: 8.3 },
  { id: 15, title: 'Wild Frontier', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie9/400/600', backdrop: 'https://picsum.photos/seed/movie9b/1280/720', overview: 'Aventura en el lejano oeste.', vote_average: 7.7 },
  { id: 16, title: 'Robot Dreams', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie10/400/600', backdrop: 'https://picsum.photos/seed/movie10b/1280/720', overview: 'Un robot cobra conciencia y busca su lugar.', vote_average: 8.9 },
  { id: 17, title: 'Haunted Mansion', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie11/400/600', backdrop: 'https://picsum.photos/seed/movie11b/1280/720', overview: 'Una familia se muda a una mansión embrujada.', vote_average: 7.2 },
  { id: 18, title: 'Space Patrol', mediaType: 'tv', poster: 'https://picsum.photos/seed/tv7/400/600', backdrop: 'https://picsum.photos/seed/tv7b/1280/720', overview: 'Patrulla espacial defendiendo la galaxia.', vote_average: 8.4 },
  { id: 19, title: 'The Last Dance', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie12/400/600', backdrop: 'https://picsum.photos/seed/movie12b/1280/720', overview: 'Un bailarín retirado vuelve para su última actuación.', vote_average: 8.6 },
  { id: 20, title: 'Mystery Island', mediaType: 'tv', poster: 'https://picsum.photos/seed/tv8/400/600', backdrop: 'https://picsum.photos/seed/tv8b/1280/720', overview: 'Un grupo queda varado en una isla misteriosa.', vote_average: 8.1 },
]

// Items por género (ID de género de TMDb como clave)
const DEMO_GENRES = {
  35: [  // Comedia
    { id: 2, title: 'Another Film', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie2/400/600', overview: 'Comedia ligera que toca el corazón.', vote_average: 7.5 },
    { id: 9, title: 'Family Ties', mediaType: 'tv', poster: 'https://picsum.photos/seed/tv4/400/600', overview: 'Las aventuras de una familia poco convencional.', vote_average: 8.1 },
    { id: 11, title: 'Cooking Showdown', mediaType: 'tv', poster: 'https://picsum.photos/seed/tv5/400/600', overview: 'Los mejores chefs compiten por la gloria culinaria.', vote_average: 8.0 },
  ],
  16: [  // Animación
    { id: 16, title: 'Robot Dreams', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie10/400/600', overview: 'Un robot cobra conciencia y busca su lugar.', vote_average: 8.9 },
    { id: 3, title: 'Space Saga', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie3/400/600', overview: 'Aventura espacial épica.', vote_average: 9.0 },
  ],
  28: [  // Acción
    { id: 14, title: 'The Heist', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie8/400/600', overview: 'El robo del siglo.', vote_average: 8.3 },
    { id: 8, title: 'Ocean Depths', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie5/400/600', overview: 'Buzos descubren un secreto.', vote_average: 7.8 },
  ],
  878: [ // Ciencia Ficción
    { id: 3, title: 'Space Saga', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie3/400/600', overview: 'Aventura espacial épica.', vote_average: 9.0 },
    { id: 7, title: 'Cyber Nights', mediaType: 'tv', poster: 'https://picsum.photos/seed/tv3/400/600', overview: 'Un hacker lucha por la libertad.', vote_average: 8.5 },
    { id: 16, title: 'Robot Dreams', mediaType: 'movie', poster: 'https://picsum.photos/seed/movie10/400/600', overview: 'Un robot cobra conciencia.', vote_average: 8.9 },
    { id: 18, title: 'Space Patrol', mediaType: 'tv', poster: 'https://picsum.photos/seed/tv7/400/600', overview: 'Patrulla espacial.', vote_average: 8.4 },
  ],
}

export function getDemoTrending() {
  return DEMO_ITEMS
}

export function getDemoGenre(genreId) {
  return DEMO_GENRES[genreId] || []
}
