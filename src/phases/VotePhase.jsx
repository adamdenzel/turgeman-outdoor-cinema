import { useState, useEffect, useRef } from 'react'
import InfoModal from '../components/InfoModal'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '../lib/supabase'
import CountdownUnits from '../components/CountdownUnits'
import MoviePoster from '../components/MoviePoster'
import { useTheme } from '../ThemeContext'
import { F } from '../design'

// ─── Single sortable vote card ────────────────────────────────────────────────
function VoteCard({ sug, index, onInfo }) {
  const { C } = useTheme()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: sug.id })

  const [isPressing, setIsPressing] = useState(false)
  const pressTimer = useRef(null)

  const startPress = () => {
    pressTimer.current = setTimeout(() => setIsPressing(true), 220)
  }
  const cancelPress = () => {
    clearTimeout(pressTimer.current)
    setIsPressing(false)
  }
  useEffect(() => { if (!isDragging) cancelPress() }, [isDragging])

  const bgColors = [C.top1Bg, C.top2Bg, C.top3Bg]
  const rankColor = index < 3
    ? (isDark ? `linear-gradient(180deg, ${C.gold} 0%, ${C.gold3} 100%)` : C.gold)
    : C.textDim

  const baseTransform = CSS.Transform.toString(transform) || ''
  const scale = isDragging ? 1.04 : isPressing ? 1.02 : 1

  const style = {
    transform:  `${baseTransform} scale(${scale})`,
    transition: isDragging
      ? 'none'
      : isPressing
      ? 'transform 0.15s ease'
      : transition,
    opacity:    isDragging ? 0.4 : 1,
    zIndex:     isDragging ? 100 : 1,
    position:   'relative',
    cursor:     isDragging ? 'grabbing' : 'default',
  }

  const mergedListeners = {
    ...listeners,
    onPointerDown: (e) => {
      listeners?.onPointerDown?.(e)
      startPress()
    },
    onPointerUp:     (e) => { listeners?.onPointerUp?.(e);     cancelPress() },
    onPointerCancel: (e) => { listeners?.onPointerCancel?.(e); cancelPress() },
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...mergedListeners}>
      <div style={{
        display: 'flex',
        background: index < 3 ? bgColors[index] : C.surface,
        border: `1px solid ${index < 3 ? C.goldGlow : C.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.5)' : 'none',
        userSelect: 'none',
      }}>
        {/* Left strip: rank number */}
        <div style={{
          width: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          background: index < 3
            ? `linear-gradient(180deg, ${C.top1Bg} 0%, ${C.top3Bg} 100%)`
            : C.surface,
          borderRight: `1px solid ${index < 3 ? C.goldGlow : C.border}`,
        }}>
          <span style={{
            fontFamily: F.display,
            fontSize: 22,
            backgroundImage: index < 3 ? rankColor : 'none',
            color: index < 3 ? 'transparent' : C.textDim,
            WebkitBackgroundClip: index < 3 ? 'text' : undefined,
            backgroundClip: index < 3 ? 'text' : undefined,
          }}>
            {index + 1}
          </span>
        </div>

        {/* Center: poster + title */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', minWidth: 0 }}>
          <MoviePoster movie={sug} size="vote" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: F.body, fontSize: 14, fontWeight: 500, color: C.text,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {sug.title}
            </div>
            <div style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted, marginTop: 3 }}>
              {sug.year}{sug.genre ? ` · ${sug.genre}` : ''}
            </div>
          </div>

          {/* Info button */}
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={onInfo}
            style={{
              width: 26, height: 26, flexShrink: 0,
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: '50%', color: C.textMuted,
              fontSize: 12, fontStyle: 'italic', fontFamily: 'serif',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            i
          </button>
        </div>

        {/* Right strip: drag handle */}
        <div
          style={{
            width: 32, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderLeft: `1px solid ${C.border}`,
            background: C.surface,
            color: C.textDim,
            fontSize: 15,
            touchAction: 'none',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          ⠿
        </div>
      </div>
    </div>
  )
}

// ─── VotePhase ────────────────────────────────────────────────────────────────
export default function VotePhase({
  event, suggestions, votes, browserToken, onOpenInfo, voteEndMs, now,
}) {
  const { C, btnPrimary } = useTheme()

  const [order,      setOrder]      = useState([])
  const [submitted,  setSubmitted]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [infoIndex,  setInfoIndex]  = useState(null)

  const myVote = votes.find(v => v.browser_token === browserToken)

  useEffect(() => {
    if (myVote) {
      const ranked = myVote.ranked_movie_ids
        .map(id => suggestions.find(s => s.id === id))
        .filter(Boolean)
      const rest = suggestions.filter(s => !myVote.ranked_movie_ids.includes(s.id))
      setOrder([...ranked, ...rest])
      setSubmitted(true)
    } else if (suggestions.length > 0 && order.length === 0) {
      setOrder([...suggestions])
    }
  }, [suggestions, myVote])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 300, tolerance: 8 } }),
  )

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    setOrder(prev => {
      const oldIdx = prev.findIndex(s => s.id === active.id)
      const newIdx = prev.findIndex(s => s.id === over.id)
      return arrayMove(prev, oldIdx, newIdx)
    })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const rankedIds = order.map(s => s.id)

    if (myVote) {
      await supabase.from('votes').update({ ranked_movie_ids: rankedIds }).eq('id', myVote.id)
    } else {
      await supabase.from('votes').insert({
        event_id:          event.id,
        browser_token:     browserToken,
        ranked_movie_ids:  rankedIds,
      })
    }
    setSubmitted(true)
    setSubmitting(false)
  }

  const voteLeft = Math.max(0, voteEndMs - now)
  const top3     = order.slice(0, 3)

  // ── Post-vote state ──
  if (submitted && !submitting) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px 60px', textAlign: 'center' }}>
        <CountdownUnits ms={voteLeft} label="Voting ends in" />

        <div style={{ fontSize: 36, marginBottom: 10 }}>🍿</div>
        <h2 style={{ fontFamily: F.display, fontSize: 28, color: C.text, marginBottom: 6 }}>
          VOTE SUBMITTED!
        </h2>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.textMuted, marginBottom: 28 }}>
          Your top 3 picks
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
          {top3.map((sug, i) => (
            <div key={sug.id} style={{ flex: 1, maxWidth: 130, position: 'relative' }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                zIndex: 3,
                background: i === 0 ? C.gold : i === 1 ? C.gold2 : C.gold3,
                color: C.bg,
                fontFamily: F.display, fontSize: 14, letterSpacing: '0.05em',
                textAlign: 'center', padding: '3px 0',
                borderRadius: '6px 6px 0 0',
              }}>
                #{i + 1}
              </div>
              <MoviePoster movie={sug} size="grid" style={{ borderRadius: '0 0 8px 8px', marginTop: 22 }} />
              <div style={{
                fontFamily: F.body, fontSize: 12, color: C.text,
                marginTop: 6, fontWeight: 500,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {sug.title}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setSubmitted(false)}
          style={{
            background: 'none', border: 'none',
            color: C.gold, fontFamily: F.body,
            fontSize: 14, cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Change your vote
        </button>
      </div>
    )
  }

  // ── Voting state ──
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 16px 60px' }}>
      <CountdownUnits ms={voteLeft} label="Voting ends in" />

      <p style={{
        fontFamily: F.body, fontSize: 14, color: C.textMuted,
        textAlign: 'center', marginBottom: 24, lineHeight: 1.3,
      }}>
        Rank from best to worst.<br />
        <span style={{ color: C.gold, fontWeight: 600 }}>Submit below</span>
        {' '}when finished.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {order.length >= 3 ? (
            <>
              <div style={{
                border: `1px solid ${C.goldGlow}`,
                borderRadius: 14, padding: 10, marginBottom: 8, position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: -10, left: 14,
                  background: C.bg, paddingInline: 8,
                  fontFamily: F.body, fontSize: 11, fontWeight: 600,
                  color: C.gold, textTransform: 'uppercase', letterSpacing: '0.12em',
                }}>
                  Your Top 3
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {order.slice(0, 3).map((sug, i) => (
                    <VoteCard key={sug.id} sug={sug} index={i} onInfo={() => setInfoIndex(i)} />
                  ))}
                </div>
              </div>

              {order.length > 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {order.slice(3).map((sug, i) => (
                    <VoteCard key={sug.id} sug={sug} index={i + 3} onInfo={() => setInfoIndex(i + 3)} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {order.map((sug, i) => (
                <VoteCard key={sug.id} sug={sug} index={i} onInfo={() => setInfoIndex(i)} />
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>

      <button
        onClick={handleSubmit}
        disabled={submitting || order.length === 0}
        style={{
          ...btnPrimary,
          marginTop: 28, width: '100%', textAlign: 'center',
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? 'SUBMITTING…' : myVote ? 'UPDATE VOTE' : 'SUBMIT VOTE'}
      </button>

      {infoIndex !== null && (
        <InfoModal
          movies={order}
          initialIndex={infoIndex}
          onClose={() => setInfoIndex(null)}
        />
      )}
    </div>
  )
}
