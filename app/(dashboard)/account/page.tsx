import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from './accounts-client'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, api_key')
    .eq('id', user.id)
    .single()

  const maskedKey = profile?.api_key
    ? `${profile.api_key.substring(0, 12)}${'•'.repeat(20)}`
    : null

  const { data: monitors } = await supabase
    .from('monitors')
    .select('id')
    .eq('user_id', user.id)

  const monitorCount = monitors?.length ?? 0
  const monitorIds = monitors?.map(m => m.id) ?? []

  const { data: pingedMonitor } = monitorIds.length > 0
    ? await supabase
        .from('ping_logs')
        .select('monitor_id')
        .in('monitor_id', monitorIds)  // ✅ fixed  
        .limit(1)
    : { data: [] }

  const hasPinged = (pingedMonitor?.length ?? 0) > 0

  return (
    <SettingsClient
      user={user}
      initialDisplayName={profile?.display_name ?? ''}
      maskedKey={maskedKey}
      monitorCount={monitorCount}
      hasPinged={hasPinged}
      userId={user.id} 
    />
  )
}