import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getIP } from '@/lib/rate-limit'
import { pingIdSchema } from '@/lib/validations'

// Use service role to bypass RLS — this is intentional for ping endpoint
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // ---- Rate limiting ----
  // Allow 60 pings per minute per IP (generous for real cron jobs)
  const ip = getIP(request)
  const limit = rateLimit(`ping:${ip}`, {
    limit: 60,
    windowMs: 60 * 1000, // 1 minute
  })

  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Slow down.' },
      {
        status: 429,
        headers: {
          // Tell client when they can retry
          'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  // ---- Input validation ----
  const { id } = await context.params

  const parsed = pingIdSchema.safeParse({ id })
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid monitor ID' },
      { status: 400 }
    )
  }

  // ---- DB query with validated ID ----
  const { data: monitor, error } = await supabase
    .from('monitors')
    .select('id, is_active')
    .eq('id', parsed.data.id)
    .single()

  if (error || !monitor) {
    // Return generic 404 — don't leak whether ID exists
    return NextResponse.json(
      { error: 'Monitor not found' },
      { status: 404 }
    )
  }

  if (!monitor.is_active) {
    return NextResponse.json(
      { error: 'Monitor is paused' },
      { status: 400 }
    )
  }

  // ---- Log ping ----
  await supabase.from('ping_logs').insert({
    monitor_id: parsed.data.id,
    ok: true,
    status_code: 200,
  })
  await supabase
    .from('monitors')
    .update({ last_ping_at: new Date().toISOString(), status: 'healthy' })
    .eq('id', parsed.data.id)

  return NextResponse.json(
    { ok: true },
    {
      headers: {
        'X-RateLimit-Remaining': String(limit.remaining),
      },
    }
  )
}