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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePersistedTheme } from '@/hooks/usePersistedTheme'
import { z } from 'zod'

// Must match signupSchema password rules for consistency
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8,   'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirm: z.string(),
}).refine(data => data.password === data.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  const [activeTheme, setActiveTheme] = usePersistedTheme()
  const [previewTheme, setPreviewTheme] = useState<number | null>(null)
  const router = useRouter()

  const theme  = THEMES[previewTheme ?? activeTheme]
  const accent = theme.accent

  async function handleUpdate() {
    setLoading(true)
    setError('')

    const parsed = resetPasswordSchema.safeParse({ password, confirm })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      setLoading(false)
      return
    }

    // Supabase automatically detects the session from the URL hash tokens
    // that were embedded in the reset link — no manual token handling needed
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password })

    if (error) {
      setError('Could not update password. Your reset link may have expired.')
      setLoading(false)
    } else {
      setDone(true)
      // Brief pause so user sees the success, then redirect to dashboard
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: theme.palette[0] }}>

      <div className="fixed inset-0 pointer-events-none" style={{
        background:
          `radial-gradient(circle at 30% 0%, ${accent}20 0%, transparent 50%),` +
          `radial-gradient(circle at 70% 100%, ${theme.palette[1]}60 0%, transparent 45%)`,
        zIndex: 1,
      }} />

      <BackgroundAnimation theme={theme} />

      <ThemePicker
        className="fixed left-5 top-5 z-50"
        activeTheme={activeTheme}
        onChange={(i) => { setActiveTheme(i); setPreviewTheme(null) }}
        onPreviewChange={setPreviewTheme}
      />

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
              <CardTitle className="text-2xl font-bold text-white">New password</CardTitle>
              <CardDescription className="font-mono text-sm" style={{ color: `${accent}80` }}>
                {'>'} choose a strong password
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-6">
              {done && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg p-3 border text-center"
                  style={{ background: `${accent}10`, borderColor: `${accent}40` }}>
                  <p className="font-mono text-sm" style={{ color: accent }}>
                    ✓ Password updated! Redirecting to dashboard…
                  </p>
                </motion.div>
              )}

              {error && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="rounded-lg p-3 border"
                  style={{ background: 'rgba(255,50,50,0.08)', borderColor: 'rgba(255,50,50,0.3)' }}>
                  <p className="text-red-400 text-sm font-mono">✗ {error}</p>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-mono uppercase tracking-widest"
                  style={{ color: `${accent}90` }}>New password</Label>
                <Input id="password" type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  maxLength={128} autoComplete="new-password"
                  className="h-11 font-mono text-white placeholder:text-gray-600"
                  style={{ background: 'rgba(0,0,0,0.5)', borderColor: `${accent}25` }} />
                <p className="text-xs font-mono" style={{ color: `${accent}50` }}>
                  {'// '} min 8 chars · one uppercase · one number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-xs font-mono uppercase tracking-widest"
                  style={{ color: `${accent}90` }}>Confirm password</Label>
                <Input id="confirm" type="password" placeholder="••••••••"
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                  maxLength={128} autoComplete="new-password"
                  className="h-11 font-mono text-white placeholder:text-gray-600"
                  style={{ background: 'rgba(0,0,0,0.5)', borderColor: `${accent}25` }} />
              </div>

              <Button
                className="w-full h-11 font-mono font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: accent, boxShadow: `0 0 25px ${accent}40` }}
                onClick={handleUpdate} disabled={loading || done}>
                {loading ? '$ updating...' : '$ set_new_password'}
              </Button>
            </CardContent>
          </Card>

          <p className="text-center font-mono text-xs mt-4" style={{ color: `${accent}40` }}>
            // theme: {theme.name}
          </p>
        </motion.div>
      </div>
    </div>
  )
}