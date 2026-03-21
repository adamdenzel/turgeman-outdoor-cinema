import { useState } from 'react'
import { useTheme } from '../ThemeContext'
import { F } from '../design'

const ADMIN_PASSWORD = '1234'

export default function AdminPasswordPrompt({ onSuccess }) {
  const { C, inp } = useTheme()
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  const submit = () => {
    if (value === ADMIN_PASSWORD) {
      sessionStorage.setItem('cinema_admin', '1')
      onSuccess()
    } else {
      setError(true)
      setValue('')
      setTimeout(() => setError(false), 1800)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: C.pwOverlay,
      backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 3000, padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 340, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 16, filter: 'drop-shadow(0 0 12px rgba(232,185,35,0.4))' }}>
          ⚙
        </div>
        <h2 style={{ fontFamily: F.display, fontSize: 28, color: C.text, marginBottom: 6, letterSpacing: '0.05em' }}>
          ADMIN ACCESS
        </h2>
        <p style={{ fontFamily: F.body, fontSize: 13, color: C.textMuted, marginBottom: 24 }}>
          Enter the admin password to continue.
        </p>
        <input
          type="password"
          placeholder="Password"
          value={value}
          onChange={e => { setValue(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          autoFocus
          style={{
            ...inp,
            textAlign: 'center',
            fontSize: 18,
            letterSpacing: '0.2em',
            borderColor: error ? '#e87070' : C.border,
            transition: 'border-color 0.2s',
          }}
        />
        {error && (
          <div style={{ fontFamily: F.body, fontSize: 13, color: '#e87070', marginTop: 10 }}>
            Incorrect password. Try again.
          </div>
        )}
        <button
          onClick={submit}
          style={{
            marginTop: 16, width: '100%', padding: '13px',
            fontFamily: F.display, fontSize: 20, letterSpacing: '0.06em',
            background: C.gold, border: 'none', borderRadius: 10,
            color: C.bg, cursor: 'pointer',
          }}
        >
          UNLOCK
        </button>
      </div>
    </div>
  )
}
