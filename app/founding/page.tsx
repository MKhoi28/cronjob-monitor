'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import BackgroundAnimation from '@/components/BackgroundAnimation'
import { THEMES, ThemePicker } from '@/components/ThemeChooserBar'
import { usePersistedTheme } from '@/hooks/usePersistedTheme'
import Link from 'next/link'

const FOUNDING_EMAIL  = 'duongmkhoi.cronwatch@gmail.com'
const MAX_SPOTS       = 10

type Status = 'loading' | 'not-founding' | 'spots-full' | 'pending' | 'emailed'

export default function FoundingPage() {
  const [activeTheme, setActiveTheme] = usePersistedTheme()
  const [previewTheme, setPreviewTheme] = useState<number | null>(null)
  const theme  = THEMES[previewTheme ?? activeTheme]
  const [base, panel] = theme.palette
  const accent = theme.accent

  const router = useRouter()
  const [status,     setStatus]     = useState<Status>('loading')
  const [userEmail,  setUserEmail]  = useState('')
  const [spotsLeft,  setSpotsLeft]  = useState<number | null>(null)
  const [agreed,     setAgreed]     = useState(false)

  useEffect(() => {
    async function init() {
      const supabase = createClient()

      // 1. Check session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { router.replace('/login?ref=founding'); return }

      const userId = session.user.id
      setUserEmail(session.user.email ?? '')

      // 2. Check founding_member flag on profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('founding_member')
        .eq('id', userId)
        .single()

      if (!profile?.founding_member) { router.replace('/dashboard'); return }

      // 3. Count how many spots are taken
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('founding_member', true)

      const taken = count ?? 0
      const left  = Math.max(0, MAX_SPOTS - taken)
      setSpotsLeft(left)

      setStatus(left === 0 ? 'spots-full' : 'pending')
    }
    init()
  }, [])

  // Build mailto href
  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent('CronWatch Founding Member — My Feedback')
    const body    = encodeURIComponent(
`Hi Khôi,

I'd like to claim my founding member spot. Here's my honest feedback:

My account email: ${userEmail}

─────────────────────────────────
WHAT I TRIED / MY USE CASE:


─────────────────────────────────
WHAT WORKED WELL:


─────────────────────────────────
WHAT NEEDS IMPROVEMENT:


─────────────────────────────────
BUGS OR FRICTION I NOTICED:


─────────────────────────────────
I agree to the tester terms:
✓ Use CronWatch actively for at least 2 weeks during beta
✓ Send honest feedback via email
✓ Fill out one short survey before launch day
✓ One spot per person — no throwaway accounts
`)
    return `mailto:${FOUNDING_EMAIL}?subject=${subject}&body=${body}`
  }, [userEmail])

  function handleClaim() {
    if (!agreed) return
    window.location.href = mailtoHref
    setTimeout(() => setStatus('emailed'), 300)
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0C0C0C' }}>
      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#9B7E6A' }} />
    </div>
  )

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: base }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        background:
          `radial-gradient(circle at 15% 10%, ${accent}22 0%, transparent 50%),` +
          `radial-gradient(circle at 85% 90%, ${panel}88 0%, transparent 45%)`,
        zIndex: 1,
      }} />

      <BackgroundAnimation theme={theme} />

      <ThemePicker
        className="fixed left-5 top-5 z-50"
        activeTheme={activeTheme}
        onChange={(i) => { setActiveTheme(i); setPreviewTheme(null) }}
        onPreviewChange={setPreviewTheme}
      />

      <Link href="/dashboard" className="fixed top-5 right-5 z-50 font-mono text-xs transition-colors"
        style={{ color: `${accent}88` }}>
        skip → dashboard
      </Link>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="w-full max-w-lg"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
            <span className="font-mono text-lg font-bold" style={{ color: accent }}>CronWatch</span>
          </motion.div>

          {/* ── Card ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background:     'rgba(0,0,0,0.78)',
              border:         `1px solid ${accent}30`,
              boxShadow:      `0 0 80px ${accent}14, 0 32px 80px rgba(0,0,0,0.6)`,
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div
              className="px-8 py-5 flex items-center gap-3"
              style={{ borderBottom: `1px solid ${accent}18`, background: `${accent}08` }}
            >
              <span style={{ fontFamily: 'monospace', fontSize: '1rem', color: accent }}>◈</span>
              <div>
                <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.25em', color: accent, opacity: 0.6 }}>
                  FOUNDING MEMBER SPOT
                </p>
                <h1 className="text-lg font-bold text-white mt-0.5">Claim free Pro. Forever.</h1>
              </div>
              {spotsLeft !== null && spotsLeft > 0 && (
                <div
                  className="ml-auto shrink-0 rounded-lg px-3 py-1"
                  style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: accent }}>
                    {spotsLeft}/{MAX_SPOTS} left
                  </span>
                </div>
              )}
            </div>

            <div className="px-8 py-6 space-y-6">

              {/* ── SPOTS FULL ── */}
              {status === 'spots-full' && (
                <div className="text-center py-6">
                  <div className="text-4xl mb-4">😔</div>
                  <h2 className="text-lg font-bold text-white mb-2">All spots have been claimed</h2>
                  <p className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    All {MAX_SPOTS} founding member spots are taken. Your account is still
                    active on the free plan — Pro launches May 28.
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-block mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold"
                    style={{ background: accent, color: base }}
                  >
                    Go to Dashboard →
                  </Link>
                </div>
              )}

              {/* ── EMAILED SUCCESS ── */}
              {status === 'emailed' && (
                <div className="text-center py-6">
                  <div className="text-4xl mb-4">📬</div>
                  <h2 className="text-lg font-bold text-white mb-2">Email client opened!</h2>
                  <p className="text-sm font-mono mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Send the email and I&apos;ll personally upgrade your account to Pro free forever
                    once I receive your feedback.
                  </p>
                  <p className="text-xs font-mono" style={{ color: `${accent}77` }}>
                    → {FOUNDING_EMAIL}
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-block mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold"
                    style={{ background: accent, color: base }}
                  >
                    Go to Dashboard →
                  </Link>
                </div>
              )}

              {/* ── PENDING — main card content ── */}
              {status === 'pending' && (
                <>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>
                    You signed up as a founding member — that means Pro free for life.
                    In exchange, I just need you to be a real tester and send me honest feedback.
                  </p>

                  {/* What's expected */}
                  <div
                    className="rounded-xl px-5 py-4 space-y-3"
                    style={{ background: `${accent}0A`, border: `1px solid ${accent}22` }}
                  >
                    <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: accent, opacity: 0.55 }}>
                      WHAT&apos;S EXPECTED FROM YOU
                    </p>
                    {[
                      { icon: '◷', text: 'Use CronWatch actively for at least 2 weeks during beta' },
                      { icon: '◈', text: 'Email me real feedback — what works, what doesn\'t, any bugs you find' },
                      { icon: '◉', text: 'Fill out one short feedback survey before launch day (May 28)' },
                      { icon: '◆', text: 'One spot per person — no throwaway accounts' },
                    ].map(({ icon, text }) => (
                      <div key={text} className="flex items-start gap-3">
                        <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: accent, opacity: 0.5, flexShrink: 0, marginTop: 2 }}>
                          {icon}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Locked email */}
                  <div
                    className="rounded-xl px-4 py-3 flex items-center gap-2 text-sm font-mono"
                    style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${accent}33`, color: `${accent}99` }}
                  >
                    <span>✓</span>
                    <span>{userEmail}</span>
                  </div>

                  {/* Checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={e => setAgreed(e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className="mt-0.5 h-4 w-4 shrink-0 rounded flex items-center justify-center transition-all duration-200"
                      style={{
                        border:     `1.5px solid ${agreed ? accent : `${accent}88`}`,
                        background: agreed ? `${accent}22` : 'rgba(255,255,255,0.05)',
                        boxShadow:  agreed ? `0 0 8px ${accent}44` : 'none',
                      }}
                    >
                      {agreed && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5L3.5 6L8 1" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                      I agree to actively test CronWatch and send honest feedback before launch.
                    </span>
                  </label>

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={handleClaim}
                    disabled={!agreed}
                    className="w-full rounded-xl py-3 text-sm font-semibold"
                    style={{
                      background:  agreed ? accent : `${accent}28`,
                      color:       agreed ? base   : `${accent}55`,
                      cursor:      agreed ? 'pointer' : 'not-allowed',
                      transition:  'background 220ms ease, color 220ms ease',
                    }}
                  >
                    Send Feedback to Claim Spot →
                  </button>

                  <p className="text-center text-xs font-mono" style={{ color: `${accent}44` }}>
                    Opens your email client · No credit card ever
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}