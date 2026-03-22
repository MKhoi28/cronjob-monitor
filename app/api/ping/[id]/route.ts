import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  const { data: monitor, error } = await supabase
    .from('monitors')
    .select('id, is_active')
    .eq('id', id)
    .single()

  if (error || !monitor) {
    return NextResponse.json({ error: 'Monitor not found' }, { status: 404 })
  }

  if (!monitor.is_active) {
    return NextResponse.json({ error: 'Monitor is paused' }, { status: 400 })
  }

  await supabase.from('ping_logs').insert({ monitor_id: id })

  await supabase
    .from('monitors')
    .update({ last_ping_at: new Date().toISOString(), status: 'healthy' })
    .eq('id', id)

  return NextResponse.json({ ok: true })
}