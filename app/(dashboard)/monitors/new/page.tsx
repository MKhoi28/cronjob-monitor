'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createMonitorSchema } from '@/lib/validations'
import { useAppTheme } from '@/components/DashboardShell'
import { Check, Copy, CheckCircle, Loader2, ArrowRight, ChevronRight } from 'lucide-react'
import NotificationChannels, { type NotificationValues } from '@/components/onboarding/NotificationChannels'

// ── Code snippet templates ─────────────────────────────────────────────────
function getSnippets(pingUrl: string) {
  return {
    curl: `# Add this at the end of your cron script
# It only fires if all previous commands succeeded

curl --silent --max-time 10 \\
  "${pingUrl}"`,
    node: `// At the end of your job function
// Only runs if no error was thrown above

await fetch("${pingUrl}", {
  method: "GET",
  signal: AbortSignal.timeout(10_000),
}).catch(() => {}) // don't let the ping fail your job`,
    python: `import urllib.request

# At the end of your job
# Only runs if no exception was raised above

try:
    urllib.request.urlopen("${pingUrl}", timeout=10)
except Exception:
    pass  # don't let the ping fail your job`,
    github: `# .github/workflows/your-job.yml
name: Scheduled Job

on:
  schedule:
    - cron: '0 * * * *'  # adjust to your schedule

jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run your job
        run: your_script.sh  # replace with your command

      - name: Ping CronWatch
        if: success()
        run: |
          curl --silent --max-time 10 \\
            "${pingUrl}"`,
  }
}

const TABS = [
  { id: 'curl',   label: 'curl'           },
  { id: 'node',   label: 'Node.js'        },
  { id: 'python', label: 'Python'         },
  { id: 'github', label: 'GitHub Actions' },
] as const
type TabId = typeof TABS[number]['id']

// ── Step 2: Integration guide ──────────────────────────────────────────────
function IntegrationStep({
  monitorId, monitorName, accent, panel, base,
}: {
  monitorId: string; monitorName: string
  accent: string; panel: string; base: string
}) {
  const router   = useRouter()
  const pingUrl  = `https://crwatch.vercel.app/api/ping/${monitorId}`
  const snippets = getSnippets(pingUrl)

  const [activeTab,    setActiveTab]    = useState<TabId>('curl')
  const [copiedUrl,    setCopiedUrl]    = useState(false)
  const [copiedCode,   setCopiedCode]   = useState(false)
  const [pingReceived, setPingReceived] = useState(false)
  const [pingTime,     setPingTime]     = useState<string | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const supabase  = createClient()
    const createdAt = new Date().toISOString()
    async function check() {
      const { data } = await supabase
        .from('ping_logs').select('pinged_at')
        .eq('monitor_id', monitorId).gte('pinged_at', createdAt).limit(1)
      if (data && data.length > 0) {
        setPingReceived(true)
        setPingTime(new Date(data[0].pinged_at).toLocaleTimeString([], { hour12: false }))
        if (pollRef.current) clearInterval(pollRef.current)
      }
    }
    pollRef.current = setInterval(check, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [monitorId])

  function copyUrl()  { navigator.clipboard.writeText(pingUrl);              setCopiedUrl(true);  setTimeout(() => setCopiedUrl(false),  2000) }
  function copyCode() { navigator.clipboard.writeText(snippets[activeTab]);  setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000) }

  const inputStyle = { background: `${panel}88`, borderColor: `${accent}33`, color: 'white', caretColor: accent }

  return (
    <motion.div key="step2" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }} className="max-w-xl mx-auto space-y-6">

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono"
          style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34D399' }}>
          <CheckCircle className="w-3.5 h-3.5" />
          Monitor created — {monitorName}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Now add one line to your script</h1>
        <p className="text-sm font-mono" style={{ color: `${accent}77` }}>{'>'} Ping this URL at the end of every successful run</p>
      </div>

      {/* Ping URL */}
      <div className="rounded-2xl border p-5 space-y-3"
        style={{ borderColor: `${accent}44`, backgroundColor: `${panel}99`, boxShadow: `0 8px 30px ${base}66` }}>
        <p className="text-[11px] font-mono tracking-[0.18em]" style={{ color: `${accent}66` }}>YOUR PING URL</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-xl border px-4 py-2.5 font-mono text-sm overflow-x-auto whitespace-nowrap"
            style={{ borderColor: `${accent}22`, backgroundColor: `${panel}60`, color: accent }}>
            {pingUrl}
          </div>
          <button onClick={copyUrl} className="shrink-0 flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-mono transition-all"
            style={{ borderColor: copiedUrl ? 'rgba(52,211,153,0.4)' : `${accent}33`, backgroundColor: copiedUrl ? 'rgba(52,211,153,0.08)' : `${panel}60`, color: copiedUrl ? '#34D399' : `${accent}AA` }}>
            {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedUrl ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Code snippets */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ borderColor: `${accent}44`, backgroundColor: `${panel}99`, boxShadow: `0 8px 30px ${base}66` }}>
        <div className="flex items-center gap-1 px-4 pt-3 pb-0" style={{ borderBottom: `1px solid ${accent}18` }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="px-3 py-2 text-xs font-mono rounded-t-lg transition-all"
              style={{ color: activeTab === tab.id ? accent : `${accent}55`, backgroundColor: activeTab === tab.id ? `${accent}12` : 'transparent', borderBottom: activeTab === tab.id ? `2px solid ${accent}` : '2px solid transparent' }}>
              {tab.label}
            </button>
          ))}
          <div className="ml-auto pb-1">
            <button onClick={copyCode}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono border transition-all"
              style={{ borderColor: copiedCode ? 'rgba(52,211,153,0.4)' : `${accent}22`, backgroundColor: copiedCode ? 'rgba(52,211,153,0.08)' : 'transparent', color: copiedCode ? '#34D399' : `${accent}55` }}>
              {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copiedCode ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.pre key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="p-5 text-xs font-mono leading-relaxed overflow-x-auto"
            style={{ color: `${accent}CC`, background: 'rgba(0,0,0,0.35)', minHeight: 120 }}>
            {snippets[activeTab].split('\n').map((line, i) => {
              const isComment = line.trimStart().startsWith('#') || line.trimStart().startsWith('//')
              return <span key={i} style={{ color: isComment ? `${accent}44` : `${accent}CC`, display: 'block' }}>{line || ' '}</span>
            })}
          </motion.pre>
        </AnimatePresence>
      </div>

      {/* Live ping status */}
      <div className="rounded-2xl border p-5" style={{ borderColor: pingReceived ? 'rgba(52,211,153,0.35)' : `${accent}33`, backgroundColor: pingReceived ? 'rgba(52,211,153,0.06)' : `${panel}66`, transition: 'all 0.4s ease' }}>
        <AnimatePresence mode="wait">
          {pingReceived ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.4)' }}>
                <CheckCircle className="w-5 h-5" style={{ color: '#34D399' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#34D399' }}>First ping received!</p>
                <p className="text-xs font-mono mt-0.5" style={{ color: 'rgba(52,211,153,0.6)' }}>
                  {pingTime && `at ${pingTime} — `}your monitor is now active
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
              <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: accent }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accent }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Waiting for first ping...</p>
                <p className="text-xs font-mono mt-0.5" style={{ color: `${accent}55` }}>
                  Run your script once, or test it manually with the curl command above
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between pt-1">
        <Link href="/dashboard" className="text-xs font-mono transition-colors" style={{ color: `${accent}44` }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = `${accent}88`)}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = `${accent}44`)}>
          skip for now →
        </Link>
        <motion.button onClick={() => router.push('/dashboard')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-mono font-bold"
          style={{ backgroundColor: pingReceived ? '#34D399' : accent, color: base, boxShadow: pingReceived ? '0 0 30px rgba(52,211,153,0.45)' : `0 0 24px ${accent}44`, transition: 'background-color 0.4s ease, box-shadow 0.4s ease' }}>
          Go to dashboard <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function NewMonitorPage() {
  const [name,            setName]       = useState('')
  const [intervalMinutes, setInterval]   = useState(60)
  const [graceMinutes,    setGrace]      = useState(5)
  const [alertEmail,      setAlertEmail] = useState('')
  const [notifValues,     setNotifValues] = useState<NotificationValues>({
    slack_webhook_url:   '',
    discord_webhook_url: '',
    webhook_url:         '',
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [createdId,   setCreatedId]   = useState<string | null>(null)
  const [createdName, setCreatedName] = useState('')
  const [isPro,       setIsPro]       = useState(false)

  const supabase = createClient()
  const theme    = useAppTheme()
  const [base, panel] = theme.palette
  const accent   = theme.accent
  const router   = useRouter()

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      sb.from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setIsPro(data?.plan === 'pro'))
    })
  }, [])

  const inputStyle = { background: `${panel}88`, borderColor: `${accent}33`, color: 'white', caretColor: accent }
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = `${accent}88`)
  const onBlur  = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = `${accent}33`)

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

    const { count } = await supabase
      .from('monitors').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if ((count ?? 0) >= 10) { router.push('/upgrade'); return }

    const { data, error } = await supabase.from('monitors').insert({
      user_id:             user.id,
      name:                parsed.data.name,
      interval_minutes:    parsed.data.interval_minutes,
      grace_minutes:       parsed.data.grace_minutes,
      alert_email:         parsed.data.alert_email,
      status:              'waiting',
      // Notification channels — only save non-empty values
      slack_webhook_url:   notifValues.slack_webhook_url   || null,
      discord_webhook_url: notifValues.discord_webhook_url || null,
      webhook_url:         notifValues.webhook_url         || null,
    }).select('id').single()

    if (error) {
      if (error.message.includes('MONITOR_LIMIT_REACHED')) { router.push('/upgrade'); return }
      setError('Failed to create monitor. Please try again.')
      setLoading(false)
      return
    }

    setCreatedId(data.id)
    setCreatedName(parsed.data.name)
    setLoading(false)
  }

  if (createdId) {
    return <IntegrationStep monitorId={createdId} monitorName={createdName} accent={accent} panel={panel} base={base} />
  }

  return (
    <motion.div key="step1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }} className="max-w-xl mx-auto space-y-6">

      {/* Back link */}
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-mono transition-colors"
        style={{ color: `${accent}88` }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = accent)}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = `${accent}88`)}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to dashboard
      </Link>

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono"
          style={{ background: `${accent}15`, border: `1px solid ${accent}33`, color: accent }}>
          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ backgroundColor: accent, color: base }}>1</span>
          Configure
        </div>
        <ChevronRight className="w-3.5 h-3.5" style={{ color: `${accent}33` }} />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono"
          style={{ border: `1px solid ${accent}18`, color: `${accent}33` }}>
          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border"
            style={{ borderColor: `${accent}22`, color: `${accent}33` }}>2</span>
          Integrate
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border p-6 space-y-5"
        style={{ borderColor: `${accent}44`, backgroundColor: `${panel}99`, boxShadow: `0 16px 50px ${base}88, inset 0 1px 0 rgba(255,255,255,0.07)`, backdropFilter: 'blur(16px)' }}>

        <div style={{ borderBottom: `1px solid ${accent}22`, paddingBottom: '1rem' }}>
          <h1 className="text-xl font-semibold text-white">Create a new monitor</h1>
          <p className="text-sm mt-0.5 font-mono" style={{ color: `${accent}77` }}>
            {">"} We'll alert you if your cron job misses a ping
          </p>
        </div>

        {error && (
          <div className="rounded-xl border px-4 py-3"
            style={{ background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.3)' }}>
            <p className="text-red-400 text-sm font-mono">✗ {error}</p>
          </div>
        )}

        {/* Monitor Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-[11px] font-medium tracking-[0.18em]"
            style={{ color: `${accent}88` }}>MONITOR NAME</Label>
          <Input id="name" placeholder="e.g. Daily Backup Job" value={name}
            onChange={e => setName(e.target.value)} maxLength={100}
            className="h-11 font-mono text-white placeholder:text-white/25"
            style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
        </div>

        {/* Interval */}
        <div className="space-y-1.5">
          <Label htmlFor="interval" className="text-[11px] font-medium tracking-[0.18em]"
            style={{ color: `${accent}88` }}>EXPECTED INTERVAL (MINUTES)</Label>
          <Input id="interval" type="number" min={1} max={10080} value={intervalMinutes}
            onChange={e => setInterval(Number(e.target.value))}
            className="h-11 font-mono text-white" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          <p className="text-xs font-mono" style={{ color: `${accent}44` }}>{'// '} between 1 and 10,080 minutes (7 days)</p>
        </div>

        {/* Grace */}
        <div className="space-y-1.5">
          <Label htmlFor="grace" className="text-[11px] font-medium tracking-[0.18em]"
            style={{ color: `${accent}88` }}>GRACE PERIOD (MINUTES)</Label>
          <Input id="grace" type="number" min={1} max={60} value={graceMinutes}
            onChange={e => setGrace(Number(e.target.value))}
            className="h-11 font-mono text-white" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          <p className="text-xs font-mono" style={{ color: `${accent}44` }}>{'// '} between 1 and 60 minutes</p>
        </div>

        {/* Alert email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[11px] font-medium tracking-[0.18em]"
            style={{ color: `${accent}88` }}>ALERT EMAIL</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={alertEmail}
            onChange={e => setAlertEmail(e.target.value)} maxLength={254}
            className="h-11 font-mono text-white placeholder:text-white/25"
            style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
        </div>

        {/* ── Notification channels ── */}
        <div style={{ borderTop: `1px solid ${accent}15`, paddingTop: '1.25rem' }}>
          <NotificationChannels
            values={notifValues}
            onChange={(field, value) => setNotifValues(prev => ({ ...prev, [field]: value }))}
            accent={accent}
            panel={panel}
            inputStyle={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
            isPro={isPro} 
          />
        </div>

        <button type="button" onClick={handleCreate} disabled={loading}
          className="w-full h-11 rounded-xl font-mono font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: accent, color: base, boxShadow: `0 8px 24px ${accent}44` }}>
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
            : <>Create monitor <ChevronRight className="w-4 h-4" /></>
          }
        </button>
      </div>
    </motion.div>
  )
}