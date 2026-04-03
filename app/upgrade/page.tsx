'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Check, ArrowLeft, Lock, Clock } from 'lucide-react'
import BackgroundAnimation from '@/components/BackgroundAnimation'
import { THEMES, ThemePicker } from '@/components/ThemeChooserBar'
import { usePersistedTheme } from '@/hooks/usePersistedTheme'

const PRO_FEATURES = [
  'Unlimited monitors',
  '1-minute check intervals',
  'SMS + Slack + webhook alerts',
  '90-day ping history',
  'Priority support',
]

const FREE_FEATURES = [
  'Up to 10 monitors',
  '5-minute check intervals',
  'Email alerts only',
  '7-day ping history',
]

// Payments launch date
const LAUNCH_DATE = new Date('2026-05-28')

function daysUntilLaunch() {
  const diff = LAUNCH_DATE.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function UpgradeWallPage() {
  const [activeTheme, setActiveTheme] = usePersistedTheme()
  const [previewTheme, setPreviewTheme] = useState<number | null>(null)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const router = useRouter()

  const theme  = THEMES[previewTheme ?? activeTheme]
  const accent = theme.accent
  const base   = theme.palette[0]
  const panel  = theme.palette[1]
  const days   = daysUntilLaunch()

  function handleUpgrade() {
    setShowComingSoon(true)
    setTimeout(() => setShowComingSoon(false), 3500)
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: base }}>

      {/* Gradient overlays */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background:
          `radial-gradient(circle at 15% 0%, ${accent}18 0%, transparent 45%),` +
          `radial-gradient(circle at 85% 100%, ${panel}50 0%, transparent 40%),` +
          `radial-gradient(circle at 50% 50%, ${accent}06 0%, transparent 60%)`,
        zIndex: 1,
      }} />

      <BackgroundAnimation theme={theme} />

      {/* Theme picker */}
      <ThemePicker
        className="fixed left-5 top-5 z-50"
        activeTheme={activeTheme}
        onChange={(i) => { setActiveTheme(i); setPreviewTheme(null) }}
        onPreviewChange={setPreviewTheme}
      />

      {/* Back link */}
      <Link
        href="/monitors"
        className="fixed top-5 right-5 z-50 flex items-center gap-1.5 font-mono text-xs transition-opacity hover:opacity-100"
        style={{ color: `${accent}88` }}
      >
        <ArrowLeft className="w-3 h-3" />
        back to monitors
      </Link>

      {/* Coming soon toast */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,   scale: 1    }}
            exit={{    opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl border font-mono text-sm"
            style={{
              background:   `rgba(0,0,0,0.88)`,
              borderColor:  `${accent}55`,
              color:        accent,
              backdropFilter: 'blur(16px)',
              boxShadow:    `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${accent}22`,
            }}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              Pro launching in <strong>{days} days</strong> — May 28 🚀
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="w-full max-w-xl"
        >

          {/* Wordmark */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
            <span className="font-mono text-lg font-bold" style={{ color: accent }}>CronWatch</span>
          </motion.div>

          {/* Main card */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              background:     'rgba(0,0,0,0.78)',
              borderColor:    `${accent}28`,
              boxShadow:      `0 0 80px ${accent}10, 0 40px 100px rgba(0,0,0,0.7)`,
              backdropFilter: 'blur(24px)',
            }}
          >

            {/* Top banner */}
            <div
              className="px-8 py-5 flex items-center gap-4"
              style={{ borderBottom: `1px solid ${accent}18`, background: `${accent}08` }}
            >
              <div
                className="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0"
                style={{ borderColor: `${accent}40`, backgroundColor: `${accent}12` }}
              >
                <Lock className="w-5 h-5" style={{ color: accent }} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">
                  You've reached your free plan limit
                </h1>
                <p className="text-xs font-mono mt-0.5" style={{ color: `${accent}77` }}>
                  {'// '} 10 / 10 monitors used
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-8 py-7 space-y-7">

              {/* Hero message */}
              <div className="text-center space-y-2">
                <p className="text-sm font-mono" style={{ color: `${accent}99` }}>
                  Upgrade to <span className="font-bold" style={{ color: accent }}>Pro</span> to
                  keep shipping and monitoring — no limits.
                </p>
              </div>

              {/* Comparison */}
              <div className="grid grid-cols-2 gap-3">
                {/* Free column */}
                <div
                  className="rounded-xl border p-4 space-y-3"
                  style={{ borderColor: `${accent}18`, background: `${accent}05` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white/40 uppercase tracking-widest">Free</span>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                      style={{ borderColor: `${accent}20`, color: `${accent}55` }}
                    >
                      current
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {FREE_FEATURES.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="mt-0.5 text-white/20 text-xs">—</span>
                        <span className="text-xs font-mono text-white/40 leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pro column */}
                <div
                  className="rounded-xl border p-4 space-y-3 relative overflow-hidden"
                  style={{ borderColor: `${accent}50`, background: `${accent}0c` }}
                >
                  <div
                    className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none"
                    style={{ backgroundColor: `${accent}18` }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: accent }}>Pro</span>
                    <Zap className="w-3.5 h-3.5" style={{ color: accent }} />
                  </div>
                  <ul className="space-y-2">
                    {PRO_FEATURES.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: accent }} />
                        <span className="text-xs font-mono text-white/80 leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpgrade}
                  className="w-full h-12 rounded-xl font-mono font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    backgroundColor: accent,
                    color:           base,
                    boxShadow:       `0 0 30px ${accent}44, 0 8px 20px rgba(0,0,0,0.4)`,
                  }}
                >
                  <Zap className="w-4 h-4" />
                  $ upgrade_to_pro
                </motion.button>

                {/* Coming soon badge under button */}
                <p className="text-center text-[10px] font-mono" style={{ color: `${accent}44` }}>
                  // pro launches May 28 · {days} days away
                </p>

                <Link
                  href="/monitors"
                  className="w-full h-10 rounded-xl font-mono text-xs flex items-center justify-center border transition-colors hover:text-white"
                  style={{ borderColor: `${accent}20`, color: `${accent}55` }}
                >
                  maybe later
                </Link>
              </div>

            </div>

            {/* Footer note */}
            <div
              className="px-8 py-4 flex items-center justify-center gap-1.5"
              style={{ borderTop: `1px solid ${accent}12` }}
            >
              <span className="text-[10px] font-mono" style={{ color: `${accent}40` }}>
                // cancel anytime · no hidden fees · instant access
              </span>
            </div>

          </div>

          {/* Theme label */}
          <p className="text-center font-mono text-xs mt-4" style={{ color: `${accent}30` }}>
            // theme: {theme.name}
          </p>

        </motion.div>
      </div>
    </div>
  )
}