import { posterUrl } from '../lib/tmdb'
import { C } from '../design'

// Fallback palette for movies without posters
const PALETTES = [
  { bg: 'linear-gradient(160deg,#1a1a2e,#16213e,#0f3460)', accent: '#e94560' },
  { bg: 'linear-gradient(160deg,#0d1117,#161b22,#1f3044)', accent: '#58a6ff' },
  { bg: 'linear-gradient(160deg,#1b0a1a,#2d1b36,#4a1942)', accent: '#e879f9' },
  { bg: 'linear-gradient(160deg,#1a1706,#2d2a0e,#4a4420)', accent: '#facc15' },
  { bg: 'linear-gradient(160deg,#0a1a1a,#0e2f2f,#1a4747)', accent: '#2dd4bf' },
  { bg: 'linear-gradient(160deg,#1a0a0a,#2f1515,#4a2020)', accent: '#f87171' },
  { bg: 'linear-gradient(160deg,#0f0a1a,#1a1530,#2e2050)', accent: '#a78bfa' },
  { bg: 'linear-gradient(160deg,#1a150a,#302510,#4a3820)', accent: '#fb923c' },
]

function hashStr(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff
  return Math.abs(h)
}

/**
 * Movie poster component.
 * Renders a real TMDB poster if poster_path is available, else shows a stylized placeholder.
 *
 * size prop: 'sm' | 'md' | 'vote' | 'grid' | 'lg'
 */
export default function MoviePoster({ movie, size = 'md', style: xStyle = {}, children }) {
  const pal = PALETTES[hashStr(movie.title || 'x') % PALETTES.length]
  const imgSrc = posterUrl(movie.poster_path)

  const sizeMap = {
    sm:   { width: 40,   height: 60,   br: 6  },
    md:   { width: 52,   height: 78,   br: 6  },
    vote: { width: 46,   height: 69,   br: 6  },
    grid: { width: '100%', ratio: true, br: 10 },
    lg:   { width: '100%', ratio: true, br: 16 },
  }

  const s = sizeMap[size] || sizeMap.md
  const isRatio = s.ratio

  return (
    <div style={{
      position: 'relative',
      borderRadius: s.br,
      overflow: 'hidden',
      flexShrink: 0,
      width: s.width,
      height: isRatio ? 0 : s.height,
      paddingBottom: isRatio ? '150%' : undefined,
      background: pal.bg,
      boxShadow: size === 'lg'
        ? '0 8px 40px rgba(0,0,0,0.6)'
        : size === 'grid'
        ? '0 4px 16px rgba(0,0,0,0.4)'
        : '0 2px 8px rgba(0,0,0,0.3)',
      ...xStyle,
    }}>
      {/* Fallback design elements */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.03) 2px,rgba(255,255,255,0.03) 4px)',
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: pal.accent, opacity: 0.8,
        }} />
      </div>

      {/* Real poster image */}
      {imgSrc && (
        <img
          src={imgSrc}
          alt={movie.title}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
          }}
          loading="lazy"
        />
      )}

      {/* Children (badges, overlays, etc.) */}
      {children && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
          {children}
        </div>
      )}
    </div>
  )
}
