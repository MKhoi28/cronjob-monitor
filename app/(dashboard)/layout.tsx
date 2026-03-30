import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/DashboardShell'
import { DashboardSidebar } from '@/components/dashboard-sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Count monitors for the usage bar — head:true means no rows returned, just the count
  let monitorCount = 0
  if (user) {
    const { count } = await supabase
      .from('monitors')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    monitorCount = count ?? 0
  }

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          monitorCount={monitorCount}
          monitorLimit={10}
        />
      }
    >
      {children}
    </DashboardShell>
  )
}