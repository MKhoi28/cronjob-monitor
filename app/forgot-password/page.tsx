'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import BackgroundAnimation from '@/components/BackgroundAnimation'
import { THEMES, ThemePicker } from '@/components/ThemeChooserBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePersistedTheme } from '@/hooks/usePersistedTheme'
import { z } from 'zod'

// Simple email schema for this form
const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').max(254).email('Invalid email').trim().toLowerCase(),
})

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(false)

  const [activeTheme, setActiveTheme] = usePersistedTheme()
  const [previewTheme, setPreviewTheme] = useState<number | null>(null)

  const theme  = THEMES[previewTheme ?? activeTheme]
  const accent = theme.accent

  async function handleReset() {
    setLoading(true)
    setError('')

    const parsed = emailSchema.safeParse({ email })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    // Always show the sent screen regardless of whether the email exists —
    // this prevents user enumeration (OWASP: don't reveal if account exists)
    if (error) {
      console.error('[forgot-password] Supabase error:', error.message)
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: theme.palette[0] }}>

      <div className="fixed inset-0 pointer-events-none" style={{
        background:
          `radial-gradient(circle at 20% 0%, ${accent}20 0%, transparent 50%),` +
          `radial-gradient(circle at 80% 100%, ${theme.palette[1]}60 0%, transparent 45%)`,
        zIndex: 1,
      }} />

      <BackgroundAnimation theme={theme} />

      <ThemePicker
        className="fixed left-5 top-5 z-50"
        activeTheme={activeTheme}
        onChange={(i) => { setActiveTheme(i); setPreviewTheme(null) }}
        onPreviewChange={setPreviewTheme}
      />

      <Link href="/login" className="fixed top-5 right-5 z-50 font-mono text-xs transition-colors"
        style={{ color: `${accent}99` }}>
        {'<'} back to login
      </Link>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className="w-full max-w-md"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
            <span className="font-mono text-lg font-bold" style={{ color: accent }}>CronWatch</span>
          </motion.div>

          <AnimatePresence mode="wait">
            {sent ? (
              /* ── Sent confirmation ── */
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <Card className="border rounded-2xl overflow-hidden text-center" style={{
                  background:     'rgba(0,0,0,0.75)',
                  borderColor:    `${accent}30`,
                  boxShadow:      `0 0 60px ${accent}15, 0 30px 80px rgba(0,0,0,0.6)`,
                  backdropFilter: 'blur(20px)',
                }}>
                  <CardContent className="pt-10 pb-8 px-8 space-y-5">
                    {/* Key icon */}
                    <div
                      className="w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto"
                      style={{ borderColor: `${accent}44`, backgroundColor: `${accent}15` }}
                    >
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <circle cx="11" cy="11" r="7" stroke={accent} strokeWidth="1.8"/>
                        <path d="M16 16l8 8M19 19l3-3" stroke={accent} strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
                      <p className="text-sm font-mono" style={{ color: `${accent}88` }}>
                        If an account exists for <span style={{ color: accent }}>{email}</span>,
                        a password reset link is on its way.
                      </p>
                    </div>

                    <div
                      className="rounded-xl border p-4 text-left space-y-1.5"
                      style={{ borderColor: `${accent}22`, backgroundColor: `${accent}08` }}
                    >
                      <p className="text-xs font-mono" style={{ color: `${accent}77` }}>
                        The link expires in 1 hour.
                      </p>
                      <p className="text-xs font-mono" style={{ color: `${accent}55` }}>
                        Check your spam folder if it doesn't arrive.
                      </p>
                    </div>

                    <Link
                      href="/login"
                      className="block w-full h-11 rounded-xl font-mono font-bold text-sm text-center leading-[44px] transition-all hover:scale-[1.02]"
                      style={{ backgroundColor: accent, color: theme.palette[0], boxShadow: `0 0 25px ${accent}40` }}
                    >
                      Back to sign in
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              /* ── Request form ── */
              <motion.div key="form" exit={{ opacity: 0 }}>
                <Card className="border rounded-2xl overflow-hidden" style={{
                  background:     'rgba(0,0,0,0.75)',
                  borderColor:    `${accent}25`,
                  boxShadow:      `0 0 60px ${accent}12, 0 30px 80px rgba(0,0,0,0.6)`,
                  backdropFilter: 'blur(20px)',
                }}>
                  <CardHeader className="pb-4" style={{ borderBottom: `1px solid ${accent}15` }}>
                    <CardTitle className="text-2xl font-bold text-white" align ="center">Reset password</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-5 pt-6">
                    {error && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="rounded-lg p-3 border"
                        style={{ background: 'rgba(255,50,50,0.08)', borderColor: 'rgba(255,50,50,0.3)' }}>
                        <p className="text-red-400 text-sm font-mono">✗ {error}</p>
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-mono uppercase tracking-widest"
                        style={{ color: `${accent}90` }}>Email</Label>
                      <Input id="email" type="email" placeholder="you@example.com"
                        value={email} onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleReset()}
                        maxLength={254} autoComplete="email"
                        className="h-11 font-mono text-white placeholder:text-gray-600"
                        style={{ background: 'rgba(0,0,0,0.5)', borderColor: `${accent}25` }} />
                    </div>

                    <Button
                      className="w-full h-11 font-mono font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{ background: accent, boxShadow: `0 0 25px ${accent}40` }}
                      onClick={handleReset} disabled={loading}>
                      {loading ? 'Processing...' : 'Send  Code'}
                    </Button>

                    <div className="pt-4 text-center" style={{ borderTop: `1px solid ${accent}15` }}>
                      <Link href="/login" className="text-sm font-mono transition-colors hover:underline"
                        style={{ color: `${accent}66` }}>
                        Back to sign in
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}