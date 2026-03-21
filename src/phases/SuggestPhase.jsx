import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { searchMovies, fetchMovieDetails } from '../lib/tmdb'
import CountdownUnits from '../components/CountdownUnits'
import MoviePoster from '../components/MoviePoster'
import { useTheme } from '../ThemeContext'
import { F } from '../design'

export default function SuggestPhase({
  event, suggestions, browserToken, userName,
  onOpenInfo, sugEndMs, now,
}) {
  const { C, inp } = useTheme()

  const [query,       setQuery]       = useState('')
  const [results,     setResults]     = useState([])
  const [showDrop,    setShowDrop]    = useState(false)
  const [searching,   setSearching]   = useState(false)
  const [adding,      setAdding]      = useState(false)
  const [deletedIds,  setDeletedIds]  = useState(new Set())
  const searchRef = useRef(null)

  const visibleSuggestions = suggestions.filter(s => !deletedIds.has(s.id))
  const mySugs       = visibleSuggestions.filter(s => s.browser_token === browserToken)
  const maxSug       = event.max_suggestions || 2
  const canSuggest   = mySugs.length < maxSug
  const sugLeft      = Math.max(0, sugEndMs - now)

  // Debounced TMDB search
  useEffect(() => {
    if (query.length < 2) { setResults([]); setShowDrop(false); return }
    setSearching(true)
    const timer = setTimeout(async () => {
      const res = await searchMovies(query)
      setResults(res)
      setShowDrop(true)
      setSearching(false)
    }, 350)
    return () => clearTimeout(timer)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowDrop(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isAlreadySuggested = useCallback(
    tmdbId => suggestions.some(s => s.tmdb_id === tmdbId),
    [suggestions]
  )

  const handleSelect = async (movie) => {
    if (isAlreadySuggested(movie.tmdb_id) || adding) return
    setAdding(true)
    setQuery('')
    setShowDrop(false)

    const details = await fetchMovieDetails(movie.tmdb_id)
    const record = details || movie

    await supabase.from('suggestions').insert({
      event_id:     event.id,
      tmdb_id:      record.tmdb_id,
      title:        record.title,
      year:         record.year,
      genre:        record.genre || '',
      cast_members: record.cast_members || '',
      description:  record.description || '',
      poster_path:  record.poster_path || null,
      trailer_url:  record.trailer_url || null,
      suggested_by: userName,
      browser_token: browserToken,
    })
    setAdding(false)
  }

  const handleRemove = async (suggestion) => {
    setDeletedIds(prev => new Set([...prev, suggestion.id]))
    await supabase.from('suggestions').delete().eq('id', suggestion.id)
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '28px 16px 40px' }}>
      {/* Countdown */}
      <div style={{ marginBottom: 28 }}>
        <CountdownUnits ms={sugLeft} label="Voting begins in" />
      </div>

      {/* Search bar — hidden when out of suggestions */}
      {canSuggest ? (
        <div ref={searchRef} style={{ position: 'relative', marginBottom: 10 }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Add your movie suggestions"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                ...inp,
                fontSize: 16,
                padding: '14px 18px',
                border: `1px solid ${C.goldGlow}`,
                borderRadius: 14,
              }}
            />
            {searching && (
              <div style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                color: C.textDim, fontSize: 12,
              }}>
                …
              </div>
            )}
          </div>

          {/* Remaining count */}
          <div style={{
            fontFamily: F.body, fontSize: 13, color: C.textDim,
            textAlign: 'center', marginTop: 8,
          }}>
            {maxSug - mySugs.length} suggestion{maxSug - mySugs.length !== 1 ? 's' : ''} remaining
          </div>

          {/* Dropdown */}
          {showDrop && results.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: C.dropdown,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              marginTop: 6,
              zIndex: 100,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}>
              {results.map(movie => {
                const already = isAlreadySuggested(movie.tmdb_id)
                return (
                  <div
                    key={movie.tmdb_id}
                    onClick={() => !already && handleSelect(movie)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px',
                      cursor: already ? 'default' : 'pointer',
                      opacity: already ? 0.5 : 1,
                      borderBottom: `1px solid ${C.border}`,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!already) e.currentTarget.style.background = C.surfaceHov }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <MoviePoster movie={movie} size="sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: F.body, fontSize: 14, fontWeight: 500, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {movie.title}
                      </div>
                      <div style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                        {movie.year}{movie.genre ? ` · ${movie.genre}` : ''}
                      </div>
                    </div>
                    {already && (
                      <div style={{ fontFamily: F.body, fontSize: 11, color: C.textDim, flexShrink: 0 }}>
                        already suggested
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '20px 0 28px',
          fontFamily: F.body, fontSize: 15, color: C.textMuted,
        }}>
          ✓ Suggestions complete! Come back soon to vote.
        </div>
      )}

      {/* Suggestion grid */}
      {visibleSuggestions.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginTop: 20,
        }}>
          {visibleSuggestions.map(sug => {
            const isMine = sug.browser_token === browserToken
            return (
              <div
                key={sug.id}
                style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => onOpenInfo(sug)}
              >
                <MoviePoster movie={sug} size="grid">
                  {isMine && (
                    <button
                      onClick={e => { e.stopPropagation(); handleRemove(sug) }}
                      style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 24, height: 24,
                        background: 'rgba(0,0,0,0.6)',
                        border: `1px solid rgba(255,255,255,0.15)`,
                        borderRadius: '50%',
                        color: '#fff', fontSize: 11,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 3,
                      }}
                    >
                      ✕
                    </button>
                  )}
                </MoviePoster>

                <div style={{ marginTop: 8 }}>
                  <div style={{
                    fontFamily: F.body, fontSize: 13, fontWeight: 500,
                    color: C.text, lineHeight: 1.3,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {sug.title}
                  </div>
                  <div style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, marginTop: 3 }}>
                    {sug.year}{sug.genre ? ` · ${sug.genre}` : ''}
                  </div>
                  <div style={{ fontFamily: F.body, fontSize: 11, color: C.textDim, marginTop: 2 }}>
                    by {sug.suggested_by}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {visibleSuggestions.length === 0 && !canSuggest && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: C.textDim, fontFamily: F.body, fontSize: 14 }}>
          No suggestions yet. Be the first!
        </div>
      )}
    </div>
  )
}
