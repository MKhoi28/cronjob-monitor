'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import HeroAnimation from '@/components/HeroAnimation'
import { THEMES, ThemeChooserBar } from '@/components/ThemeChooserBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { loginSchema } from '@/lib/validations'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTheme, setActiveTheme] = useState(0)
  const router = useRouter()
  const supabase = createClient()
  const theme = THEMES[activeTheme]

  async function handleLogin() {
    setLoading(true)
    setError('')

    // ---- Client-side validation ----
    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (error) {
      // Generic error — don't reveal if email exists
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen text-foreground relative overflow-hidden">
      {/* Subtle theme-based gradient overlay */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            `radial-gradient(circle at 8% 0%, ${theme.accent}22 0%, transparent 45%),` +
            `radial-gradient(circle at 100% 100%, ${theme.palette[1]}44 0%, transparent 40%),` +
            `linear-gradient(to bottom, ${theme.palette[0]}00 0%, ${theme.palette[0]}88 100%)`,
          zIndex: 5,
        }}
      />

      {/* Theme Chooser - Positioned at top */}
      <div className="fixed top-0 left-0 right-0 z-30 mx-auto max-w-7xl px-4 py-8">
        <ThemeChooserBar activeTheme={activeTheme} onChange={setActiveTheme} />
      </div>

      {/* Hero Animation Background - Contains Three.js and parallax layers */}
      <div className="fixed inset-0" style={{ zIndex: 0 }}>
        <HeroAnimation />
      </div>

      {/* Login Card - Centered */}
      <div className="relative z-20 min-h-screen flex items-center justify-center px-4 pt-32 pb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
          className="w-full max-w-md"
        >
          <Card 
            className="border-green-500/20 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden"
            style={{
              background: 'rgba(0, 0, 0, 0.75)',
              boxShadow: '0 0 60px rgba(0,255,70,0.1), 0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            <CardHeader className="space-y-1 pb-4 border-b border-green-500/10">
              <CardTitle className="text-2xl font-bold tracking-tight text-white">
                Welcome back
              </CardTitle>
              <CardDescription className="text-sm text-gray-400 font-mono">
                {'>'} Sign in to your CronWatch account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm font-mono">{error}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono"
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
                  className="h-10 bg-black/50 border-green-500/20 focus-visible:ring-1 focus-visible:ring-green-400 focus-visible:border-green-400 text-white placeholder:text-gray-500 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label 
                  htmlFor="password" 
                  className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={128}
                  autoComplete="current-password"
                  className="h-10 bg-black/50 border-green-500/20 focus-visible:ring-1 focus-visible:ring-green-400 focus-visible:border-green-400 text-white placeholder:text-gray-500 font-mono"
                />
              </div>
              <Button 
                className="w-full h-10 text-sm font-bold font-mono bg-green-500 hover:bg-green-400 text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  boxShadow: '0 0 20px rgba(0,255,70,0.3)',
                }}
                onClick={handleLogin} 
                disabled={loading}
              >
                {loading ? '$ authenticating...' : '$ sign_in'}
              </Button>
              <div className="pt-4 space-y-3 border-t border-green-500/10">
                <p className="text-center text-sm text-gray-400 font-mono">
                  Don't have an account?{' '}
                  <Link 
                    href="/signup" 
                    className="text-green-400 hover:text-green-300 hover:underline transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
                <p className="text-center text-xs text-gray-600 font-mono">
                  <Link 
                    href="/" 
                    className="hover:text-green-400 hover:underline transition-colors"
                  >
                    {'<'} Back to CronWatch homepage
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