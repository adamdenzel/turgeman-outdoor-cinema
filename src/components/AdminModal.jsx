import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../ThemeContext'
import { F } from '../design'

function toLocalDt(d) {
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

const defaultDt = offsetDays => toLocalDt(new Date(Date.now() + offsetDays * 86400_000))

export default function AdminModal({ event, onClose, onSaved }) {
  const { C, inp, btnPrimary, btnGhost } = useTheme()
  const isNew = !event

  const [eventDate,  setEventDate]  = useState(event?.event_date  || new Date(Date.now() + 7*86400_000).toISOString().split('T')[0])
  const [sugDL,      setSugDL]      = useState(event?.suggest_deadline ? toLocalDt(new Date(event.suggest_deadline)) : defaultDt(3))
  const [voteDL,     setVoteDL]     = useState(event?.vote_deadline    ? toLocalDt(new Date(event.vote_deadline))    : defaultDt(6))
  const [maxSug,     setMaxSug]     = useState(event?.max_suggestions  || 2)
  const [saving,     setSaving]     = useState(false)

  const labelStyle = {
    fontFamily: F.body, fontSize: 12, color: C.textMuted,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    fontWeight: 600, marginBottom: 6, display: 'block',
  }

  const fieldWrap = { marginBottom: 18 }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      event_date:       eventDate,
      suggest_deadline: new Date(sugDL).toISOString(),
      vote_deadline:    new Date(voteDL).toISOString(),
      max_suggestions:  maxSug,
    }

    let error
    if (isNew) {
      const res = await supabase.from('events').insert({ ...payload, force_phase: null })
      error = res.error
    } else {
      const res = await supabase.from('events').update(payload).eq('id', event.id)
      error = res.error
    }

    setSaving(false)
    if (!error) { onSaved(); onClose() }
    else console.error('Save error:', error)
  }

  const handleForcePhase = async (phase) => {
    if (!event) return
    await supabase.from('events').update({ force_phase: phase }).eq('id', event.id)
    onSaved()
    onClose()
  }

  const handleNewEvent = async () => {
    if (!window.confirm('Start a brand new movie night? This will archive the current event.')) return
    const base = Date.now()
    const payload = {
      event_date:       new Date(base + 7 * 86400_000).toISOString().split('T')[0],
      suggest_deadline: new Date(base + 3 * 86400_000).toISOString(),
      vote_deadline:    new Date(base + 6 * 86400_000).toISOString(),
      max_suggestions:  maxSug,
      force_phase:      null,
    }
    await supabase.from('events').insert(payload)
    onSaved()
    onClose()
  }

  const phaseBtn = (label, phase) => (
    <button
      key={phase}
      onClick={() => handleForcePhase(phase)}
      style={{
        flex: 1,
        padding: '7px 4px',
        fontFamily: F.body,
        fontSize: 12,
        fontWeight: 600,
        background: event?.force_phase === phase ? C.goldDim : 'transparent',
        border: `1px solid ${event?.force_phase === phase ? C.gold : C.border}`,
        borderRadius: 8,
        color: event?.force_phase === phase ? C.gold : C.textMuted,
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: C.modalOverlay,
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2500, padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 420,
          background: C.modal,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          padding: '28px 28px 24px',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: C.surface, border: 'none',
            borderRadius: '50%', width: 30, height: 30,
            color: C.textMuted, fontSize: 15, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ✕
        </button>

        <h2 style={{
          fontFamily: F.display, fontSize: 26,
          color: C.text, marginBottom: 24, letterSpacing: '0.05em',
        }}>
          {isNew ? 'CREATE EVENT' : 'EVENT SETTINGS'}
        </h2>

        <div style={fieldWrap}>
          <label style={labelStyle}>Event Date</label>
          <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} style={inp} />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Suggestions close on</label>
          <input type="datetime-local" value={sugDL} onChange={e => setSugDL(e.target.value)} style={inp} />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Voting closes on</label>
          <input type="datetime-local" value={voteDL} onChange={e => setVoteDL(e.target.value)} style={inp} />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Max suggestions per person</label>
          <select
            value={maxSug}
            onChange={e => setMaxSug(Number(e.target.value))}
            style={{ ...inp, cursor: 'pointer' }}
          >
            {[1,2,3,4,5].map(n => (
              <option key={n} value={n}>{n} movie{n > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        {event && (
          <div style={{ marginBottom: 24 }}>
            <label style={{ ...labelStyle, marginBottom: 10 }}>Jump to phase</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {phaseBtn('Suggest', 'suggest')}
              {phaseBtn('Vote',    'vote'   )}
              {phaseBtn('Results', 'results')}
            </div>
            {event.force_phase && (
              <button
                onClick={() => handleForcePhase(null)}
                style={{
                  marginTop: 8,
                  background: 'none', border: 'none',
                  color: C.textDim, fontSize: 12, cursor: 'pointer',
                  fontFamily: F.body,
                }}
              >
                ✕ Clear override (use timer)
              </button>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          {isNew ? (
            <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, flex: 1, textAlign: 'center' }}>
              {saving ? 'STARTING…' : 'START EVENT'}
            </button>
          ) : (
            <>
              <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, flex: 1, textAlign: 'center' }}>
                {saving ? 'SAVING…' : 'SAVE'}
              </button>
              <button onClick={handleNewEvent} style={{ ...btnGhost, flexShrink: 0 }}>
                New Event
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
