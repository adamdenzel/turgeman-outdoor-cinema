import { createContext, useContext, useState, useMemo } from 'react'
import { F } from './design'

// ── Dark theme (warm amber dark) ──────────────────────────────────────────────
const darkC = {
  bg:           '#0b0a09',
  surface:      'rgba(255,210,160,0.045)',
  surfaceHov:   'rgba(255,210,160,0.08)',
  border:       'rgba(255,190,120,0.1)',
  gold:         '#fbc800',
  gold2:        '#d4a820',
  gold3:        '#a8862a',
  goldDim:      'rgba(251,200,0,0.15)',
  goldGlow:     'rgba(251,200,0,0.30)',
  text:         '#f0ebe5',
  textMuted:    '#8a7a6c',
  textDim:      '#5c4e42',
  top1Bg:       'rgba(251,200,0,0.14)',
  top2Bg:       'rgba(251,200,0,0.08)',
  top3Bg:       'rgba(251,200,0,0.04)',
  modal:        '#1c1814',
  modalOverlay: 'rgba(0,0,0,0.75)',
  pwOverlay:    'rgba(11,10,9,0.96)',
  dropdown:     '#1c1814',
  bgGradient:   'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(251,200,0,0.10) 0%, transparent 70%)',
}

// ── Light theme (warm cream) ──────────────────────────────────────────────────
const lightC = {
  bg:           '#f0ece6',
  surface:      'rgba(61,90,138,0.06)',
  surfaceHov:   'rgba(61,90,138,0.11)',
  border:       'rgba(61,90,138,0.18)',
  gold:         '#1c3f7a',
  gold2:        '#142f6a',
  gold3:        '#0c1e50',
  goldDim:      'rgba(28,63,122,0.10)',
  goldGlow:     'rgba(28,63,122,0.25)',
  text:         '#0b0a09',
  textMuted:    '#4a5568',
  textDim:      '#8899aa',
  top1Bg:       'rgba(28,63,122,0.14)',
  top2Bg:       'rgba(28,63,122,0.08)',
  top3Bg:       'rgba(28,63,122,0.04)',
  modal:        '#f6f2ec',
  modalOverlay: 'rgba(0,0,0,0.45)',
  pwOverlay:    'rgba(240,236,230,0.97)',
  dropdown:     '#f6f2ec',
  bgGradient:   'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(61,90,138,0.07) 0%, transparent 70%)',
}

const makeStyles = (C, isDark) => ({
  inp: {
    width: '100%',
    padding: '12px 14px',
    fontSize: 14,
    fontFamily: F.body,
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    color: C.text,
    outline: 'none',
    boxSizing: 'border-box',
    colorScheme: isDark ? 'dark' : 'light',
    WebkitAppearance: 'none',
  },
  btnPrimary: {
    padding: '14px 40px',
    fontFamily: F.display,
    fontSize: 22,
    letterSpacing: '0.06em',
    background: C.gold,
    border: 'none',
    borderRadius: 10,
    color: isDark ? C.bg : '#fff8ee',
    cursor: 'pointer',
    display: 'inline-block',
  },
  btnGhost: {
    padding: '10px 22px',
    fontFamily: F.body,
    fontSize: 13,
    fontWeight: 600,
    background: 'transparent',
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    color: C.textMuted,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
})

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('cinema_theme') !== 'light' } catch { return true }
  })

  const toggle = () => setIsDark(d => {
    const next = !d
    try { localStorage.setItem('cinema_theme', next ? 'dark' : 'light') } catch {}
    return next
  })

  const C      = isDark ? darkC : lightC
  const styles = useMemo(() => makeStyles(C, isDark), [isDark])
  const value  = useMemo(() => ({ C, isDark, toggle, ...styles }), [isDark])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
