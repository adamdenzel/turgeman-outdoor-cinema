import MoviePoster from '../components/MoviePoster'
import { useTheme } from '../ThemeContext'
import { F } from '../design'

export default function ResultsPhase({ results, isAdmin, onNewEvent }) {
  const { C, isDark } = useTheme()

  if (!results || results.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: C.textMuted, fontFamily: F.body }}>
        Calculating results…
      </div>
    )
  }

  const winner  = results[0]
  const runners = results.slice(1, 3)

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '10px 16px 60px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          fontFamily: F.display, fontSize: 11, color: C.gold,
          letterSpacing: '0.3em', marginBottom: 4, opacity: 0.8,
        }}>
          TONIGHT'S
        </div>
        <h2 style={{
          fontFamily: F.display, fontSize: 34, color: C.gold,
          letterSpacing: '0.08em', margin: 0, lineHeight: 1,
        }}>
          FEATURE PRESENTATION
        </h2>
        {winner.suggested_by && (
          <div style={{ fontFamily: F.body, fontSize: 13, color: C.textMuted, marginTop: 8 }}>
            Suggested by {winner.suggested_by}
          </div>
        )}
      </div>

      {/* Winner card */}
      <div style={{
        position: 'relative', borderRadius: 18, overflow: 'hidden',
        marginBottom: 24,
        boxShadow: `0 8px 48px ${C.goldGlow}, 0 4px 24px rgba(0,0,0,0.4)`,
        border: `1px solid ${C.goldGlow}`,
      }}>
        <MoviePoster movie={winner} size="lg" />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,0) 50%,rgba(0,0,0,0.7) 63%,rgba(0,0,0,0.92) 73%,rgba(0,0,0,0.88) 100%)',
          zIndex: 2,
        }} />

        {/* #1 badge */}
        <div style={{
          position: 'absolute', top: 14, left: 14,
          background: C.gold, color: C.bg,
          fontFamily: F.display, fontSize: 18,
          padding: '4px 12px', borderRadius: 8, letterSpacing: '0.05em',
          zIndex: 2,
        }}>
          #1
        </div>

        {/* Movie info overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 20px 20px', zIndex: 2 }}>
          <h3 style={{ fontFamily: F.display, fontSize: 30, color: '#f0ebe5', margin: 0, lineHeight: 1.1 }}>
            {winner.title}
          </h3>
          <div style={{ fontFamily: F.body, fontSize: 13, color: C.gold, marginTop: 6, fontWeight: 500 }}>
            {winner.year}{winner.genre ? ` · ${winner.genre}` : ''}
          </div>
          {winner.cast_members && (
            <div style={{ fontFamily: F.body, fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
              {winner.cast_members}
            </div>
          )}
          {winner.description && (
            <p style={{ fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 10, lineHeight: 1.6, fontWeight: 300 }}>
              {winner.description.length > 180 ? winner.description.slice(0, 180) + '…' : winner.description}
            </p>
          )}
        </div>
      </div>

      {/* Trailer button */}
      {winner.trailer_url && (
        <a
          href={winner.trailer_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '14px',
            background: C.goldDim,
            border: `1px solid ${C.goldGlow}`,
            borderRadius: 12,
            color: C.gold,
            fontFamily: F.body, fontSize: 14, fontWeight: 600,
            textDecoration: 'none',
            marginBottom: 32,
          }}
        >
          ▶ Watch Trailer
        </a>
      )}

      {/* Runners up */}
      {runners.length > 0 && (
        <>
          <div style={{
            fontFamily: F.body, fontSize: 12, fontWeight: 600,
            color: C.textMuted, textTransform: 'uppercase',
            letterSpacing: '0.14em', marginBottom: 12,
          }}>
            Runners Up
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {runners.map((movie, i) => (
              <div key={movie.id} style={{ flex: 1, position: 'relative' }}>
                <div style={{
                  position: 'relative', borderRadius: 12, overflow: 'hidden',
                  border: `1px solid ${C.border}`,
                }}>
                  <MoviePoster movie={movie} size="grid" />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg,rgba(11,11,24,0) 40%,rgba(11,11,24,0.9) 100%)',
                  }} />
                  <div style={{
                    position: 'absolute', top: 8, left: 8,
                    background: i === 0 ? C.gold2 : C.gold3,
                    color: C.bg,
                    fontFamily: F.display, fontSize: 14,
                    padding: '2px 8px', borderRadius: 6, zIndex: 2,
                  }}>
                    #{i + 2}
                  </div>
                </div>
                <div style={{
                  fontFamily: F.body, fontSize: 12, color: C.text,
                  marginTop: 6, fontWeight: 500,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {movie.title}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
