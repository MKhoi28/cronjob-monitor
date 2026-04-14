'use client'
import { useEffect, useCallback, useState } from 'react'

interface Props {
  monitorCount: number
  hasPinged: boolean
  userId: string
  firstMonitorId?: string
}

export default function OnboardingChecklist({ monitorCount, hasPinged, userId, firstMonitorId }: Props) {
  const [dismissed,     setDismissed]     = useState(false)
  const [statusVisited, setStatusVisited] = useState(false)
  const [showCongrats,  setShowCongrats]  = useState(false)

  useEffect(() => {
    if (!userId) return
    if (localStorage.getItem(`cw-checklist-dismissed-${userId}`)) setDismissed(true)
    if (localStorage.getItem(`cw-status-visited-${userId}`))      setStatusVisited(true)
  }, [userId])

  const steps = [
    { label: 'Create your account',       done: true             },
    { label: 'Create your first monitor', done: monitorCount > 0 },
    { label: 'Make your first ping',      done: hasPinged        },
    { label: 'Check your status page',    done: statusVisited    },
  ]

  const allDone        = steps.every(s => s.done)
  const completedCount = steps.filter(s => s.done).length

  const dismiss = useCallback(() => {
    // Write both keys: the per-user key the checklist reads,
    // and the global key the sidebar reads (no userId suffix)
    localStorage.setItem(`cw-checklist-dismissed-${userId}`, 'true')
    localStorage.setItem('cw-checklist-dismissed', 'true')
    setDismissed(true)
    window.dispatchEvent(new Event('checklist-dismissed'))
  }, [userId])

  // When all steps complete, show congrats badge (no auto-dismiss)
  useEffect(() => {
    if (allDone && !dismissed) setShowCongrats(true)
  }, [allDone, dismissed])

  function handleStatusVisit() {
    localStorage.setItem(`cw-status-visited-${userId}`, 'true')
    setStatusVisited(true)
  }

  if (dismissed) return null

  const statusHref = firstMonitorId ? `/status/${firstMonitorId}` : null

  // ── Congrats badge ────────────────────────────────────────────────────────
  if (showCongrats) {
    return (
      <div className="border border-zinc-700 rounded-lg p-5 bg-zinc-900/50">
        <div className="flex flex-col items-center text-center gap-4 py-2">

          {/* Animated check circle */}
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full"
            style={{ backgroundColor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M5 14L11 20L23 8"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ strokeDasharray: 32, animation: 'cw-draw-check 0.5s ease forwards' }}
              />
            </svg>
            <span className="absolute inset-0 rounded-full border border-orange-500/30 animate-ping" />
          </div>

          {/* Text */}
          <div>
            <p className="text-white font-semibold text-sm">You're all set!</p>
            <p className="text-zinc-400 text-xs mt-1 font-mono leading-relaxed">
              All 4 steps complete —<br />CronWatch is ready to monitor your jobs.
            </p>
          </div>

          {/* Full progress bar */}
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full w-full transition-all duration-700" />
          </div>

          {/* OK button */}
          <button
            onClick={dismiss}
            className="px-6 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all duration-200"
            style={{
              backgroundColor: '#f97316',
              color: '#000',
              boxShadow: '0 0 18px rgba(249,115,22,0.45)',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(249,115,22,0.7)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 18px rgba(249,115,22,0.45)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
            }}
          >
            OK, GOT IT
          </button>
        </div>

        <style>{`
          @keyframes cw-draw-check {
            from { stroke-dashoffset: 32; }
            to   { stroke-dashoffset: 0;  }
          }
        `}</style>
      </div>
    )
  }

  // ── Normal checklist ──────────────────────────────────────────────────────
  return (
    <div className="border border-zinc-800 rounded-lg p-5 bg-zinc-900/50 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-semibold text-sm">Getting started</p>
          <p className="text-zinc-500 text-xs mt-0.5">{completedCount} of {steps.length} steps complete</p>
        </div>
        <button
          onClick={dismiss}
          className="text-zinc-600 hover:text-zinc-400 text-xs font-mono transition-colors"
        >
          dismiss
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map(({ label, done }, i) => (
          <div key={label} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
              done ? 'bg-orange-500 border-orange-500' : 'border-zinc-600'
            }`}>
              {done && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 4L3 6L7 2" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className={`text-sm flex items-center gap-2 transition-colors ${
              done ? 'text-zinc-500 line-through' : 'text-zinc-300'
            }`}>
              {label}
              {i === 3 && !done && statusHref && (
                <a
                  href={statusHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleStatusVisit}
                  className="text-orange-500 hover:text-orange-400 text-xs font-mono transition-colors"
                >
                  Visit →
                </a>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}