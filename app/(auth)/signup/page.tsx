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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { signupSchema } from '@/lib/validations'
import { usePersistedTheme } from '@/hooks/usePersistedTheme'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)

  // ── Policy agreement ────────────────────────────────────────────────────
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [termsError, setTermsError]       = useState(false)

  const [activeTheme, setActiveTheme] = usePersistedTheme()
  const [previewTheme, setPreviewTheme] = useState<number | null>(null)

  const theme  = THEMES[previewTheme ?? activeTheme]
  const accent = theme.accent

  const router       = useRouter()
  const searchParams = useSearchParams()
  const ref          = searchParams.get('ref') // e.g. 'founding'

  async function handleSignup() {
    if (!agreedToTerms) {
      setTermsError(true)
      setTimeout(() => setTermsError(false), 2800)
      return
    }

    setLoading(true)
    setError('')

    const parsed = signupSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email:    parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // Stored in auth.users.raw_user_meta_data — a DB trigger reads
        // this on profile creation and sets profiles.founding_member = true
        data: { founding_member: ref === 'founding' },
      },
    })

    if (signUpError) {
      setError('Could not create account. Please try again.')
      setLoading(false)
      return
    }

    router.push(ref === 'founding' ? '/founding' : '/dashboard')
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
                      <p className="text-sm font-semibold mt-1" style={{ color: accent }}>{email}</p>
                    </div>
                    <div className="rounded-xl border p-4 text-left space-y-1.5"
                      style={{ borderColor: `${accent}22`, backgroundColor: `${accent}08` }}>
                      <p className="text-xs font-mono" style={{ color: `${accent}77` }}>
                        {'// '} Click the link in the email to activate your account.
                      </p>
                      <p className="text-xs font-mono" style={{ color: `${accent}55` }}>
                        {'// '} Check your spam folder if you don't see it within a minute.
                      </p>
                    </div>
                    <div className="pt-3" style={{ borderTop: `1px solid ${accent}15` }}>
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
                    <CardTitle className="text-2xl font-bold text-white text-center">
                      {ref === 'founding' ? 'Join as Founding Member' : 'Create Account'}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-5 pt-6">
                    {/* Founding member badge */}
                    {ref === 'founding' && (
                      <div
                        className="rounded-xl px-4 py-3 flex items-center gap-3"
                        style={{ background: `${accent}0E`, border: `1px solid ${accent}30` }}
                      >
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: accent }}>◈</span>
                        <p className="text-xs font-mono" style={{ color: `${accent}CC` }}>
                          You&apos;re claiming a founding member spot — Pro free forever.
                        </p>
                      </div>
                    )}

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

                    {/* ── Policy agreement checkbox ── */}
                    <motion.div
                      animate={termsError ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      <button
                        type="button"
                        onClick={() => { setAgreedToTerms(prev => !prev); setTermsError(false) }}
                        className="flex items-start gap-3 w-full text-left"
                        aria-checked={agreedToTerms}
                        role="checkbox"
                      >
                        <span
                          className="mt-0.5 shrink-0 flex items-center justify-center rounded transition-all duration-200"
                          style={{
                            width:           18,
                            height:          18,
                            border:          `1.5px solid ${termsError ? '#F87171' : agreedToTerms ? accent : `${accent}45`}`,
                            backgroundColor: agreedToTerms ? `${accent}20` : 'rgba(0,0,0,0.4)',
                            boxShadow:       termsError
                              ? '0 0 0 3px rgba(248,113,113,0.18)'
                              : agreedToTerms
                                ? `0 0 0 3px ${accent}20`
                                : 'none',
                          }}
                        >
                          {agreedToTerms && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M1.5 5L4 7.5L8.5 2.5" stroke={accent} strokeWidth="1.8"
                                strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </span>
                        <span className="text-xs font-mono leading-relaxed" style={{
                          color: termsError ? '#F87171' : 'rgba(255,255,255,0.5)',
                          transition: 'color 200ms ease',
                        }}>
                          {termsError
                            ? 'Please agree to the policies before creating an account.'
                            : <>
                                I have read and agree to the{' '}
                                <Link href="/terms" onClick={e => e.stopPropagation()}
                                  className="underline underline-offset-2"
                                  style={{ color: accent }}>
                                  Terms of Service
                                </Link>
                                {', '}
                                <Link href="/privacy" onClick={e => e.stopPropagation()}
                                  className="underline underline-offset-2"
                                  style={{ color: accent }}>
                                  Privacy Policy
                                </Link>
                                {', and '}
                                <Link href="/cookies" onClick={e => e.stopPropagation()}
                                  className="underline underline-offset-2"
                                  style={{ color: accent }}>
                                  Cookies Policy
                                </Link>
                              </>
                          }
                        </span>
                      </button>
                    </motion.div>

                    <Button
                      className="w-full h-11 font-mono font-bold text-black"
                      style={{
                        background:  agreedToTerms ? accent : `${accent}55`,
                        boxShadow:   agreedToTerms ? `0 0 25px ${accent}40` : 'none',
                        opacity:     agreedToTerms ? 1 : 0.55,
                        cursor:      agreedToTerms ? 'pointer' : 'default',
                        transition:  'all 220ms ease',
                      }}
                      onClick={handleSignup}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : ref === 'founding' ? 'Claim My Spot →' : 'Create Account'}
                    </Button>

                    <div className="pt-4 text-center" style={{ borderTop: `1px solid ${accent}15` }}>
                      <p className="text-sm font-mono text-gray-500">
                        Already have an account?{' '}
                        <Link
                          href={ref === 'founding' ? `/login?ref=founding` : '/login'}
                          className="font-semibold transition-colors hover:underline"
                          style={{ color: accent }}
                        >
                          Sign in
                        </Link>
                      </p>
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