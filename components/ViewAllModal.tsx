'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, ArrowLeft, Activity, Clock, Zap } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────
interface Monitor {
  id: string
  name: string
  interval_minutes: number
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
function formatInterval(mins: number) {
  if (!mins || isNaN(mins)) return '?'
  if (mins < 60) return `${mins}m`
  return `${mins / 60}h`
}

function timeAgo(iso: string | null) {
  if (!iso) return 'never'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function statusColor(status: string, accent: string) {
  if (status === 'ok')    return '#4ade80'
  if (status === 'error') return '#f87171'
  return accent
}

// ── Response time line chart ──────────────────────────────────────────────────
function PingChart({ logs, accent }: { logs: PingLog[]; accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || logs.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.getBoundingClientRect().width || 600
    const H = 120
    canvas.width  = W * window.devicePixelRatio
    canvas.height = H * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const maxMs  = Math.max(...logs.map(l => l.duration_ms ?? 0), 1)
    const padX   = 8
    const padY   = 12
    const chartW = W - padX * 2
    const chartH = H - padY * 2 - 18
    const stepX  = logs.length > 1 ? chartW / (logs.length - 1) : chartW
    const yBot   = padY + chartH

    const getX = (i: number)    => padX + i * stepX
    const getY = (log: PingLog) => padY + chartH * (1 - (log.duration_ms ?? 0) / maxMs)

    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padY + (chartH / 4) * i
      ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(W - padX, y); ctx.stroke()
    }

    for (let i = 0; i < logs.length - 1; i++) {
      const x1 = getX(i);     const y1 = getY(logs[i])
      const x2 = getX(i + 1); const y2 = getY(logs[i + 1])
      const isOk = logs[i].ok && logs[i + 1].ok
      ctx.beginPath()
      ctx.moveTo(x1, yBot); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x2, yBot)
      ctx.closePath()
      ctx.fillStyle = isOk ? 'rgba(74,222,128,0.07)' : 'rgba(248,113,113,0.07)'
      ctx.fill()
    }

    const glassGrad = ctx.createLinearGradient(0, padY, 0, yBot)
    glassGrad.addColorStop(0,   'rgba(255,255,255,0.04)')
    glassGrad.addColorStop(0.4, 'rgba(255,255,255,0.015)')
    glassGrad.addColorStop(1,   'rgba(255,255,255,0)')
    ctx.fillStyle = glassGrad
    ctx.fillRect(padX, padY, chartW, chartH)

    for (let i = 0; i < logs.length - 1; i++) {
      const x1 = getX(i);     const y1 = getY(logs[i])
      const x2 = getX(i + 1); const y2 = getY(logs[i + 1])
      const isOk = logs[i].ok && logs[i + 1].ok
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
      ctx.strokeStyle = isOk ? 'rgba(74,222,128,0.45)' : 'rgba(248,113,113,0.45)'
      ctx.lineWidth = 1.5; ctx.stroke()
    }

    logs.forEach((log, i) => {
      const color = log.ok ? '#4ade80' : '#f87171'
      ctx.fillStyle = color; ctx.shadowBlur = 6; ctx.shadowColor = color
      ctx.beginPath(); ctx.arc(getX(i), getY(log), 3.5, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0
    })

    const labelIndices = [0, Math.floor(logs.length / 2), logs.length - 1]
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = '10px monospace'; ctx.textAlign = 'center'
    labelIndices.forEach(i => {
      if (!logs[i]) return
      ctx.fillText(new Date(logs[i].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), getX(i), yBot + 14)
    })

    ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.fillText(`${maxMs}ms`, W - padX, padY + 8)
  }, [logs, accent])

  return <canvas ref={canvasRef} style={{ width: '100%', height: 120, display: 'block' }} />
}

// ── Activity mountain chart ───────────────────────────────────────────────────
// X = days (continuous timeline), Y = ping count per hour bucket
// Green mountain = healthy hour, red = failures
function ActivityMountainChart({ logs, accent }: { logs: PingLog[]; accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; ok: number; total: number } | null>(null)
  const bucketsRef = useRef<{ cx: number; ok: number; total: number; label: string }[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || logs.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.getBoundingClientRect().width || 600
    const H = 140
    canvas.width  = W * window.devicePixelRatio
    canvas.height = H * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const padX  = 8
    const padY  = 10
    const padB  = 28   // room for x-axis labels
    const chartW = W - padX * 2
    const chartH = H - padY - padB
    const yBot   = padY + chartH

    // ── Bucket logs by hour ──────────────────────────────────────────────────
    const bucketMap = new Map<number, { ok: number; total: number; ts: number }>()
    logs.forEach(log => {
      const d   = new Date(log.created_at)
      const key = Math.floor(d.getTime() / (1000 * 60 * 60))  // floor to hour
      const existing = bucketMap.get(key) ?? { ok: 0, total: 0, ts: key * 1000 * 60 * 60 }
      existing.total++
      if (log.ok) existing.ok++
      bucketMap.set(key, existing)
    })

    const buckets = Array.from(bucketMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, v]) => v)

    if (buckets.length === 0) return

    const maxCount = Math.max(...buckets.map(b => b.total), 1)
    const n        = buckets.length
    const stepX    = n > 1 ? chartW / (n - 1) : chartW

    const getX = (i: number) => padX + i * stepX
    const getY = (count: number) => yBot - (count / maxCount) * chartH * 0.85

    // ── Grid lines ───────────────────────────────────────────────────────────
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth   = 1
    for (let i = 1; i <= 3; i++) {
      const y = yBot - (chartH * 0.85 / 3) * i
      ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(W - padX, y); ctx.stroke()
    }

    // ── Draw filled mountain segments between consecutive buckets ────────────
    // Split into green/red runs for clean coloring
    for (let i = 0; i < buckets.length - 1; i++) {
      const b0 = buckets[i];     const x0 = getX(i);     const y0 = getY(b0.total)
      const b1 = buckets[i + 1]; const x1 = getX(i + 1); const y1 = getY(b1.total)
      const allOk = b0.ok === b0.total && b1.ok === b1.total

      // Filled area
      ctx.beginPath()
      ctx.moveTo(x0, yBot)
      ctx.lineTo(x0, y0)
      // Smooth curve between points
      const cpX = (x0 + x1) / 2
      ctx.bezierCurveTo(cpX, y0, cpX, y1, x1, y1)
      ctx.lineTo(x1, yBot)
      ctx.closePath()

      // Glass fill
      const grad = ctx.createLinearGradient(0, Math.min(y0, y1), 0, yBot)
      if (allOk) {
        grad.addColorStop(0,   'rgba(74,222,128,0.30)')
        grad.addColorStop(0.5, 'rgba(74,222,128,0.12)')
        grad.addColorStop(1,   'rgba(74,222,128,0.03)')
      } else {
        grad.addColorStop(0,   'rgba(248,113,113,0.35)')
        grad.addColorStop(0.5, 'rgba(248,113,113,0.14)')
        grad.addColorStop(1,   'rgba(248,113,113,0.03)')
      }
      ctx.fillStyle = grad
      ctx.fill()
    }

    // ── Glass sheen overlay ──────────────────────────────────────────────────
    const sheen = ctx.createLinearGradient(0, padY, 0, yBot)
    sheen.addColorStop(0,   'rgba(255,255,255,0.05)')
    sheen.addColorStop(0.3, 'rgba(255,255,255,0.02)')
    sheen.addColorStop(1,   'rgba(255,255,255,0)')
    ctx.fillStyle = sheen
    ctx.fillRect(padX, padY, chartW, chartH)

    // ── Outline curve on top ─────────────────────────────────────────────────
    for (let i = 0; i < buckets.length - 1; i++) {
      const b0 = buckets[i];     const x0 = getX(i);     const y0 = getY(b0.total)
      const b1 = buckets[i + 1]; const x1 = getX(i + 1); const y1 = getY(b1.total)
      const allOk = b0.ok === b0.total && b1.ok === b1.total
      const cpX = (x0 + x1) / 2
      ctx.beginPath(); ctx.moveTo(x0, y0)
      ctx.bezierCurveTo(cpX, y0, cpX, y1, x1, y1)
      ctx.strokeStyle = allOk ? 'rgba(74,222,128,0.6)' : 'rgba(248,113,113,0.6)'
      ctx.lineWidth   = 1.5
      ctx.stroke()
    }

    // ── Glow dots at peaks ───────────────────────────────────────────────────
    buckets.forEach((b, i) => {
      const color = b.ok === b.total ? '#4ade80' : b.ok === 0 ? '#f87171' : '#fbbf24'
      ctx.fillStyle   = color
      ctx.shadowBlur  = 8
      ctx.shadowColor = color
      ctx.beginPath(); ctx.arc(getX(i), getY(b.total), 2.5, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur  = 0
    })

    // ── X-axis day labels ────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(255,255,255,0.22)'
    ctx.font      = '10px monospace'
    ctx.textAlign = 'center'

    // Show label at first bucket of each unique day
    let lastDay = -1
    buckets.forEach((b, i) => {
      const d   = new Date(b.ts)
      const day = d.getDate()
      if (day !== lastDay) {
        lastDay = day
        const label = d.toLocaleDateString([], { month: 'short', day: 'numeric' })
        ctx.fillText(label, getX(i), yBot + 16)
      }
    })

    // ── Y-axis max label ─────────────────────────────────────────────────────
    ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.fillText(`${maxCount} pings`, W - padX, padY + 10)

    // Store bucket positions for hover
    bucketsRef.current = buckets.map((b, i) => ({
      cx: getX(i),
      ok: b.ok,
      total: b.total,
      label: new Date(b.ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    }))
  }, [logs, accent])

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect   = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const closest = bucketsRef.current.reduce((best, b) =>
      Math.abs(b.cx - mouseX) < Math.abs(best.cx - mouseX) ? b : best
    , bucketsRef.current[0])
    if (closest && Math.abs(closest.cx - mouseX) < 20) {
      setTooltip({ x: closest.cx, y: e.clientY - rect.top - 10, label: closest.label, ok: closest.ok, total: closest.total })
    } else {
      setTooltip(null)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        style={{ width: '100%', height: 140, display: 'block', cursor: 'crosshair' }}
      />
      {tooltip && (
        <div style={{
          position: 'absolute',
          top: Math.max(0, tooltip.y - 52),
          left: Math.min(tooltip.x - 50, (canvasRef.current?.getBoundingClientRect().width ?? 400) - 120),
          background: 'rgba(8,8,12,0.92)',
          border: `1px solid ${accent}33`,
          borderRadius: 7,
          padding: '6px 10px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10,
          backdropFilter: 'blur(8px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        }}>
          <p style={{ fontFamily: 'monospace', fontSize: '0.63rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>{tooltip.label}</p>
          <p style={{
            fontFamily: 'monospace', fontSize: '0.7rem', fontWeight: 700, margin: '2px 0 0',
            color: tooltip.ok === tooltip.total ? '#4ade80' : tooltip.ok === 0 ? '#f87171' : '#fbbf24',
          }}>
            {tooltip.ok}/{tooltip.total} ok · {Math.round((tooltip.ok / tooltip.total) * 100)}%
          </p>
        </div>
      )}
    </div>
  )
}

// ── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar({ logs, accent }: { logs: PingLog[]; accent: string }) {
  if (logs.length === 0) return null
  const ok         = logs.filter(l => l.ok).length
  const successPct = Math.round((ok / logs.length) * 100)
  const avgMs      = Math.round(logs.reduce((s, l) => s + (l.duration_ms ?? 0), 0) / logs.length)
  const p99        = [...logs].sort((a, b) => (b.duration_ms ?? 0) - (a.duration_ms ?? 0))[Math.floor(logs.length * 0.01)]?.duration_ms ?? 0

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

  useEffect(() => {
    if (!selected) return
    setLoadingLogs(true)
    ;(async () => {
      const { data } = await supabase
        .from('ping_logs')
        .select('*')
        .eq('monitor_id', selected.id)
        .order('pinged_at', { ascending: false })
        .limit(1000)

      const mapped = ((data ?? []) as any[]).map(l => ({
        ...l,
        created_at: l.pinged_at,
        ok: l.ok ?? (l.status_code >= 200 && l.status_code < 300),
        status_code: l.status_code ?? 200,
        duration_ms: l.duration_ms ?? null,
      }))
      setLogs(mapped.reverse())
      setLoadingLogs(false)
    })()
  }, [selected])

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

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={cardStyle}>

        {/* Header */}
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

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '1rem 1.25rem' }}>

          {/* VIEW 1: Monitor list */}
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
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(m.status, accent), boxShadow: `0 0 8px ${statusColor(m.status, accent)}88`, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.88rem', color: 'rgba(255,255,255,0.88)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</p>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)', margin: 0, marginTop: 1 }}>last ping {timeAgo(m.last_ping_at)}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', padding: '2px 7px', borderRadius: 4, background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
                          every {formatInterval(m.interval_minutes)}
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

          {/* VIEW 2: Monitor detail */}
          {selected && (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                  { icon: <Activity size={11} />, text: `every ${formatInterval(selected.interval_minutes)}` },
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
                  <StatsBar logs={logs} accent={accent} />

                  {/* Response time chart */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: `1px solid ${accent}18`, padding: '12px 12px 8px', marginBottom: 12 }}>
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

                  {/* Activity mountain chart */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: `1px solid ${accent}18`, padding: '12px 12px 8px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.15em', color: `${accent}66` }}>ACTIVITY · PINGS PER HOUR</p>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {[{ color: '#4ade80', label: 'healthy' }, { color: '#f87171', label: 'failures' }].map(l => (
                          <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: l.color, display: 'inline-block' }} />{l.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ActivityMountainChart logs={logs} accent={accent} />
                  </div>

                  {/* Ping log */}
                  <div style={{ marginTop: 4 }}>
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