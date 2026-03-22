import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  const { data: monitors } = await supabase
    .from('monitors')
    .select('*')
    .eq('is_active', true)
    .not('last_ping_at', 'is', null)

  if (!monitors) return NextResponse.json({ ok: true })

  for (const monitor of monitors) {
    const lastPing = new Date(monitor.last_ping_at)
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

      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: monitor.alert_email,
        subject: `🚨 Monitor "${monitor.name}" has missed its ping`,
        html: `
          <h2>Alert: ${monitor.name} is down</h2>
          <p>Your cron job hasn't pinged in over 
          <strong>${monitor.interval_minutes + monitor.grace_minutes} minutes</strong>.</p>
          <p>Last seen: ${lastPing.toUTCString()}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">
            View your dashboard →
          </a></p>
        `,
      })
    }
  }

  return NextResponse.json({ ok: true, checked: monitors.length })
}