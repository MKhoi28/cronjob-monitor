import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const revalidate = 60

export async function GET() {
  const id = process.env.NEXT_PUBLIC_DEMO_MONITOR_ID
  if (!id) return NextResponse.json({ error: 'Demo not configured' }, { status: 500 })

  const { data: monitor } = await supabase
    .from('monitors')
    .select('id, name, status, last_ping_at, interval_minutes')
    .eq('id', id)
    .single()

  if (!monitor) return NextResponse.json({ error: 'Monitor not found' }, { status: 404 })

  const { data: logs } = await supabase
    .from('ping_logs')
    .select('pinged_at, ok, status_code')
    .eq('monitor_id', id)
    .order('pinged_at', { ascending: false })
    .limit(30)

  const totalLogs  = logs?.length ?? 0
  const okLogs     = logs?.filter(l => l.ok ?? (l.status_code >= 200 && l.status_code < 300)).length ?? 0
  const uptimePct  = totalLogs > 0 ? Math.round((okLogs / totalLogs) * 100) : 100

  return NextResponse.json({
    status:       monitor.status,
    lastPingAt:   monitor.last_ping_at,
    intervalMins: monitor.interval_minutes,
    uptimePct,
    totalPings:   totalLogs,
    // Sanitized ping history for the bars — oldest first
    pings: [...(logs ?? [])].reverse().map(l => ({
      at: l.pinged_at,
      ok: l.ok ?? (l.status_code >= 200 && l.status_code < 300),
    })),
  })
}