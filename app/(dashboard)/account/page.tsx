import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from './accounts-client'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, api_key')
    .eq('id', user.id)
    .single()

  // Only expose whether a key exists + a masked preview — never send the full key on load
  const maskedKey = profile?.api_key
    ? `${profile.api_key.substring(0, 12)}${'•'.repeat(20)}`
    : null

  return (
    <SettingsClient
      user={user}
      initialDisplayName={profile?.display_name ?? ''}
      maskedKey={maskedKey}
    />
  )
}