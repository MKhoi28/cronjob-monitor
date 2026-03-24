"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, Settings, LogOut } from "lucide-react";

export function DashboardSidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "All Monitors", href: "/monitors", icon: Activity },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-background z-20 sticky top-0 md:h-screen flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center border-b border-border-subtle bg-surface/30">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-white flex items-center justify-center rounded-[4px]">
               <div className="w-2.5 h-2.5 bg-black rounded-sm" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-foreground">CronGuard</span>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${isActive ? 'bg-surface text-foreground shadow-sm border border-border-subtle/50' : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground border border-transparent'}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-border-subtle">
          <div className="mb-4">
             <div className="px-3 py-3 rounded-md border border-border-subtle bg-surface text-xs">
               <div className="flex justify-between items-center mb-1">
                 <span className="font-semibold text-foreground">Hobby Plan</span>
                 <span className="text-muted-foreground">3 / 3</span>
               </div>
               <div className="w-full h-1 bg-background rounded-full mt-2 overflow-hidden border border-border-subtle">
                 <div className="h-full bg-foreground w-full rounded-full" />
               </div>
             </div>
          </div>
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors text-sm font-medium">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>
  );
}
