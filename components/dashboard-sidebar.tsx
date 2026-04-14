"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Activity, LayoutDashboard, Settings, Zap } from "lucide-react";
import { useAppTheme } from "@/components/DashboardShell";

interface DashboardSidebarProps {
  monitorCount?: number
  monitorLimit?: number
}

export function DashboardSidebar({
  monitorCount = 0,
  monitorLimit = 10,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const theme    = useAppTheme();
  const [base, panel, edge] = theme.palette;
  const accent = theme.accent;

  const [showBadge, setShowBadge] = useState(false)
  useEffect(() => {
    const dismissed = localStorage.getItem(`cw-checklist-dismissed`)
    setShowBadge(!dismissed)
    const handler = () => setShowBadge(false)
    window.addEventListener('checklist-dismissed', handler)
    return () => window.removeEventListener('checklist-dismissed', handler)
  }, [])

  const navItems = [
    { name: "Dashboard",    href: "/dashboard", icon: LayoutDashboard, tourId: 'tour-nav-dashboard' },
    { name: "All Monitors", href: "/monitors",  icon: Activity,        tourId: 'tour-nav-monitors'  },
    { name: "Account",      href: "/account",   icon: Settings,        tourId: 'tour-nav-account'   },
  ];

  const pct      = Math.min(Math.round((monitorCount / monitorLimit) * 100), 100)
  const isFull   = monitorCount >= monitorLimit
  const isNear   = pct >= 80 && !isFull
  const barColor = isFull ? '#F87171' : isNear ? '#FBBF24' : accent

  return (
    <aside
      className="w-full flex flex-col h-full select-none"
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      {/* ── Brand ── */}
      <div
        className="h-16 px-5 flex items-center gap-3 shrink-0"
        style={{ borderBottom: `1px solid ${accent}18` }}
      >
        {/* Glowing accent square logo mark */}
        <div
          className="relative flex items-center justify-center rounded-lg shrink-0"
          style={{
            width: 32, height: 32,
            backgroundColor: `${accent}18`,
            border: `1px solid ${accent}44`,
            boxShadow: `0 0 12px ${accent}33`,
          }}
        >
          <img src="/icon1.png" alt="CronWatch" className="w-5 h-5 object-contain" />
          {/* Corner tick marks */}
          <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l rounded-tl-sm"
            style={{ borderColor: `${accent}88` }} />
          <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r rounded-br-sm"
            style={{ borderColor: `${accent}88` }} />
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.22em]" style={{ color: accent }}>
            CRONWATCH
          </p>
          <p className="text-[9px] tracking-[0.16em]" style={{ color: `${accent}55` }}>
            MONITOR SYSTEM
          </p>
        </div>
      </div>

      {/* ── Section label ── */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[9px] font-bold tracking-[0.28em]" style={{ color: `${accent}44` }}>
          NAVIGATION
        </p>
      </div>

      {/* ── Nav items ── */}
      <nav className="px-3 space-y-0.5 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              id={item.tourId}
              href={item.href}
              className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200"
              style={{
                backgroundColor: isActive ? `${accent}14` : 'transparent',
                border: `1px solid ${isActive ? `${accent}33` : 'transparent'}`,
                color: isActive ? accent : `${accent}66`,
                boxShadow: isActive ? `inset 0 1px 0 ${accent}18, 0 2px 12px ${accent}10` : 'none',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = `${accent}0C`
                  ;(e.currentTarget as HTMLElement).style.color = `${accent}BB`
                  ;(e.currentTarget as HTMLElement).style.borderColor = `${accent}22`
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = `${accent}66`
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'transparent'
                }
              }}
            >
              {/* Active left bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                  style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
                />
              )}

              <Icon className="w-3.5 h-3.5 shrink-0" />

              <span className="tracking-[0.12em]">{item.name.toUpperCase()}</span>

              {/* Onboarding badge */}
              {item.href === '/account' && showBadge && (
                <span
                  className="ml-auto flex items-center justify-center rounded-full text-[9px] font-bold"
                  style={{
                    width: 16, height: 16,
                    backgroundColor: '#F87171',
                    color: '#fff',
                    boxShadow: '0 0 8px rgba(248,113,113,0.6)',
                  }}
                >
                  !
                </span>
              )}

              {/* Active dot right */}
              {isActive && (
                <span
                  className="ml-auto w-1 h-1 rounded-full"
                  style={{ backgroundColor: accent, boxShadow: `0 0 4px ${accent}` }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Monitor usage ── */}
      <div className="px-4 pb-3 space-y-3">

        {/* Divider with label */}
        <div className="flex items-center gap-2 pt-2">
          <div className="flex-1 h-px" style={{ backgroundColor: `${accent}18` }} />
          <span className="text-[9px] tracking-[0.22em]" style={{ color: `${accent}33` }}>USAGE</span>
          <div className="flex-1 h-px" style={{ backgroundColor: `${accent}18` }} />
        </div>

        {/* Plan card */}
        <div
          className="rounded-xl px-3.5 py-3 space-y-2.5"
          style={{
            backgroundColor: `${accent}08`,
            border: `1px solid ${accent}22`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isFull ? '#F87171' : accent, boxShadow: `0 0 5px ${isFull ? '#F87171' : accent}` }} />
              <span className="text-[10px] font-bold tracking-[0.16em]" style={{ color: `${accent}BB` }}>
                HOBBY PLAN
              </span>
            </div>
            <span
              className="text-[10px] font-mono"
              style={{ color: isFull ? '#F87171' : `${accent}77` }}
            >
              {monitorCount}<span style={{ color: `${accent}33` }}>/</span>{monitorLimit}
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="h-0.5 rounded-full overflow-hidden"
            style={{ backgroundColor: `${accent}18` }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                backgroundColor: barColor,
                boxShadow: `0 0 6px ${barColor}88`,
              }}
            />
          </div>

          {(isFull || isNear) && (
            <p className="text-[10px]" style={{ color: isFull ? '#F87171' : '#FBBF24' }}>
              {isFull ? 'Limit reached.' : 'Almost full.'}{' '}
              <Link href="/pricing" className="underline underline-offset-2 transition-opacity hover:opacity-70">
                Upgrade →
              </Link>
            </p>
          )}
        </div>

        {/* Upgrade CTA */}
        <Link
          href="/pricing"
          className="relative flex items-center justify-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-[0.16em] overflow-hidden transition-all duration-200"
          style={{
            backgroundColor: accent,
            border: `1px solid ${accent}`,
            color: base,
            boxShadow: `0 0 24px ${accent}55, 0 4px 16px ${accent}33, inset 0 1px 0 rgba(255,255,255,0.2)`,
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${accent}88, 0 6px 24px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.25)`
            ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${accent}55, 0 4px 16px ${accent}33, inset 0 1px 0 rgba(255,255,255,0.2)`
            ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
          }}
        >
          {/* Shimmer overlay */}
          <span
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{
              background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)`,
            }}
          />
          <Zap className="w-3.5 h-3.5 shrink-0" />
          UPGRADE TO PRO
        </Link>

      </div>
    </aside>
  );
}