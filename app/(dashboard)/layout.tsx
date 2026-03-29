import DashboardShell from '@/components/DashboardShell'
import { DashboardSidebar } from '@/components/dashboard-sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell sidebar={<DashboardSidebar />}>
      {children}
    </DashboardShell>
  )
}