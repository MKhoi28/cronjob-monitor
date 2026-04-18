'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import BackgroundAnimation from '@/components/BackgroundAnimation'
import { THEMES, ThemePicker } from '@/components/ThemeChooserBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { loginSchema } from '@/lib/validations'
import { usePersistedTheme } from '@/hooks/usePersistedTheme'

export default function LoginContent() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [activeTheme, setActiveTheme] = usePersistedTheme()
  const [previewTheme, setPreviewTheme] = useState<number | null>(null)
  const router       = useRouter()
  const searchParams = useSearchParams()
  const ref          = searchParams.get('ref')

  const theme  = THEMES[previewTheme ?? activeTheme]
  const accent = theme.accent

  async function handleLogin() {
    setLoading(true)
    setError('')

    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email:    parsed.data.email,
      password: parsed.data.password,
    })

    if (error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push(ref === 'founding' ? '/?ref=founding' : '/dashboard')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: theme.palette[0] }}>

      <div className="fixed inset-0 pointer-events-none" style={{
        background:
          `radial-gradient(circle at 10% 0%, ${accent}20 0%, transparent 50%),` +
          `radial-gradient(circle at 90% 100%, ${theme.palette[1]}60 0%, transparent 45%)`,
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
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
            <span className="font-mono text-lg font-bold" style={{ color: accent }}>CronWatch</span>
          </motion.div>

          <Card className="border rounded-2xl overflow-hidden" style={{
            background:     'rgba(0,0,0,0.75)',
            borderColor:    `${accent}25`,
            boxShadow:      `0 0 60px ${accent}12, 0 30px 80px rgba(0,0,0,0.6)`,
            backdropFilter: 'blur(20px)',
          }}>
            <CardHeader className="pb-4" style={{ borderBottom: `1px solid ${accent}15` }}>
              <CardTitle className="text-2xl font-bold text-white text-center">Welcome back</CardTitle>
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
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  maxLength={254} autoComplete="email"
                  className="h-11 font-mono text-white placeholder:text-gray-600"
                  style={{ background: 'rgba(0,0,0,0.5)', borderColor: `${accent}25` }} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-mono uppercase tracking-widest"
                    style={{ color: `${accent}90` }}>Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-mono transition-colors hover:underline"
                    style={{ color: `${accent}66` }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = accent)}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = `${accent}66`)}
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input id="password" type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  maxLength={128} autoComplete="current-password"
                  className="h-11 font-mono text-white placeholder:text-gray-600"
                  style={{ background: 'rgba(0,0,0,0.5)', borderColor: `${accent}25` }} />
              </div>

              <Button
                className="w-full h-11 font-mono font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: accent, boxShadow: `0 0 25px ${accent}40` }}
                onClick={handleLogin} disabled={loading}>
                {loading ? 'Processing...' : 'Sign In'}
              </Button>

              <div className="pt-4 text-center" style={{ borderTop: `1px solid ${accent}15` }}>
                <p className="text-sm font-mono text-gray-500">
                  No account?{' '}
                  <Link
                    href={ref === 'founding' ? `/signup?ref=founding` : '/signup'}
                    className="font-semibold transition-colors hover:underline"
                    style={{ color: accent }}
                  >
                    Create one free
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}