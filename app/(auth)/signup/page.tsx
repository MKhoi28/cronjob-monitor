'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import BackgroundAnimation from '@/components/BackgroundAnimation'
import { THEMES, ThemePicker } from '@/components/ThemeChooserBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { signupSchema } from '@/lib/validations'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTheme, setActiveTheme] = useState(0)
  const [previewTheme, setPreviewTheme] = useState<number | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const theme = THEMES[previewTheme ?? activeTheme]

  async function handleSignup() {
    setLoading(true)
    setError('')

    const parsed = signupSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: theme.palette[0] }}>

      {/* Theme gradient overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            `radial-gradient(circle at 90% 0%, ${theme.accent}20 0%, transparent 50%),` +
            `radial-gradient(circle at 10% 100%, ${theme.palette[1]}60 0%, transparent 45%)`,
          zIndex: 1,
        }}
      />

      {/* Three.js Background */}
      <BackgroundAnimation theme={theme} />

      {/* Theme Picker */}
      <ThemePicker
        className="fixed left-5 top-5 z-50"
        activeTheme={activeTheme}
        onChange={setActiveTheme}
        onPreviewChange={setPreviewTheme}
      />

      {/* Back to home */}
      <Link
        href="/"
        className="fixed top-5 right-5 z-50 font-mono text-xs transition-colors"
        style={{ color: `${theme.accent}99` }}
      >
        {'<'} back to home
      </Link>

      {/* Signup Card */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: theme.accent }}
            />
            <span className="font-mono text-lg font-bold" style={{ color: theme.accent }}>
              CronWatch
            </span>
          </motion.div>

          <Card
            className="border rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(0, 0, 0, 0.75)',
              borderColor: `${theme.accent}25`,
              boxShadow: `0 0 60px ${theme.accent}12, 0 30px 80px rgba(0,0,0,0.6)`,
              backdropFilter: 'blur(20px)',
            }}
          >
            <CardHeader className="pb-4" style={{ borderBottom: `1px solid ${theme.accent}15` }}>
              <CardTitle className="text-2xl font-bold text-white">
                Create account
              </CardTitle>
              <CardDescription className="font-mono text-sm" style={{ color: `${theme.accent}80` }}>
                {'>'} start monitoring for free
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-6">
              {/* Success state */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg p-4 text-center border"
                  style={{
                    background: `${theme.accent}10`,
                    borderColor: `${theme.accent}40`,
                  }}
                >
                  <p className="font-mono text-sm" style={{ color: theme.accent }}>
                    ✓ Account created! Redirecting...
                  </p>
                </motion.div>
              )}

              {/* Error state */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-lg p-3 border"
                  style={{
                    background: 'rgba(255,50,50,0.08)',
                    borderColor: 'rgba(255,50,50,0.3)',
                  }}
                >
                  <p className="text-red-400 text-sm font-mono">✗ {error}</p>
                </motion.div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-mono uppercase tracking-widest"
                  style={{ color: `${theme.accent}90` }}
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={254}
                  autoComplete="email"
                  className="h-11 font-mono text-white placeholder:text-gray-600"
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    borderColor: `${theme.accent}25`,
                  }}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-mono uppercase tracking-widest"
                  style={{ color: `${theme.accent}90` }}
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                  maxLength={128}
                  autoComplete="new-password"
                  className="h-11 font-mono text-white placeholder:text-gray-600"
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    borderColor: `${theme.accent}25`,
                  }}
                />
                <p className="text-xs font-mono" style={{ color: `${theme.accent}50` }}>
                  {'// '} min 8 chars · one uppercase · one number
                </p>
              </div>

              {/* Submit */}
              <Button
                className="w-full h-11 font-mono font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: theme.accent,
                  boxShadow: `0 0 25px ${theme.accent}40`,
                }}
                onClick={handleSignup}
                disabled={loading || success}
              >
                {loading ? '$ creating_account...' : 'Create Account'}
              </Button>

              {/* Footer */}
              <div
                className="pt-4 text-center"
                style={{ borderTop: `1px solid ${theme.accent}15` }}
              >
                <p className="text-sm font-mono text-gray-500">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-semibold transition-colors hover:underline"
                    style={{ color: theme.accent }}
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Theme hint */}
          <p className="text-center font-mono text-xs mt-4" style={{ color: `${theme.accent}40` }}>
            // theme: {theme.name}
          </p>
        </motion.div>
      </div>
    </div>
  )
}