'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, AlertTriangle, CheckCircle, TrendingUp, Lightbulb, Activity } from 'lucide-react'

interface Analysis {
  verdict:        string
  severity:       'healthy' | 'warning' | 'critical'
  pattern:        string
  diagnosis:      string
  recommendation: string
  quickFix:       string | null
}

interface Stats {
  totalPingsAnalyzed:  number
  avgGapMin:           number
  maxGapMin:           number
  minGapMin:           number
  missedPings:         number
  missedPct:           number
  trendPct:            number
  peakActivityDay:     string
  peakActivityHour:    number
  expectedIntervalMin: number
}

interface AnalyzeModalProps {
  monitor:  { id: string; name: string; status: string }
  accent:   string
  base:     string
  panel:    string
  onClose:  () => void
}

const LOADING_LINES = [
  '> connecting to analysis engine...',
  '> fetching ping history...',
  '> computing gap statistics...',
  '> detecting behavioral patterns...',
  '> running root cause analysis...',
  '> generating recommendations...',
]

const severityConfig = {
  healthy:  { color: '#34D399', icon: CheckCircle,    label: 'HEALTHY'  },
  warning:  { color: '#FBBF24', icon: AlertTriangle,  label: 'WARNING'  },
  critical: { color: '#F87171', icon: AlertTriangle,  label: 'CRITICAL' },
}

export default function AnalyzeModal({ monitor, accent, base, panel, onClose }: AnalyzeModalProps) {
  const [phase, setPhase]         = useState<'loading' | 'done' | 'error'>('loading')
  const [lineIdx, setLineIdx]     = useState(0)
  const [analysis, setAnalysis]   = useState<Analysis | null>(null)
  const [stats, setStats]         = useState<Stats | null>(null)
  const [errorMsg, setErrorMsg]   = useState('')

  // Cycle through loading lines while fetching
  useEffect(() => {
    if (phase !== 'loading') return
    const t = setInterval(() => {
      setLineIdx(i => Math.min(i + 1, LOADING_LINES.length - 1))
    }, 600)
    return () => clearInterval(t)
  }, [phase])

  // Kick off the API call immediately on mount
  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const res  = await fetch(`/api/monitors/${monitor.id}/analyze`, { method: 'POST' })
        const data = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setErrorMsg(data.error || 'Analysis failed.')
          setPhase('error')
          return
        }
        setAnalysis(data.analysis)
        setStats(data.stats)
        setPhase('done')
      } catch {
        if (!cancelled) {
          setErrorMsg('Network error. Please try again.')
          setPhase('error')
        }
      }
    }
    run()
    return () => { cancelled = true }
  }, [monitor.id])

  const sev    = analysis ? severityConfig[analysis.severity] : null
  const SevIcon = sev?.icon ?? Activity

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      >
        {/* Modal — stop click propagation so clicking inside doesn't close */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{    opacity: 0, scale: 0.94, y: 20  }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-xl rounded-2xl border overflow-hidden"
          style={{
            background:     'rgba(0,0,0,0.88)',
            borderColor:    `${accent}33`,
            boxShadow:      `0 0 80px ${accent}14, 0 40px 100px rgba(0,0,0,0.8)`,
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Header */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${accent}18`, background: `${accent}08` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg border flex items-center justify-center"
                style={{ borderColor: `${accent}40`, backgroundColor: `${accent}12` }}
              >
                <Zap className="w-4 h-4" style={{ color: accent }} />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-white">AI Failure Analyst</p>
                <p className="text-[10px] font-mono" style={{ color: `${accent}66` }}>
                  {monitor.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: `${accent}66` }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">

            {/* ── Loading state ── */}
            {phase === 'loading' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <div
                  className="rounded-xl border p-4 font-mono text-xs space-y-1.5 min-h-[160px]"
                  style={{ borderColor: `${accent}20`, background: `${accent}06` }}
                >
                  {LOADING_LINES.slice(0, lineIdx + 1).map((line, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ color: i === lineIdx ? accent : `${accent}50` }}
                    >
                      {line}
                      {i === lineIdx && (
                        <span className="animate-pulse">█</span>
                      )}
                    </motion.p>
                  ))}
                </div>
                <p className="text-center text-[10px] font-mono" style={{ color: `${accent}40` }}>
                  // analyzing {monitor.name} — this takes a few seconds
                </p>
              </motion.div>
            )}

            {/* ── Error state ── */}
            {phase === 'error' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border p-5 text-center space-y-3"
                style={{ borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.06)' }}
              >
                <p className="font-mono text-sm text-red-400">✗ {errorMsg}</p>
                <button
                  onClick={onClose}
                  className="text-xs font-mono underline"
                  style={{ color: `${accent}66` }}
                >
                  close
                </button>
              </motion.div>
            )}

            {/* ── Results ── */}
            {phase === 'done' && analysis && stats && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {/* Verdict banner */}
                <div
                  className="rounded-xl border p-4 flex items-start gap-3"
                  style={{
                    borderColor:     `${sev!.color}44`,
                    backgroundColor: `${sev!.color}0c`,
                  }}
                >
                  <SevIcon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: sev!.color }} />
                  <div>
                    <span
                      className="text-[10px] font-mono font-bold tracking-widest"
                      style={{ color: sev!.color }}
                    >
                      {sev!.label}
                    </span>
                    <p className="text-sm text-white font-medium mt-0.5 leading-snug">
                      {analysis.verdict}
                    </p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'AVG GAP',   value: `${stats.avgGapMin}m`,    note: `expected ${stats.expectedIntervalMin}m` },
                    { label: 'MISSED',    value: `${stats.missedPct}%`,    note: `${stats.missedPings} pings`             },
                    { label: 'TREND',     value: stats.trendPct > 0 ? `+${stats.trendPct}%` : `${stats.trendPct}%`,
                      note: stats.trendPct > 5 ? 'worsening' : stats.trendPct < -5 ? 'improving' : 'stable',
                      color: stats.trendPct > 10 ? '#F87171' : stats.trendPct > 5 ? '#FBBF24' : '#34D399' },
                  ].map(s => (
                    <div
                      key={s.label}
                      className="rounded-lg border p-3 text-center"
                      style={{ borderColor: `${accent}18`, background: `${accent}06` }}
                    >
                      <p className="text-[9px] font-mono tracking-widest mb-1" style={{ color: `${accent}55` }}>
                        {s.label}
                      </p>
                      <p className="text-base font-mono font-bold" style={{ color: s.color ?? accent }}>
                        {s.value}
                      </p>
                      <p className="text-[9px] font-mono mt-0.5" style={{ color: `${accent}44` }}>
                        {s.note}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Sections */}
                {[
                  { icon: TrendingUp,   label: 'PATTERN',        text: analysis.pattern        },
                  { icon: Activity,     label: 'DIAGNOSIS',      text: analysis.diagnosis      },
                  { icon: Lightbulb,    label: 'RECOMMENDATION', text: analysis.recommendation },
                ].map(({ icon: Icon, label, text }) => (
                  <div key={label} className="space-y-1.5">
                    <p className="text-[10px] font-mono tracking-widest" style={{ color: `${accent}55` }}>
                      // {label}
                    </p>
                    <div
                      className="rounded-xl border p-4 flex gap-3"
                      style={{ borderColor: `${accent}18`, background: `${accent}06` }}
                    >
                      <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: `${accent}88` }} />
                      <p className="text-xs font-mono leading-relaxed" style={{ color: `${accent}cc` }}>
                        {text}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Quick fix pill */}
                {analysis.quickFix && (
                  <div
                    className="rounded-xl border p-3 flex items-center gap-2"
                    style={{ borderColor: `${accent}33`, background: `${accent}0a` }}
                  >
                    <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
                    <p className="text-xs font-mono" style={{ color: accent }}>
                      <span className="opacity-60">quick fix → </span>
                      {analysis.quickFix}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <p className="text-center text-[10px] font-mono pt-1" style={{ color: `${accent}30` }}>
                  // analyzed {stats.totalPingsAnalyzed} pings · powered by Claude
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}