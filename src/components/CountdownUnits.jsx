import { useTheme } from '../ThemeContext'
import { F } from '../design'

export default function CountdownUnits({ ms, label }) {
  const { C } = useTheme()
  const total = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = n => String(n).padStart(2, '0')

  const units = []
  if (d > 0) units.push({ val: pad(d), label: 'Days' })
  units.push(
    { val: pad(h), label: 'Hours' },
    { val: pad(m), label: 'Min'   },
    { val: pad(s), label: 'Sec'   },
  )

  return (
    <div style={{ textAlign: 'center', marginBottom: 20 }}>
      {label && (
        <div style={{
          fontFamily: F.body, fontSize: 11, color: C.textDim,
          textTransform: 'uppercase', letterSpacing: '0.18em',
          marginBottom: 15, fontWeight: 500,
        }}>
          {label}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
        {units.map((u, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: F.display, fontSize: 30, color: C.gold, letterSpacing: '0.04em', lineHeight: 1 }}>
              {u.val}
            </div>
            <div style={{ fontFamily: F.body, fontSize: 8, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 0, fontWeight: 500 }}>
              {u.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
