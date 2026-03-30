// app/(dashboard)/monitors/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MonitorsClient from './monitors-client'

const MONITOR_LIMIT = 10

export default async function MonitorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: monitors } = await supabase
    .from('monitors')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const monitorCount = monitors?.length ?? 0   // ← already have the data, no extra query needed

  return (
    <MonitorsClient
      monitors={monitors || []}
      monitorCount={monitorCount}   // ← add these two
      monitorLimit={MONITOR_LIMIT}
    />
  )
}