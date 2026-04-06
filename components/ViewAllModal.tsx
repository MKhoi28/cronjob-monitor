'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, ArrowLeft, Activity, CheckCircle2, XCircle, Clock, Zap } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────
interface Monitor {
  id: string
  name: string
  interval_seconds: number
  status: 'ok' | 'error' | 'pending'
  last_ping_at: string | null
  created_at: string
}

interface PingLog {
  id: string
  monitor_id: string
  status_code: number | null
  duration_ms: number | null
  created_at: string
  ok: boolean
}

interface ViewAllModalProps {
  accent: string
  panel: string
  base: string
  onClose: () => void
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatInterval(secs: number) {
  if (secs < 60)   return `${secs}s`
  if (secs < 3600) return `${secs / 60}m`
  return `${secs / 3600}h`
}

function timeAgo(iso: string | null) {
  if (!iso) return 'never'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)    return 'just now'
  if (mins < 60)   return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)    return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function statusColor(status: string, accent: string) {
  if (status === 'ok')      return '#4ade80'
  if (status === 'error')   return '#f87171'
  return accent
}

// ── Ping dot chart (different from Cronitor's area chart) ────────────────────
function PingChart({ logs, accent }: { logs: PingLog[]; accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || logs.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.offsetWidth
    const H = 120
    canvas.width  = W * window.devicePixelRatio
    canvas.height = H * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const maxMs    = Math.max(...logs.map(l => l.duration_ms ?? 0), 1)
    const padX     = 8
    const padY     = 12
    const chartW   = W - padX * 2
    const chartH   = H - padY * 2 - 18  // leave room for x-axis labels
    const stepX    = logs.length > 1 ? chartW / (logs.length - 1) : chartW

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padY + (chartH / 4) * i
      ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(W - padX, y); ctx.stroke()
    }

    // Lollipop stems + dots
    logs.forEach((log, i) => {
      const x    = padX + i * stepX
      const pct  = (log.duration_ms ?? 0) / maxMs
      const yTop = padY + chartH * (1 - pct)
      const yBot = padY + chartH
      const color = log.ok ? '#4ade80' : '#f87171'

      // Stem
      ctx.strokeStyle = log.ok ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(x, yBot); ctx.lineTo(x, yTop + 4); ctx.stroke()

      // Dot
      ctx.fillStyle = color
      ctx.shadowBlur = 6
      ctx.shadowColor = color
      ctx.beginPath(); ctx.arc(x, yTop, 3.5, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0
    })

    // X-axis time labels (first, middle, last)
    const labelIndices = [0, Math.floor(logs.length / 2), logs.length - 1]
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.font = `10px monospace`
    ctx.textAlign = 'center'
    labelIndices.forEach(i => {
      if (!logs[i]) return
      const x   = padX + i * stepX
      const y   = padY + chartH + 14
      const str = new Date(logs[i].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      ctx.fillText(str, x, y)
    })

    // Y-axis max label
    ctx.textAlign = 'right'
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.fillText(`${maxMs}ms`, W - padX, padY + 8)

  }, [logs, accent])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: 120, display: 'block' }}
    />
  )
}

// ── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar({ logs, accent }: { logs: PingLog[]; accent: string }) {
  if (logs.length === 0) return null
  const ok        = logs.filter(l => l.ok).length
  const successPct = Math.round((ok / logs.length) * 100)
  const avgMs     = Math.round(logs.reduce((s, l) => s + (l.duration_ms ?? 0), 0) / logs.length)
  const p99       = [...logs].sort((a, b) => (b.duration_ms ?? 0) - (a.duration_ms ?? 0))[Math.floor(logs.length * 0.01)]?.duration_ms ?? 0

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
      {[
        { label: 'success rate', value: `${successPct}%`, color: successPct > 95 ? '#4ade80' : successPct > 80 ? accent : '#f87171' },
        { label: 'avg response', value: `${avgMs}ms`,     color: accent },
        { label: 'p99 response', value: `${p99}ms`,       color: 'rgba(255,255,255,0.55)' },
      ].map(s => (
        <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '0.58rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{s.label.toUpperCase()}</p>
          <p style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
        </div>
      ))}
    </div>
  )
}

// ── Ping log rows ────────────────────────────────────────────────────────────
function PingRows({ logs, accent }: { logs: PingLog[]; accent: string }) {
  return (
    <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '4px 16px', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 4 }}>
        {['time', 'status', 'duration'].map(h => (
          <span key={h} style={{ fontFamily: 'monospace', fontSize: '0.58rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.2)' }}>{h.toUpperCase()}</span>
        ))}
      </div>
      {logs.slice(0, 50).map(log => (
        <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '2px 16px', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>
            {new Date(log.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: log.ok ? '#4ade80' : '#f87171', fontWeight: 600 }}>
            {log.status_code ?? (log.ok ? '200' : 'ERR')}
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: accent, opacity: 0.8, textAlign: 'right' }}>
            {log.duration_ms != null ? `${log.duration_ms}ms` : '—'}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Main modal ───────────────────────────────────────────────────────────────
export function ViewAllModal({ accent, panel, base, onClose }: ViewAllModalProps) {
  const supabase = createClient()

  const [monitors,    setMonitors]    = useState<Monitor[]>([])
  const [selected,    setSelected]    = useState<Monitor | null>(null)
  const [logs,        setLogs]        = useState<PingLog[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [loadingLogs, setLoadingLogs] = useState(false)

  // ── Fetch monitors ────────────────────────────────────────────────────────
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('monitors')
        .select('*')
        .order('created_at', { ascending: false })
      setMonitors((data as Monitor[]) ?? [])
      setLoadingList(false)
    })()
  }, [])

  // ── Fetch ping logs for selected monitor ──────────────────────────────────
  useEffect(() => {
    if (!selected) return
    setLoadingLogs(true)
    ;(async () => {
      const { data } = await supabase
        .from('ping_logs')
        .select('*')
        .eq('monitor_id', selected.id)
        .order('created_at', { ascending: false })
        .limit(200)
      // Reverse so chart is oldest→newest left→right
      const mapped = ((data ?? []) as any[]).map(l => ({
        ...l,
        ok: l.ok ?? (l.status_code >= 200 && l.status_code < 300),
      }))
      setLogs(mapped.reverse())
      setLoadingLogs(false)
    })()
  }, [selected])

  // ── Close on Escape ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 9000,
    background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  }

  const cardStyle: React.CSSProperties = {
    position: 'relative',
    background: `${base}F2`,
    border: `1px solid ${accent}33`,
    borderRadius: 16,
    boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px ${accent}18`,
    width: '100%',
    maxWidth: selected ? 640 : 520,
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'max-width 0.3s ease',
  }

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={cardStyle}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '1rem 1.25rem', borderBottom: `1px solid ${accent}18`, flexShrink: 0 }}>
          {selected && (
            <button
              onClick={() => { setSelected(null); setLogs([]) }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}
            >
              <ArrowLeft size={15} />
            </button>
          )}
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: `${accent}99`, marginBottom: 1 }}>
              {selected ? '◈ MONITOR DETAIL' : '◈ ALL MONITORS'}
            </p>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
              {selected ? selected.name : `${monitors.length} active monitors`}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, cursor: 'pointer', padding: 6, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '1rem 1.25rem' }}>

          {/* ── VIEW 1: Monitor list ── */}
          {!selected && (
            <>
              {loadingList ? (
                <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '2rem 0' }}>Loading...</p>
              ) : monitors.length === 0 ? (
                <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '2rem 0' }}>No monitors yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {monitors.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelected(m)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', borderRadius: 10,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        cursor: 'pointer', textAlign: 'left', width: '100%',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = `${accent}0D`; el.style.borderColor = `${accent}44` }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.03)'; el.style.borderColor = 'rgba(255,255,255,0.07)' }}
                    >
                      {/* Status dot */}
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(m.status, accent), boxShadow: `0 0 8px ${statusColor(m.status, accent)}88`, flexShrink: 0 }} />

                      {/* Name + last ping */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.88rem', color: 'rgba(255,255,255,0.88)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</p>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)', margin: 0, marginTop: 1 }}>last ping {timeAgo(m.last_ping_at)}</p>
                      </div>

                      {/* Interval badge + status */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', padding: '2px 7px', borderRadius: 4, background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
                          every {formatInterval(m.interval_seconds)}
                        </span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: statusColor(m.status, accent), letterSpacing: '0.08em' }}>
                          {m.status === 'ok' ? 'OK' : m.status === 'error' ? 'ERR' : '—'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── VIEW 2: Monitor detail + ping chart ── */}
          {selected && (
            <>
              {/* Meta row */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                  { icon: <Activity size={11} />, text: `every ${formatInterval(selected.interval_seconds)}` },
                  { icon: <Clock size={11} />,    text: `last ping ${timeAgo(selected.last_ping_at)}`        },
                  { icon: <Zap size={11} />,      text: `${logs.length} pings loaded`                        },
                ].map(tag => (
                  <span key={tag.text} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'monospace', fontSize: '0.65rem', padding: '3px 9px', borderRadius: 5, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                    {tag.icon}{tag.text}
                  </span>
                ))}
              </div>

              {loadingLogs ? (
                <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '2rem 0' }}>Loading ping history...</p>
              ) : logs.length === 0 ? (
                <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '2rem 0' }}>No pings recorded yet.</p>
              ) : (
                <>
                  {/* Stats */}
                  <StatsBar logs={logs} accent={accent} />

                  {/* Chart */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: `1px solid ${accent}18`, padding: '12px 12px 8px', marginBottom: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.15em', color: `${accent}66` }}>RESPONSE TIME · LAST {logs.length} PINGS</p>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {[{ color: '#4ade80', label: 'OK' }, { color: '#f87171', label: 'ERR' }].map(l => (
                          <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: l.color, display: 'inline-block' }} />{l.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <PingChart logs={logs} accent={accent} />
                  </div>

                  {/* Ping log */}
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.15em', color: `${accent}55`, marginBottom: 6 }}>PING LOG</p>
                    <PingRows logs={[...logs].reverse()} accent={accent} />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}