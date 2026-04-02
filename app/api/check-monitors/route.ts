import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getIP } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

// ── Timing-safe string comparison ─────────────────────────────────────────
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// ── Escape user-controlled strings before inserting into HTML email ───────
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function GET(request: NextRequest) {
  // ── Rate limiting ──────────────────────────────────────────────────────
  const ip    = getIP(request)
  const limit = rateLimit(`check-monitors:${ip}`, {
    limit:    10,
    windowMs: 60 * 1000,
  })
  if (!limit.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // ── Auth check (timing-safe) ───────────────────────────────────────────
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (
    !authHeader ||
    !cronSecret ||
    !timingSafeEqual(authHeader, `Bearer ${cronSecret}`)
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  const { data: monitors, error } = await supabase
    .from('monitors')
    .select('*')
    .eq('is_active', true)
    .not('last_ping_at', 'is', null)

  if (error) {
    console.error('[check-monitors] DB error:', error.message)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  if (!monitors || monitors.length === 0) {
    return NextResponse.json({ ok: true, checked: 0 })
  }

  let alertsSent = 0

  for (const monitor of monitors) {
    try {
      const lastPing   = new Date(monitor.last_ping_at)
      const expectedBy = new Date(
        lastPing.getTime() +
        (monitor.interval_minutes + monitor.grace_minutes) * 60 * 1000
      )
      const isLate = now > expectedBy

      if (isLate && monitor.status !== 'down') {
        await supabase
          .from('monitors')
          .update({ status: 'down' })
          .eq('id', monitor.id)

        // ── Escape all user-controlled values before HTML insertion ────
        const safeName  = escapeHtml(monitor.name)
        const safeEmail = escapeHtml(monitor.alert_email)

        await resend.emails.send({
          from:    'alerts@yourdomain.com',
          to:      safeEmail,
          subject: `🚨 Monitor "${safeName}" has missed its ping`,
          html: `
            <h2>Alert: ${safeName} is down</h2>
            <p>Your cron job hasn&#39;t pinged in over
            <strong>${monitor.interval_minutes + monitor.grace_minutes} minutes</strong>.</p>
            <p>Last seen: ${lastPing.toUTCString()}</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">
              View your dashboard &rarr;
            </a></p>
          `,
        })

        alertsSent++
      }
    } catch (err) {
      console.error(`[check-monitors] Failed for monitor ${monitor.id}:`, err)
    }
  }

  return NextResponse.json({
    ok:         true,
    checked:    monitors.length,
    alertsSent,
  })
}