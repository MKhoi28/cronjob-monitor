import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans selection:bg-white/20">
      <DashboardSidebar />
      <main className="flex-1 px-4 sm:px-10 py-8 relative z-10 w-full overflow-x-hidden min-h-screen border-l border-border-subtle bg-background">
        {children}
      </main>
    </div>
  )
}
