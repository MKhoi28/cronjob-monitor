'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DemoData {
  status: 'healthy' | 'down' | 'late' | 'waiting'
  lastPingAt: string | null
  intervalMins: number
  uptimePct: number
  totalPings: number
  pings: { at: string; ok: boolean }[]
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

const STATUS_CFG = {
  healthy: { color: '#4ade80', label: 'OPERATIONAL',  pulse: true  },
  down:    { color: '#f87171', label: 'OUTAGE',        pulse: false },
  late:    { color: '#fbbf24', label: 'DEGRADED',      pulse: false },
  waiting: { color: '#94a3b8', label: 'WAITING',       pulse: false },
}

export default function DemoWidget() {
  const [data,    setData]    = useState<DemoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick,    setTick]    = useState(0)   // forces timeAgo to re-render each minute

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/demo')
        if (res.ok) setData(await res.json())
      } finally {
        setLoading(false)
      }
    }
    load()
    // Refresh data every 60 seconds
    const dataTimer = setInterval(load, 60_000)
    // Refresh relative time every 30 seconds
    const tickTimer = setInterval(() => setTick(t => t + 1), 30_000)
    return () => { clearInterval(dataTimer); clearInterval(tickTimer) }
  }, [])

  const cfg = data ? (STATUS_CFG[data.status] ?? STATUS_CFG.waiting) : STATUS_CFG.waiting

  return (
    <div style={{
      position: 'relative',
      background: 'rgba(15,23,42,0.6)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      overflow: 'hidden',
      backdropFilter: 'blur(12px)',
      boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), 0 0 40px ${cfg.color}0A`,
      maxWidth: '480px',
      width: '100%',
      fontFamily: "'Space Mono', monospace",
    }}>

      {/* Top accent bar */}
      <div style={{
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${cfg.color}88, transparent)`,
        transition: 'background 0.5s ease',
      }} />

      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '9px', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.25)', marginBottom: '10px', textTransform: 'uppercase' }}>
          ◈ live demo — CronWatch self-monitor
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
            CronWatch Self-Monitor
          </span>

          {/* Status pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '4px 12px', borderRadius: '999px',
            background: `${cfg.color}12`,
            border: `1px solid ${cfg.color}33`,
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em',
            color: cfg.color,
            flexShrink: 0,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: cfg.color,
              boxShadow: cfg.pulse ? `0 0 6px ${cfg.color}` : 'none',
              display: 'inline-block',
            }} />
            {loading ? '...' : cfg.label}
          </div>
        </div>

        {/* Last ping */}
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '6px' }}>
          {loading ? 'loading...' : `last ping ${timeAgo(data?.lastPingAt ?? null)}`}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {[
          { label: 'UPTIME',    value: loading ? '—'  : `${data!.uptimePct}%`,       color: !loading && data!.uptimePct >= 99 ? '#4ade80' : !loading && data!.uptimePct >= 90 ? '#fbbf24' : '#f87171' },
          { label: 'INTERVAL',  value: loading ? '—'  : `${data!.intervalMins}m`,    color: 'rgba(255,255,255,0.7)' },
          { label: 'PINGS',     value: loading ? '—'  : `${data!.totalPings}`,        color: 'rgba(255,255,255,0.7)' },
        ].map((s, i) => (
          <div key={s.label} style={{
            padding: '14px 0',
            textAlign: 'center',
            borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}>
            <div style={{ fontSize: '8px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.2)', marginBottom: '5px' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color, fontFamily: "'Space Mono', monospace" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Ping history bars */}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ fontSize: '8px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase', marginBottom: '10px' }}>
          ping history · last {data?.pings.length ?? 0} checks
        </div>

        {loading ? (
          <div style={{ height: 36, background: 'rgba(255,255,255,0.03)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
        ) : (
          <div style={{ display: 'flex', gap: '3px', height: '36px', alignItems: 'flex-end' }}>
            {(data?.pings ?? []).map((ping, i) => {
              const color = ping.ok ? '#4ade80' : '#f87171'
              const heightPct = 40 + (i / Math.max((data?.pings.length ?? 1) - 1, 1)) * 60
              return (
                <div
                  key={i}
                  title={`${new Date(ping.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — ${ping.ok ? 'OK' : 'FAILED'}`}
                  style={{
                    flex: 1,
                    height: `${heightPct}%`,
                    minHeight: 6,
                    borderRadius: '2px 2px 1px 1px',
                    background: color,
                    opacity: 0.25 + (i / Math.max((data?.pings.length ?? 1) - 1, 1)) * 0.75,
                    boxShadow: ping.ok ? `0 0 4px ${color}44` : 'none',
                    transition: 'height 0.3s ease',
                  }}
                />
              )
            })}
          </div>
        )}

        {/* Axis label */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
          <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.12)', fontFamily: 'monospace' }}>older</span>
          <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.12)', fontFamily: 'monospace' }}>now</span>
        </div>
      </div>

      {/* CTA footer */}
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.2)',
      }}>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>
          This is your product, live.
        </span>
        <Link href="/signup">
          <button style={{
            padding: '7px 16px',
            borderRadius: '8px',
            border: 'none',
            background: '#4ade80',
            color: '#030712',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.08em',
            cursor: 'pointer',
          }}>
            Monitor yours →
          </button>
        </Link>
      </div>

    </div>
  )
}