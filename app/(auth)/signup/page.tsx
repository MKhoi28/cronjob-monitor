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
import { signupSchema } from '@/lib/validations'
import { usePersistedTheme } from '@/hooks/usePersistedTheme'

export default function SignupPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  // After signup Supabase sends a verification email — show confirmation UI
  const [verificationSent, setVerificationSent] = useState(false)

  const [activeTheme, setActiveTheme] = usePersistedTheme()
  const [previewTheme, setPreviewTheme] = useState<number | null>(null)

  const theme  = THEMES[previewTheme ?? activeTheme]
  const accent = theme.accent

  async function handleSignup() {
    setLoading(true)
    setError('')

    // Validate + sanitize before touching Supabase
    const parsed = signupSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      setLoading(false)
      return
    }

    // createClient() inside handler to avoid render-time fetch
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email:    parsed.data.email,
      password: parsed.data.password,
      options: {
        // Supabase will redirect here after the user clicks the email link
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      // Generic — don't reveal if email already registered
      setError('Could not create account. Please try again.')
      setLoading(false)
    } else {
      // Show email verification step — don't auto-redirect yet
      setVerificationSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: theme.palette[0] }}>

      <div className="fixed inset-0 pointer-events-none" style={{
        background:
          `radial-gradient(circle at 90% 0%, ${accent}20 0%, transparent 50%),` +
          `radial-gradient(circle at 10% 100%, ${theme.palette[1]}60 0%, transparent 45%)`,
        zIndex: 1,
      }} />

      <BackgroundAnimation theme={theme} />

      <ThemePicker
        className="fixed left-5 top-5 z-50"
        activeTheme={activeTheme}
        onChange={(i) => { setActiveTheme(i); setPreviewTheme(null) }}
        onPreviewChange={setPreviewTheme}
      />

      <Link href="/" className="fixed top-5 right-5 z-50 font-mono text-xs transition-colors"
        style={{ color: `${accent}99` }}>
        {'<'} back to home
      </Link>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
            <span className="font-mono text-lg font-bold" style={{ color: accent }}>CronWatch</span>
          </motion.div>

          <AnimatePresence mode="wait">
            {verificationSent ? (
              /* ── Email verification sent screen ── */
              <motion.div
                key="verify"
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
                    {/* Envelope icon */}
                    <div
                      className="w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto"
                      style={{ borderColor: `${accent}44`, backgroundColor: `${accent}15` }}
                    >
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <rect x="2" y="6" width="24" height="16" rx="2" stroke={accent} strokeWidth="1.8"/>
                        <path d="M2 9l12 8 12-8" stroke={accent} strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
                      <p className="text-sm font-mono" style={{ color: `${accent}88` }}>
                        We sent a verification link to
                      </p>
                      <p className="text-sm font-semibold mt-1" style={{ color: accent }}>
                        {email}
                      </p>
                    </div>

                    <div
                      className="rounded-xl border p-4 text-left space-y-1.5"
                      style={{ borderColor: `${accent}22`, backgroundColor: `${accent}08` }}
                    >
                      <p className="text-xs font-mono" style={{ color: `${accent}77` }}>
                        {'// '} Click the link in the email to activate your account.
                      </p>
                      <p className="text-xs font-mono" style={{ color: `${accent}55` }}>
                        {'// '} Check your spam folder if you don't see it within a minute.
                      </p>
                    </div>

                    <div
                      className="pt-3"
                      style={{ borderTop: `1px solid ${accent}15` }}
                    >
                      <p className="text-sm font-mono text-gray-500">
                        Wrong email?{' '}
                        <button
                          onClick={() => { setVerificationSent(false); setEmail(''); setPassword('') }}
                          className="font-semibold transition-colors hover:underline"
                          style={{ color: accent }}
                        >
                          Start over
                        </button>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              /* ── Signup form ── */
              <motion.div key="form" exit={{ opacity: 0 }}>
                <Card className="border rounded-2xl overflow-hidden" style={{
                  background:     'rgba(0,0,0,0.75)',
                  borderColor:    `${accent}25`,
                  boxShadow:      `0 0 60px ${accent}12, 0 30px 80px rgba(0,0,0,0.6)`,
                  backdropFilter: 'blur(20px)',
                }}>
                  <CardHeader className="pb-4" style={{ borderBottom: `1px solid ${accent}15` }}>
                    <CardTitle className="text-2xl font-bold text-white text-center">Create Account</CardTitle>
                    <CardDescription className="font-mono text-sm" style={{ color: `${accent}80` }}>
                      {'>'} start monitoring for free
                    </CardDescription>
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
                        maxLength={254} autoComplete="email"
                        className="h-11 font-mono text-white placeholder:text-gray-600"
                        style={{ background: 'rgba(0,0,0,0.5)', borderColor: `${accent}25` }} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-xs font-mono uppercase tracking-widest"
                        style={{ color: `${accent}90` }}>Password</Label>
                      <Input id="password" type="password" placeholder="••••••••"
                        value={password} onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSignup()}
                        maxLength={128} autoComplete="new-password"
                        className="h-11 font-mono text-white placeholder:text-gray-600"
                        style={{ background: 'rgba(0,0,0,0.5)', borderColor: `${accent}25` }} />
                    </div>

                    <Button
                      className="w-full h-11 font-mono font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{ background: accent, boxShadow: `0 0 25px ${accent}40` }}
                      onClick={handleSignup} disabled={loading}>
                      {loading ? 'Processing...' : 'Create Account'}
                    </Button>

                    <div className="pt-4 text-center" style={{ borderTop: `1px solid ${accent}15` }}>
                      <p className="text-sm font-mono text-gray-500">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold transition-colors hover:underline"
                          style={{ color: accent }}>Sign in</Link>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center font-mono text-xs mt-4" style={{ color: `${accent}40` }}>
            // theme: {theme.name}
          </p>
        </motion.div>
      </div>
    </div>
  )
}