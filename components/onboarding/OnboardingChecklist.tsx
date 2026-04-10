'use client'
import { useEffect, useState } from 'react'

interface Props {
  monitorCount: number
  hasPinged: boolean
}

export default function OnboardingChecklist({ monitorCount, hasPinged }: Props) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const done = sessionStorage.getItem('cw-checklist-dismissed')
    if (done) setDismissed(true)
  }, [])

  const steps = [
    { label: 'Create your account', done: true },
    { label: 'Create your first monitor', done: monitorCount > 0 },
    { label: 'Make your first ping', done: hasPinged },
    { label: 'Check your status page', done: hasPinged },
  ]

  const allDone = steps.every(s => s.done)
  const completedCount = steps.filter(s => s.done).length

  function dismiss() {
    sessionStorage.setItem('cw-checklist-dismissed', 'true')
    setDismissed(true)
    window.dispatchEvent(new Event('checklist-dismissed'))
  }

  // Auto-dismiss when all done
  useEffect(() => {
    if (allDone) {
      setTimeout(dismiss, 2000)
    }
  }, [allDone])

  if (dismissed) return null

  return (
    <div className="border border-zinc-800 rounded-lg p-5 bg-zinc-900/50 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-semibold text-sm">Getting started</p>
          <p className="text-zinc-500 text-xs mt-0.5">{completedCount} of {steps.length} steps complete</p>
        </div>
        <button onClick={dismiss} className="text-zinc-600 hover:text-zinc-400 text-xs font-mono transition-colors">
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
        {steps.map(({ label, done }) => (
          <div key={label} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
              done
                ? 'bg-orange-500 border-orange-500'
                : 'border-zinc-600'
            }`}>
              {done && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 4L3 6L7 2" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className={`text-sm transition-colors ${done ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {allDone && (
        <p className="text-orange-500 text-xs font-mono animate-pulse">
          ✓ All set — you're fully onboarded!
        </p>
      )}
    </div>
  )
}