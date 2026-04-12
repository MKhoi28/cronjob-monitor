import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()          

  if (!user) redirect('/login')

  const { data: monitors } = await supabase
    .from('monitors')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('has_seen_welcome')
    .eq('id', user.id)
    .single()

  const showWelcome = !profile?.has_seen_welcome

  return <DashboardClient monitors={monitors || []} showWelcome={showWelcome} userId={user.id} />
}