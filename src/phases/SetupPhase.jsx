import { useTheme } from '../ThemeContext'
import { F } from '../design'

export default function SetupPhase({ isAdmin, onCreateEvent }) {
  const { C, btnPrimary } = useTheme()
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      {isAdmin ? (
        <>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
          <h2 style={{ fontFamily: F.display, fontSize: 32, color: C.text, marginBottom: 10, letterSpacing: '0.05em' }}>
            READY TO HOST?
          </h2>
          <p style={{ fontFamily: F.body, fontSize: 15, color: C.textMuted, marginBottom: 32, lineHeight: 1.6 }}>
            Set up a movie night event and invite your friends to vote.
          </p>
          <button onClick={onCreateEvent} style={btnPrimary}>
            CREATE EVENT
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌙</div>
          <h2 style={{ fontFamily: F.display, fontSize: 28, color: C.text, marginBottom: 10, letterSpacing: '0.05em' }}>
            NO EVENT YET
          </h2>
          <p style={{ fontFamily: F.body, fontSize: 15, color: C.textMuted, lineHeight: 1.6 }}>
            Check back soon, or ask the host to set one up.
          </p>
        </>
      )}
    </div>
  )
}
