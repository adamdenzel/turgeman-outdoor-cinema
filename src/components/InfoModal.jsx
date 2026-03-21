import { useEffect, useState, useRef } from 'react'
import MoviePoster from './MoviePoster'
import { useTheme } from '../ThemeContext'
import { F } from '../design'

/**
 * InfoModal — single-movie or arrow-navigated carousel.
 *
 * Single:   <InfoModal movie={m} onClose={fn} />
 * Carousel: <InfoModal movies={[...]} initialIndex={2} onClose={fn} />
 */
export default function InfoModal({ movie, movies, initialIndex = 0, onClose }) {
  const { C } = useTheme()

  const list    = movies || (movie ? [movie] : [])
  const [idx,       setIdx]       = useState(initialIndex)
  const [enterFrom, setEnterFrom] = useState(null)
  const current = list[idx] || list[0]

  const cardRef   = useRef(null)
  const animating = useRef(false)
  const idxRef    = useRef(idx)
  const lenRef    = useRef(list.length)
  useEffect(() => { idxRef.current = idx },         [idx])
  useEffect(() => { lenRef.current = list.length }, [list.length])

  const getWidth = () => cardRef.current?.offsetWidth || 360

  const animateTo = (targetX, done) => {
    const el = cardRef.current
    if (!el) return
    animating.current = true
    el.style.transition = 'transform 0.28s ease'
    el.style.transform  = `translateX(${targetX}px)`
    const finish = () => { el.removeEventListener('transitionend', finish); done?.() }
    el.addEventListener('transitionend', finish)
  }

  const snapTo = (x) => {
    const el = cardRef.current
    if (!el) return
    el.style.transition = 'none'
    el.style.transform  = `translateX(${x}px)`
  }

  const navigate = (direction, newIdx) => {
    if (animating.current) return
    animateTo(direction > 0 ? getWidth() : -getWidth(), () => {
      snapTo(0)
      setIdx(newIdx)
      setEnterFrom(direction > 0 ? 'left' : 'right')
    })
  }

  const navigateRef = useRef(navigate)
  useEffect(() => { navigateRef.current = navigate })

  useEffect(() => {
    if (!enterFrom || !cardRef.current) return
    const el   = cardRef.current
    const from = enterFrom === 'right' ? getWidth() : -getWidth()
    el.style.transition = 'none'
    el.style.transform  = `translateX(${from}px)`
    void el.offsetWidth
    el.style.transition = 'transform 0.28s ease'
    el.style.transform  = 'translateX(0px)'
    const finish = () => {
      el.removeEventListener('transitionend', finish)
      animating.current = false
      setEnterFrom(null)
    }
    el.addEventListener('transitionend', finish)
    return () => el.removeEventListener('transitionend', finish)
  }, [enterFrom])

  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft'  && idxRef.current > 0)
        navigateRef.current(1,  idxRef.current - 1)
      if (e.key === 'ArrowRight' && idxRef.current < lenRef.current - 1)
        navigateRef.current(-1, idxRef.current + 1)
    }
    window.addEventListener('keydown', handler)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = prev }
  }, [onClose])

  if (!current) return null

  const hasPrev = idx > 0
  const hasNext = idx < list.length - 1

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: C.modalOverlay,
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2000, padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          borderRadius: 18, width: '100%', maxWidth: 380,
          maxHeight: '88vh', overflowY: 'auto', overflowX: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Clip wrapper */}
        <div style={{ overflow: 'hidden', borderRadius: 18 }}>
          <div ref={cardRef} style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', minHeight: 500 }}>
            <MoviePoster movie={current} size="lg" />

            {/* Gradient */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,0) 50%,rgba(0,0,0,0.7) 63%,rgba(0,0,0,0.92) 73%,rgba(0,0,0,0.88) 100%)',
              borderRadius: 18, zIndex: 2, pointerEvents: 'none',
            }} />

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'rgba(0,0,0,0.45)', border: 'none',
                borderRadius: '50%', width: 32, height: 32,
                color: '#fff', fontSize: 15, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 3,
              }}
            >
              ✕
            </button>

            {/* Movie info */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 22px 26px', zIndex: 3 }}>
              <h3 style={{ fontFamily: F.display, fontSize: 32, margin: 0, color: '#f0ebe5', lineHeight: 1.1 }}>
                {current.title}
              </h3>
              <div style={{ fontFamily: F.body, fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500, marginTop: 8 }}>
                {current.year}{current.genre ? ` · ${current.genre}` : ''}
              </div>
              {current.cast_members && (
                <div style={{ fontFamily: F.body, fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                  {current.cast_members}
                </div>
              )}
              {current.description && (
                <p style={{ fontFamily: F.body, fontSize: 13, color: '#ffffff', marginTop: 12, lineHeight: 1.35, fontWeight: 300 }}>
                  {current.description}
                </p>
              )}
              {current.trailer_url && (
                <a
                  href={current.trailer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    marginTop: 16, padding: '10px 20px',
                    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.35)',
                    borderRadius: 10, color: '#fff',
                    fontFamily: F.body, fontSize: 13, fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  ▶ Watch Trailer
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Arrows + dots — carousel mode only */}
        {list.length > 1 && (
          <div style={{ paddingTop: 14 }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 999, padding: '8px 14px',
            }}>
              {/* Left zone */}
              <div
                onClick={() => hasPrev && navigateRef.current(1, idx - 1)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center',
                  cursor: hasPrev ? 'pointer' : 'default', minWidth: 32,
                }}
              >
                <span style={{
                  fontSize: 22, lineHeight: 1,
                  color: hasPrev ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)',
                  transition: 'color 0.15s ease', userSelect: 'none',
                }}>
                  ‹
                </span>
              </div>

              {/* Dots */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {list.map((_, i) => (
                  <div
                    key={i}
                    onClick={e => {
                      e.stopPropagation()
                      if (i !== idx && !animating.current) navigateRef.current(i > idx ? -1 : 1, i)
                    }}
                    style={{
                      height: 6, width: i === idx ? 18 : 6, borderRadius: 3,
                      background: i === idx ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.25)',
                      transition: 'width 0.2s ease, background 0.2s ease',
                      cursor: 'pointer', flexShrink: 0,
                    }}
                  />
                ))}
              </div>

              {/* Right zone */}
              <div
                onClick={() => hasNext && navigateRef.current(-1, idx + 1)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  cursor: hasNext ? 'pointer' : 'default', minWidth: 32,
                }}
              >
                <span style={{
                  fontSize: 22, lineHeight: 1,
                  color: hasNext ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)',
                  transition: 'color 0.15s ease', userSelect: 'none',
                }}>
                  ›
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
