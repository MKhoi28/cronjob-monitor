"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, Settings, Zap } from "lucide-react";

interface DashboardSidebarProps {
  /** Actual number of monitors the user has created */
  monitorCount?: number
  /** Free tier limit (default 10) */
  monitorLimit?: number
}

export function DashboardSidebar({
  monitorCount = 0,
  monitorLimit = 10,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard",    href: "/dashboard", icon: LayoutDashboard },
    { name: "All Monitors", href: "/monitors",  icon: Activity        },
    { name: "Account",      href: "/settings",  icon: Settings        },
  ];

  const pct     = Math.min(Math.round((monitorCount / monitorLimit) * 100), 100)
  const isFull  = monitorCount >= monitorLimit
  const isNear  = pct >= 80 && !isFull

  // bar colour: red when full, amber when near, accent otherwise
  const barColor = isFull ? '#F87171' : isNear ? '#FBBF24' : 'currentColor'

  return (
    <aside className="w-full md:w-64 bg-background z-20 sticky top-0 md:h-screen flex flex-col">

      {/* Brand header */}
      <div className="h-16 px-6 flex items-center border-b border-border-subtle bg-surface/30">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-white flex items-center justify-center rounded-[4px]">
            <div className="w-2.5 h-2.5 bg-black rounded-sm" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-foreground">CronWatch</span>
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
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium
                ${isActive
                  ? 'bg-surface text-foreground shadow-sm border border-border-subtle/50'
                  : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground border border-transparent'
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border-subtle space-y-3">

        {/* Plan usage */}
        <div className="px-3 py-3 rounded-md border border-border-subtle bg-surface text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-foreground">Hobby Plan</span>
            <span className={isFull ? 'text-red-400 font-semibold' : 'text-muted-foreground'}>
              {monitorCount} / {monitorLimit}
            </span>
          </div>
          <div className="w-full h-1.5 bg-background rounded-full mt-2 overflow-hidden border border-border-subtle">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width:           `${pct}%`,
                backgroundColor: barColor,
                boxShadow:       isFull ? '0 0 6px rgba(248,113,113,0.6)' : undefined,
              }}
            />
          </div>

          {/* Warning message */}
          {isFull && (
            <p className="mt-1.5 text-[10px] text-red-400">
              Monitor limit reached.{' '}
              <Link href="/pricing" className="underline hover:text-red-300 transition-colors">
                Upgrade →
              </Link>
            </p>
          )}
          {isNear && (
            <p className="mt-1.5 text-[10px] text-amber-400">
              Almost at your limit.{' '}
              <Link href="/pricing" className="underline hover:text-amber-300 transition-colors">
                Upgrade →
              </Link>
            </p>
          )}
        </div>

        {/* Upgrade button — always visible for free users */}
        <Link
          href="/pricing"
          className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
            bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
        >
          <Zap className="w-4 h-4" />
          Upgrade to Pro
        </Link>

      </div>
    </aside>
  );
}