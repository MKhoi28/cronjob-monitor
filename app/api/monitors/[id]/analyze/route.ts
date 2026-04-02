import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getIP } from '@/lib/rate-limit'
import { pingIdSchema } from '@/lib/validations'

// Admin client to read ping_logs (bypasses RLS for aggregation)
const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // ── Auth ──────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Rate limit: 10 analyses per hour per user ─────────────────────────
  const ip = getIP(request)
  const limit = rateLimit(`analyze:${user.id}:${ip}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  })
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many analysis requests. Try again later.' },
      { status: 429 }
    )
  }

  // ── Validate monitor ID ───────────────────────────────────────────────
  const { id } = await context.params
  const parsed = pingIdSchema.safeParse({ id })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid monitor ID' }, { status: 400 })
  }

  // ── Fetch monitor (must belong to this user) ──────────────────────────
  const { data: monitor, error: monitorErr } = await supabase
    .from('monitors')
    .select('id, name, interval_minutes, grace_minutes, status, last_ping_at, created_at')
    .eq('id', parsed.data.id)
    .eq('user_id', user.id)
    .single()

  if (monitorErr || !monitor) {
    return NextResponse.json({ error: 'Monitor not found' }, { status: 404 })
  }

  // ── Fetch last 60 ping logs ───────────────────────────────────────────
  const { data: logs } = await adminSupabase
    .from('ping_logs')
    .select('pinged_at')
    .eq('monitor_id', parsed.data.id)
    .order('pinged_at', { ascending: false })
    .limit(60)

  if (!logs || logs.length < 2) {
    return NextResponse.json({
      error: 'Not enough ping history to analyze. Need at least 2 pings.',
    }, { status: 422 })
  }

  // ── Compute statistics ────────────────────────────────────────────────
  const timestamps    = logs.map(l => new Date(l.pinged_at).getTime()).sort((a, b) => a - b)
  const expectedGapMs = monitor.interval_minutes * 60 * 1000
  const graceMs       = monitor.grace_minutes * 60 * 1000

  const gaps: number[] = []
  for (let i = 1; i < timestamps.length; i++) {
    gaps.push(timestamps[i] - timestamps[i - 1])
  }

  const avgGapMs   = gaps.reduce((a, b) => a + b, 0) / gaps.length
  const maxGapMs   = Math.max(...gaps)
  const minGapMs   = Math.min(...gaps)
  const missedGaps = gaps.filter(g => g > expectedGapMs + graceMs).length

  const midpoint  = Math.floor(gaps.length / 2)
  const earlyAvg  = gaps.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint
  const recentAvg = gaps.slice(midpoint).reduce((a, b) => a + b, 0) / (gaps.length - midpoint)
  const trendPct  = ((recentAvg - earlyAvg) / earlyAvg) * 100

  const hourBuckets = Array(24).fill(0)
  timestamps.forEach(ts => { hourBuckets[new Date(ts).getHours()]++ })
  const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets))

  const dayBuckets = Array(7).fill(0)
  const dayNames   = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  timestamps.forEach(ts => { dayBuckets[new Date(ts).getDay()]++ })
  const peakDay = dayNames[dayBuckets.indexOf(Math.max(...dayBuckets))]

  const stats = {
    totalPingsAnalyzed:  logs.length,
    monitorAgeHours:     Math.round((Date.now() - new Date(monitor.created_at).getTime()) / 3_600_000),
    expectedIntervalMin: monitor.interval_minutes,
    gracePeriodMin:      monitor.grace_minutes,
    currentStatus:       monitor.status,
    avgGapMin:           Math.round(avgGapMs / 60_000),
    maxGapMin:           Math.round(maxGapMs / 60_000),
    minGapMin:           Math.round(minGapMs / 60_000),
    missedPings:         missedGaps,
    missedPct:           Math.round((missedGaps / gaps.length) * 100),
    trendPct:            Math.round(trendPct),
    peakActivityHour:    peakHour,
    peakActivityDay:     peakDay,
    lastPingAt:          monitor.last_ping_at,
  }

  // ── Build prompt ──────────────────────────────────────────────────────
const prompt = `SRE analyzing cron monitor. Return ONLY raw JSON, no markdown.

"${monitor.name}": every ${stats.expectedIntervalMin}min, ${stats.gracePeriodMin}min grace, ${stats.currentStatus.toUpperCase()}.
avg=${stats.avgGapMin}min max=${stats.maxGapMin}min min=${stats.minGapMin}min missed=${stats.missedPct}% trend=${stats.trendPct > 0 ? '+' : ''}${stats.trendPct}% pings=${stats.totalPingsAnalyzed}

{"verdict":"<15 words>","severity":"healthy|warning|critical","pattern":"2 sentences max","diagnosis":"2 sentences max","recommendation":"2 sentences max","quickFix":"one change or null"}`
  // ── Call Gemini ───────────────────────────────────────────────────────
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not set')
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2048, temperature: 0.2 },
        }),
      }
    )

    if (!res.ok) {
      const errBody = await res.json()
      console.error('[analyze] Gemini error:', JSON.stringify(errBody))
      throw new Error(`Gemini API error: ${res.status}`)
    }

    const geminiData = await res.json()
    const raw = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    console.log('[analyze] Gemini raw response:', JSON.stringify(geminiData.candidates?.[0]))

    // Strip any accidental markdown fences
    const cleaned  = raw.replace(/```json|```/g, '').trim()
    // Extract just the JSON object in case there's extra text around it
// ✅ New — falls back to computed mock if truncated
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    let analysis

    if (!jsonMatch) {
      // Gemini truncated — build a rule-based fallback from real stats
      analysis = {
        verdict: stats.currentStatus === 'down'
          ? 'Monitor is down — job has stopped sending pings'
          : `Job running at ${stats.avgGapMin}min intervals, expected ${stats.expectedIntervalMin}min`,
        severity: stats.currentStatus === 'down' ? 'critical'
          : stats.missedPct > 20 ? 'warning' : 'healthy',
        pattern: `The monitor has recorded ${stats.totalPingsAnalyzed} pings with an average gap of ${stats.avgGapMin} minutes against an expected interval of ${stats.expectedIntervalMin} minutes.`,
        diagnosis: stats.avgGapMin < stats.expectedIntervalMin
          ? 'The job is running more frequently than configured. The monitor interval may need to be adjusted to match the actual job schedule.'
          : 'The job is running less frequently than expected. This may indicate performance degradation or intermittent failures.',
        recommendation: `Review the job schedule and confirm it matches the ${stats.expectedIntervalMin}-minute interval. ${stats.missedPings > 0 ? `Consider increasing the grace period — ${stats.missedPings} pings have already exceeded it.` : ''}`,
        quickFix: stats.avgGapMin < stats.expectedIntervalMin
          ? `Update monitor interval to ${stats.avgGapMin} minutes to match actual job frequency`
          : stats.missedPings > 0 ? `Increase grace period to ${Math.ceil(stats.avgGapMin * 0.3)} minutes` : null,
      }
    } else {
      analysis = JSON.parse(jsonMatch[0])
    }

    return NextResponse.json({ analysis, stats })
  } catch (err) {
    console.error('[analyze] Gemini call failed:', err)
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}