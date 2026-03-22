import { useTheme } from '../ThemeContext'
import { F } from '../design'

function CinemaLogo() {
  const { isDark } = useTheme()
  return (
    <img
      src={isDark ? '/outdoor-cinema-logo-dark.svg' : '/outdoor-cinema-logo-light.svg'}
      alt="Turgeman Outdoor Cinema"
      style={{ display: 'block', margin: '0 auto', height: 90, width: 'auto' }}
    />
  )
}

function GoldDivider() {
  const { C, isDark } = useTheme()
  return (
    <div style={{ position: 'relative', height: 1, margin: '0 auto', maxWidth: 125 }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(90deg, transparent, ${C.gold2}, ${C.gold}, ${C.gold2}, transparent)`,
        opacity: isDark ? 0.5 : 0.75,
      }} />
    </div>
  )
}

export default function Header({ eventDate }) {
  const { C } = useTheme()
  const dateStr = eventDate
    ? new Date(eventDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div style={{ paddingTop: 30, paddingBottom: 0, textAlign: 'center' }}>
      <CinemaLogo />
      {/* Date centered below logo */}
      {dateStr && (
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 12,
          color: C.gold,
          letterSpacing: '0.22em',
          opacity: 0.9,
          lineHeight: 1,
          marginTop: 15,
        }}>
          {dateStr.toUpperCase()}
        </div>
      )}
      <div style={{ marginTop: 22 }}>
        <GoldDivider />
      </div>
    </div>
  )
}
