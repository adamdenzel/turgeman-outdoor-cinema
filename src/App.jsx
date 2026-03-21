import { useState, useEffect, useMemo } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { rankedChoiceVote } from './utils/rcv'
import { getBrowserToken, getUserName, setUserName as saveUserName } from './utils/token'
import { ThemeProvider, useTheme } from './ThemeContext'
import { F } from './design'

import Header               from './components/Header'
import AdminPasswordPrompt  from './components/AdminPasswordPrompt'
import AdminModal           from './components/AdminModal'
import InfoModal            from './components/InfoModal'

import SetupPhase    from './phases/SetupPhase'
import NamePhase     from './phases/NamePhase'
import SuggestPhase  from './phases/SuggestPhase'
import VotePhase     from './phases/VotePhase'
import ResultsPhase  from './phases/ResultsPhase'

// ─── Phase computation ────────────────────────────────────────────────────────
function computePhase(event, now, userName) {
  if (!event) return 'setup'
  if (event.force_phase) return event.force_phase

  const sugEnd  = new Date(event.suggest_deadline).getTime()
  const voteEnd = new Date(event.vote_deadline).getTime()

  if (now >= voteEnd) return 'results'
  if (now >= sugEnd)  return 'vote'
  if (!userName)      return 'name'
  return 'suggest'
}

// ─── Theme toggle pill ────────────────────────────────────────────────────────
function ThemeToggle() {
  const { C, isDark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        position: 'fixed', bottom: 24, right: 16, zIndex: 1000,
        background: 'none', border: 'none', padding: 4,
        cursor: 'pointer', display: 'block',
      }}
    >
      {/* Track */}
      <div style={{
        position: 'relative',
        width: 38, height: 22,
        borderRadius: 11,
        background: isDark ? 'rgba(255,190,100,0.12)' : 'rgba(160,100,20,0.18)',
        border: `1px solid ${C.border}`,
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        {/* Thumb */}
        <div style={{
          position: 'absolute',
          top: 3,
          left: isDark ? 3 : 19,
          width: 14, height: 14,
          borderRadius: '50%',
          background: C.gold,
          transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </button>
  )
}

// ─── Main Cinema component (path-aware) ──────────────────────────────────────
function Cinema() {
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith('/admin')
  const { C, isDark, toggle } = useTheme()

  // ── Browser identity ──
  const [browserToken] = useState(() => getBrowserToken())
  const [userName, setUserName_] = useState(() => getUserName())

  // ── Data state ──
  const [event,       setEvent]       = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [votes,       setVotes]       = useState([])
  const [loading,     setLoading]     = useState(true)

  // ── Admin state ──
  const [adminUnlocked,  setAdminUnlocked]  = useState(() => sessionStorage.getItem('cinema_admin') === '1')
  const [showPwPrompt,   setShowPwPrompt]   = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)

  // ── UI state ──
  const [infoMovie, setInfoMovie] = useState(null)
  const [now,       setNow]       = useState(Date.now())

  // ── Computed ──
  const phase = useMemo(() => computePhase(event, now, userName), [event, now, userName])

  const sugEndMs  = event ? new Date(event.suggest_deadline).getTime() : null
  const voteEndMs = event ? new Date(event.vote_deadline).getTime()    : null

  const results = useMemo(() => {
    if (phase !== 'results' || !suggestions.length) return []
    const ballots    = votes.map(v => v.ranked_movie_ids)
    const candidates = suggestions.map(s => s.id)
    const ranked     = rankedChoiceVote(ballots, candidates)
    return ranked.map(id => suggestions.find(s => s.id === id)).filter(Boolean)
  }, [phase, suggestions, votes])

  // ── Clock ──
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // ── Load initial data ──
  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const { data: evData } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const ev = evData || null
      setEvent(ev)

      if (ev) {
        const [{ data: sugs }, { data: vts }] = await Promise.all([
          supabase.from('suggestions').select('*').eq('event_id', ev.id).order('created_at'),
          supabase.from('votes').select('*').eq('event_id', ev.id),
        ])
        setSuggestions(sugs || [])
        setVotes(vts || [])
      }
    } catch (err) {
      console.error('loadData error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Real-time subscriptions ──
  useEffect(() => {
    if (!event) return

    const channel = supabase
      .channel(`event-${event.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suggestions' },
        () => refreshSuggestions(event.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes', filter: `event_id=eq.${event.id}` },
        () => refreshVotes(event.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `id=eq.${event.id}` },
        payload => { if (payload.new) setEvent(payload.new) })
      .subscribe()

    const newEventChannel = supabase
      .channel('new-events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' },
        () => loadData())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(newEventChannel)
    }
  }, [event?.id])

  async function refreshSuggestions(eventId) {
    const { data } = await supabase.from('suggestions').select('*').eq('event_id', eventId).order('created_at')
    setSuggestions(data || [])
  }

  async function refreshVotes(eventId) {
    const { data } = await supabase.from('votes').select('*').eq('event_id', eventId)
    setVotes(data || [])
  }

  // ── Handlers ──
  const handleNameSubmit = (name) => { saveUserName(name); setUserName_(name) }

  const handleAdminClick = () => {
    if (adminUnlocked) { setShowAdminModal(true) } else { setShowPwPrompt(true) }
  }

  const handleAdminUnlock = () => {
    setAdminUnlocked(true)
    setShowPwPrompt(false)
    setShowAdminModal(true)
  }

  // ── Show password prompt immediately on /admin if not unlocked ──
  useEffect(() => {
    if (isAdminPage && !adminUnlocked && !loading) setShowPwPrompt(true)
  }, [isAdminPage, adminUnlocked, loading])

  // ─── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: C.bg, transition: 'background 0.3s',
      }}>
        <ThemeToggle />
        <div style={{ fontFamily: F.display, fontSize: 20, color: C.gold, letterSpacing: '0.2em' }}>
          LOADING…
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      background: C.bg,
      backgroundImage: C.bgGradient,
      transition: 'background 0.3s',
    }}>
      {/* Admin password prompt */}
      {showPwPrompt && <AdminPasswordPrompt onSuccess={handleAdminUnlock} />}

      {/* Admin settings modal */}
      {showAdminModal && (
        <AdminModal
          event={event}
          onClose={() => setShowAdminModal(false)}
          onSaved={() => loadData()}
        />
      )}

      {/* Movie info modal */}
      {infoMovie && <InfoModal movie={infoMovie} onClose={() => setInfoMovie(null)} />}

      {/* Header */}
      <Header eventDate={event?.event_date} />

      {/* Phase content */}
      <main style={{ paddingTop: 8, flex: 1 }}>
        {phase === 'setup' && (
          <SetupPhase
            isAdmin={isAdminPage && adminUnlocked}
            onCreateEvent={() => setShowAdminModal(true)}
          />
        )}
        {phase === 'name' && <NamePhase onSubmit={handleNameSubmit} />}
        {phase === 'suggest' && (
          <SuggestPhase
            event={event}
            suggestions={suggestions}
            browserToken={browserToken}
            userName={userName}
            onOpenInfo={setInfoMovie}
            sugEndMs={sugEndMs}
            now={now}
          />
        )}
        {phase === 'vote' && (
          <VotePhase
            event={event}
            suggestions={suggestions}
            votes={votes}
            browserToken={browserToken}
            onOpenInfo={setInfoMovie}
            voteEndMs={voteEndMs}
            now={now}
          />
        )}
        {phase === 'results' && (
          <ResultsPhase
            results={results}
            isAdmin={isAdminPage && adminUnlocked}
            onNewEvent={() => setShowAdminModal(true)}
          />
        )}
      </main>

      {/* Footer — theme toggle + admin button */}
      <footer style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderTop: `1px solid ${C.border}`,
      }}>
        {isAdminPage && adminUnlocked ? (
          <button
            onClick={handleAdminClick}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '8px 14px',
              color: C.textMuted,
              fontFamily: F.body, fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            ⚙ Admin
          </button>
        ) : <div />}

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer' }}
        >
          <div style={{
            position: 'relative', width: 38, height: 22, borderRadius: 11,
            background: isDark ? 'rgba(255,190,100,0.12)' : 'rgba(61,90,138,0.18)',
            border: `1px solid ${C.border}`,
            transition: 'background 0.3s, border-color 0.3s',
          }}>
            <div style={{
              position: 'absolute', top: 3, left: isDark ? 3 : 19,
              width: 14, height: 14, borderRadius: '50%',
              background: C.gold,
              transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
        </button>
      </footer>
    </div>
  )
}

// ─── App with routing + ThemeProvider ────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"       element={<Cinema />} />
          <Route path="/admin"  element={<Cinema />} />
          <Route path="/admin/" element={<Cinema />} />
          <Route path="*"       element={<Cinema />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
