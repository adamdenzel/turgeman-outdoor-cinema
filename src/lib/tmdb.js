const API_KEY  = import.meta.env.VITE_TMDB_API_KEY
const BASE     = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p/w500'

export function posterUrl(path) {
  if (!path) return null
  return `${IMG_BASE}${path}`
}

/** Search movies by title. Returns an array of result objects. */
export async function searchMovies(query) {
  if (!query || query.length < 2) return []
  const res = await fetch(
    `${BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.results || []).slice(0, 8).map(formatMovie)
}

/** Fetch full movie details including cast and trailer URL. */
export async function fetchMovieDetails(tmdbId) {
  const res = await fetch(
    `${BASE}/movie/${tmdbId}?api_key=${API_KEY}&append_to_response=credits,videos&language=en-US`
  )
  if (!res.ok) return null
  const d = await res.json()

  // Build genre string
  const genre = (d.genres || []).slice(0, 2).map(g => g.name).join(', ')

  // Build cast string (top 4 billed actors)
  const cast = (d.credits?.cast || [])
    .slice(0, 4)
    .map(a => a.name)
    .join(', ')

  // Find YouTube trailer
  const videos = d.videos?.results || []
  const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
    || videos.find(v => v.site === 'YouTube')
  const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null

  return {
    tmdb_id:     d.id,
    title:       d.title,
    year:        d.release_date ? parseInt(d.release_date.split('-')[0]) : null,
    genre,
    cast_members: cast,
    description: d.overview || '',
    poster_path: d.poster_path || null,
    trailer_url: trailerUrl,
  }
}

function formatMovie(m) {
  return {
    tmdb_id:     m.id,
    title:       m.title,
    year:        m.release_date ? parseInt(m.release_date.split('-')[0]) : null,
    genre:       (m.genre_ids || []).slice(0, 2).map(id => GENRE_MAP[id]).filter(Boolean).join(', '),
    poster_path: m.poster_path || null,
  }
}

// TMDB genre IDs → names (top genres)
const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western',
}
