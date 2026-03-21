import { useState } from 'react'
import { useTheme } from '../ThemeContext'
import { F } from '../design'

export default function NamePhase({ onSubmit }) {
  const { C, inp } = useTheme()
  const [name, setName] = useState('')

  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div style={{ padding: '40px 24px', maxWidth: 480, margin: '0 auto' }}>
      <p style={{ fontFamily: F.body, fontSize: 16, color: C.textMuted, marginBottom: 20, lineHeight: 1.5 }}>
        Enter your name to start suggesting movies
      </p>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          autoFocus
          style={{ ...inp, paddingRight: 52, fontSize: 16 }}
        />
        <button
          onClick={submit}
          disabled={!name.trim()}
          style={{
            position: 'absolute', right: 8,
            width: 36, height: 36,
            background: name.trim() ? C.gold : C.goldDim,
            border: 'none', borderRadius: 8,
            color: name.trim() ? C.bg : C.gold,
            fontSize: 16, cursor: name.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s, color 0.2s', flexShrink: 0,
          }}
        >
          →
        </button>
      </div>
    </div>
  )
}
