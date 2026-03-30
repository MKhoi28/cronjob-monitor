'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createMonitorSchema } from '@/lib/validations'
import { useAppTheme } from '@/components/DashboardShell'

export default function NewMonitorPage() {
  const [name, setName]                   = useState('')
  const [intervalMinutes, setInterval]    = useState(60)
  const [graceMinutes, setGrace]          = useState(5)
  const [alertEmail, setAlertEmail]       = useState('')
  const [error, setError]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  // Pull the active theme from DashboardShell context
  const theme     = useAppTheme()
  const [base, panel] = theme.palette
  const accent    = theme.accent

  async function handleCreate() {
    setLoading(true)
    setError('')

    const parsed = createMonitorSchema.safeParse({
      name,
      interval_minutes: intervalMinutes,
      grace_minutes:    graceMinutes,
      alert_email:      alertEmail,
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // ✅ Check monitor count BEFORE inserting
    const { count } = await supabase
      .from('monitors')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= 10) {
      router.push('/upgrade')   // ← redirect to upgrade wall
      return
    }

    const { error } = await supabase.from('monitors').insert({
      user_id:          user.id,
      name:             parsed.data.name,
      interval_minutes: parsed.data.interval_minutes,
      grace_minutes:    parsed.data.grace_minutes,
      alert_email:      parsed.data.alert_email,
      status:           'waiting',
    })

    if (error) {
      // ✅ Catch the trigger's specific error and redirect
      if (error.message.includes('MONITOR_LIMIT_REACHED')) {
        router.push('/upgrade')
        return
      }
      setError('Failed to create monitor. Please try again.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const inputStyle = {
    background:   `${panel}88`,
    borderColor:  `${accent}33`,
    color:        'white',
    caretColor:   accent,
  }
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = `${accent}88`)
  const onBlur  = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = `${accent}33`)

  return (
    <div className="max-w-xl mx-auto space-y-6">

      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-mono transition-colors"
        style={{ color: `${accent}88` }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = accent)}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = `${accent}88`)}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to dashboard
      </Link>

      {/* Card */}
      <div
        className="rounded-2xl border p-6 space-y-5"
        style={{
          borderColor:     `${accent}44`,
          backgroundColor: `${panel}99`,
          boxShadow:       `0 16px 50px ${base}88, inset 0 1px 0 rgba(255,255,255,0.07)`,
          backdropFilter:  'blur(16px)',
        }}
      >
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${accent}22`, paddingBottom: '1rem' }}>
          <h1 className="text-xl font-semibold text-white">Create a new monitor</h1>
          <p className="text-sm mt-0.5 font-mono" style={{ color: `${accent}77` }}>
            {">"} We'll alert you if your cron job misses a ping
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-xl border px-4 py-3"
            style={{ background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.3)' }}
          >
            <p className="text-red-400 text-sm font-mono">✗ {error}</p>
          </div>
        )}

        {/* Monitor Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-[11px] font-medium tracking-[0.18em]"
            style={{ color: `${accent}88` }}>
            MONITOR NAME
          </Label>
          <Input
            id="name"
            placeholder="e.g. Daily Backup Job"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={100}
            className="h-11 font-mono text-white placeholder:text-white/25"
            style={inputStyle}
            onFocus={onFocus} onBlur={onBlur}
          />
        </div>

        {/* Expected Interval */}
        <div className="space-y-1.5">
          <Label htmlFor="interval" className="text-[11px] font-medium tracking-[0.18em]"
            style={{ color: `${accent}88` }}>
            EXPECTED INTERVAL (MINUTES)
          </Label>
          <Input
            id="interval"
            type="number"
            min={1} max={10080}
            value={intervalMinutes}
            onChange={e => setInterval(Number(e.target.value))}
            className="h-11 font-mono text-white"
            style={inputStyle}
            onFocus={onFocus} onBlur={onBlur}
          />
          <p className="text-xs font-mono" style={{ color: `${accent}44` }}>
            {'// '} between 1 and 10,080 minutes (7 days)
          </p>
        </div>

        {/* Grace Period */}
        <div className="space-y-1.5">
          <Label htmlFor="grace" className="text-[11px] font-medium tracking-[0.18em]"
            style={{ color: `${accent}88` }}>
            GRACE PERIOD (MINUTES)
          </Label>
          <Input
            id="grace"
            type="number"
            min={1} max={60}
            value={graceMinutes}
            onChange={e => setGrace(Number(e.target.value))}
            className="h-11 font-mono text-white"
            style={inputStyle}
            onFocus={onFocus} onBlur={onBlur}
          />
          <p className="text-xs font-mono" style={{ color: `${accent}44` }}>
            {'// '} between 1 and 60 minutes
          </p>
        </div>

        {/* Alert Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[11px] font-medium tracking-[0.18em]"
            style={{ color: `${accent}88` }}>
            ALERT EMAIL
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={alertEmail}
            onChange={e => setAlertEmail(e.target.value)}
            maxLength={254}
            className="h-11 font-mono text-white placeholder:text-white/25"
            style={inputStyle}
            onFocus={onFocus} onBlur={onBlur}
          />
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleCreate}
          disabled={loading}
          className="w-full h-11 rounded-xl font-mono font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            backgroundColor: accent,
            color:           base,
            boxShadow:       `0 8px 24px ${accent}44`,
          }}
        >
          {loading ? 'Creating monitor...' : 'Create monitor'}
        </button>
      </div>
    </div>
  )
}