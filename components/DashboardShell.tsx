'use client'

import {
  createContext, useContext, useEffect, useMemo,
  useRef, useState,
} from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

gsap.registerPlugin(ScrollTrigger)

// ─── Theme types & data ───────────────────────────────────────────────────────
type Palette = [string, string, string]
export type Theme = {
  id: string; name: string; mood: string; palette: Palette; accent: string
}

export const THEMES: Theme[] = [
  { id: 'obsidian-ember',    name: 'Obsidian Ember',    mood: 'Warm cinematic contrast',   palette: ['#0C0C0C', '#2A2420', '#443C36'], accent: '#9B7E6A' },
  { id: 'graphite-steel',    name: 'Graphite Steel',    mood: 'Cold industrial luxe',       palette: ['#0F1113', '#1E2227', '#2D333B'], accent: '#7E9DB4' },
  { id: 'forest-nocturne',   name: 'Forest Nocturne',   mood: 'Organic cyber depth',        palette: ['#0D110F', '#1A2421', '#2A2833'], accent: '#62A58B' },
  { id: 'midnight-amethyst', name: 'Midnight Amethyst', mood: 'High-fashion violet aura',   palette: ['#120E16', '#1F1A24', '#2E2735'], accent: '#9A7AC8' },
]

export const ThemeCtx = createContext<Theme>(THEMES[0])
export const useAppTheme = () => useContext(ThemeCtx)

// ─── Shell ───────────────────────────────────────────────────────────────────
interface DashboardShellProps {
  sidebar?: React.ReactNode
  children: React.ReactNode
}

export default function DashboardShell({ sidebar, children }: DashboardShellProps) {
  const [activeTheme, setActiveTheme]   = useState(0)
  const [hoveredTheme, setHoveredTheme] = useState<number | null>(null)

  // ── Mobile sidebar drawer ────────────────────────────────────────────────
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // ── Settings panel (bottom of sidebar) ──────────────────────────────────
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [themeDropOpen, setThemeDropOpen] = useState(false)
  const settingsBtnRef  = useRef<HTMLButtonElement>(null)
  const settingsPanelRef = useRef<HTMLDivElement>(null)
  const [panelPos, setPanelPos] = useState<{ bottom: number; left: number } | null>(null)

  const shellRef      = useRef<HTMLDivElement>(null)
  const cursorGlowRef = useRef<HTMLDivElement>(null)
  const orbOneRef     = useRef<HTMLDivElement>(null)
  const orbTwoRef     = useRef<HTMLDivElement>(null)
  const orbThreeRef   = useRef<HTMLDivElement>(null)

  const router = useRouter()

  const displayIndex = hoveredTheme !== null ? hoveredTheme : activeTheme
  const theme        = useMemo(() => THEMES[displayIndex], [displayIndex])
  const [base, panel, edge] = theme.palette
  const accent = theme.accent

  // Hydrate theme from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cw-theme')
      if (saved !== null) {
        const idx = Number(saved)
        if (idx >= 0 && idx < THEMES.length) {
          setActiveTheme(idx)
          setHoveredTheme(null)
        }
      }
    } catch {}
  }, [])

  // ── Close mobile sidebar when screen grows to desktop ───────────────────
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileSidebarOpen(false)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // ── Open settings panel, anchor above the button ────────────────────────
  const handleOpenSettings = () => {
    if (!settingsOpen && settingsBtnRef.current) {
      const r   = settingsBtnRef.current.getBoundingClientRect()
      const isMobile = window.innerWidth < 1024

      if (isMobile) {
        // On mobile: centre the panel horizontally, anchor above button
        setPanelPos({
          bottom: window.innerHeight - r.top + 10,
          left:   Math.max(12, (window.innerWidth - 272) / 2),
        })
      } else {
        setPanelPos({
          bottom: window.innerHeight - r.top + 10,
          left:   r.left,
        })
      }
    }
    setSettingsOpen(prev => !prev)
    if (settingsOpen) {
      setHoveredTheme(null)
      setThemeDropOpen(false)
    }
  }

  // ── Close settings on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        settingsPanelRef.current && !settingsPanelRef.current.contains(e.target as Node) &&
        settingsBtnRef.current   && !settingsBtnRef.current.contains(e.target as Node)
      ) {
        setSettingsOpen(false)
        setHoveredTheme(null)
        setThemeDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Reposition panel on resize ───────────────────────────────────────────
  useEffect(() => {
    if (!settingsOpen) return
    const reposition = () => {
      if (settingsBtnRef.current) {
        const r        = settingsBtnRef.current.getBoundingClientRect()
        const isMobile = window.innerWidth < 1024
        setPanelPos({
          bottom: window.innerHeight - r.top + 10,
          left:   isMobile ? Math.max(12, (window.innerWidth - 272) / 2) : r.left,
        })
      }
    }
    window.addEventListener('resize', reposition)
    return () => window.removeEventListener('resize', reposition)
  }, [settingsOpen])

  // ── Sign out ─────────────────────────────────────────────────────────────
  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // ── GSAP: entrance + orbs + mouse parallax + cursor glow ────────────────
  // Cursor glow and mouse parallax are skipped on touch devices — they rely
  // on mousemove which doesn't fire reliably on phones/tablets.
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const ctx = gsap.context(() => {
      gsap.fromTo('.shell-nav',
        { opacity: 0, y: -14 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.1 }
      )
      gsap.fromTo('.shell-content',
        { opacity: 0, y: 22, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.65, ease: 'power3.out', delay: 0.3 }
      )
      gsap.to(orbOneRef.current,   { y: -22, x:  14, duration: 7.0, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to(orbTwoRef.current,   { y: -30, x: -12, duration: 8.3, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to(orbThreeRef.current, { y: -18, x:   8, duration: 9.1, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    }, shellRef)

    // Only wire up mouse effects on pointer (non-touch) devices
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    if (isTouch) return () => ctx.revert()

    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 16
      gsap.to('.shell-parallax',      { x,          y: y * 0.62, duration: 0.9,  ease: 'power3.out' })
      gsap.to('.shell-parallax-soft', { x: x * 0.5, y: y * 0.35, duration: 1.2, ease: 'power3.out' })
      if (cursorGlowRef.current) {
        gsap.to(cursorGlowRef.current, {
          x: e.clientX - 120, y: e.clientY - 120,
          opacity: 0.75, duration: 0.45, ease: 'power2.out',
        })
      }
    }
    const onLeave = () => gsap.to(cursorGlowRef.current, { opacity: 0, duration: 0.35 })
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    return () => {
      ctx.revert()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  // ── Theme-change pulse ───────────────────────────────────────────────────
  useEffect(() => {
    gsap.fromTo(
      '.shell-pulse',
      { scale: 0.985, filter: 'brightness(0.93)' },
      { scale: 1, filter: 'brightness(1)', duration: 0.46, ease: 'power2.out', clearProps: 'all' }
    )
  }, [activeTheme])

  const handleThemeSelect = (index: number) => {
    setActiveTheme(index)
    setHoveredTheme(null)
    setThemeDropOpen(false)
    try { localStorage.setItem('cw-theme', String(index)) } catch {}
  }

  return (
    <ThemeCtx.Provider value={THEMES[activeTheme]}>
      <div
        ref={shellRef}
        className="min-h-screen overflow-x-hidden text-white font-sans selection:bg-white/20"
        style={{
          background:
            `radial-gradient(circle at 8% 0%, ${accent}52 0%, transparent 48%),` +
            `radial-gradient(circle at 100% 100%, ${panel}CC 0%, transparent 38%),` +
            `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 62%),` +
            base,
          transition: 'background 360ms cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        {/* Cursor glow — hidden on touch devices via pointer-events:none + opacity:0 */}
        <div ref={cursorGlowRef}
          className="pointer-events-none fixed left-0 top-0 h-60 w-60 rounded-full opacity-0 blur-[70px]"
          style={{ background: `${accent}4D`, zIndex: 2 }}
        />

        {/* Background orbs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
          <div ref={orbOneRef}   className="shell-parallax-soft absolute left-[8%]  top-[12%]   h-56 w-56 rounded-full blur-[80px]"  style={{ background: `${accent}48`, transition: 'background 360ms ease' }} />
          <div ref={orbTwoRef}   className="shell-parallax      absolute right-[8%] top-[22%]   h-72 w-72 rounded-full blur-[100px]" style={{ background: `${panel}9A`,  transition: 'background 360ms ease' }} />
          <div ref={orbThreeRef} className="shell-parallax-soft absolute bottom-[6%] left-[33%] h-80 w-80 rounded-full blur-[130px]" style={{ background: `${edge}44`,   transition: 'background 360ms ease' }} />
        </div>

        {/* ── Mobile sidebar backdrop ── */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-30 lg:hidden"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ── Settings panel — fixed, escapes all stacking contexts ── */}
        {settingsOpen && panelPos && (
          <div
            ref={settingsPanelRef}
            style={{
              position:        'fixed',
              bottom:          panelPos.bottom,
              left:            panelPos.left,
              width:           272,
              zIndex:          99999,
              borderRadius:    16,
              overflow:        'hidden',
              borderWidth:     1,
              borderStyle:     'solid',
              borderColor:     `${accent}55`,
              backgroundColor: `${panel}EE`,
              backdropFilter:  'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow:
                `0 -16px 50px ${base}CC,` +
                `0 8px 24px ${accent}22,` +
                `inset 0 1px 0 rgba(255,255,255,0.13)`,
              animation: 'shell-panel-in 220ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
            }}
          >
            {/* Panel header */}
            <div className="px-4 pt-3 pb-2 text-[10px] tracking-[0.22em] font-medium"
              style={{ color: `${accent}BB`, borderBottom: `1px solid ${accent}22` }}>
              SETTINGS
            </div>

            {/* Theme dropdown */}
            <div className="px-3 pt-2 pb-1">
              {/* Dropdown trigger */}
              <button
                type="button"
                onClick={() => setThemeDropOpen(prev => !prev)}
                className="w-full flex items-center justify-between rounded-xl border px-3 py-2.5"
                style={{
                  borderColor:     themeDropOpen ? `${accent}88` : `${accent}44`,
                  backgroundColor: themeDropOpen ? `${panel}CC` : `${panel}70`,
                  transition:      'all 200ms cubic-bezier(0.23, 1, 0.32, 1)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="rounded-full shrink-0" style={{ width: 10, height: 10, backgroundColor: THEMES[activeTheme].accent, boxShadow: `0 0 6px ${THEMES[activeTheme].accent}99`, border: '1px solid rgba(255,255,255,0.2)' }} />
                  <span className="text-sm font-medium text-white">Themes</span>
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                  style={{ transform: themeDropOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 240ms cubic-bezier(0.23,1,0.32,1)', opacity: 0.6 }}>
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Collapsible list */}
              {themeDropOpen && (
                <div className="mt-1.5 space-y-0.5">
                  {THEMES.map((item, index) => {
                    const isActive  = activeTheme  === index
                    const isHovered = hoveredTheme === index
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleThemeSelect(index)}
                        onMouseEnter={() => setHoveredTheme(index)}
                        onMouseLeave={() => setHoveredTheme(null)}
                        className="w-full rounded-xl px-3 py-2 text-left"
                        style={{
                          backgroundColor: isHovered ? `${item.palette[1]}CC` : isActive ? `${item.palette[1]}88` : 'transparent',
                          borderWidth: 1, borderStyle: 'solid',
                          borderColor: isHovered ? `${item.accent}BB` : isActive ? `${item.accent}66` : 'transparent',
                          boxShadow:   isHovered ? `0 4px 14px ${item.accent}33` : 'none',
                          transition:  'all 160ms cubic-bezier(0.23, 1, 0.32, 1)',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium leading-snug text-white">{item.name}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.mood}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {item.palette.map((color, ci) => (
                              <span key={ci} className="rounded-full" style={{ width: ci === 0 ? 7 : 5, height: ci === 0 ? 7 : 5, backgroundColor: color, border: '1px solid rgba(255,255,255,0.15)' }} />
                            ))}
                            <span className="rounded-full ml-0.5" style={{ width: 9, height: 9, backgroundColor: item.accent, boxShadow: `0 0 5px ${item.accent}99`, border: '1px solid rgba(255,255,255,0.2)' }} />
                          </div>
                        </div>
                        {isHovered && (
                          <div className="mt-1.5 h-0.5 rounded-full overflow-hidden"
                            style={{ background: `linear-gradient(90deg, ${item.palette[0]}, ${item.palette[1]}, ${item.palette[2]}, ${item.accent})` }}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, backgroundColor: `${accent}22`, margin: '4px 12px' }} />

            {/* Sign out */}
            <div className="px-3 pb-3 pt-1">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-mono flex items-center gap-2 transition-colors"
                style={{ color: '#F87171' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(248,113,113,0.1)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2M9 10l3-3-3-3M12 7H5" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* ── Page structure ── */}
        <div className="relative shell-pulse flex flex-col min-h-screen" style={{ zIndex: 1 }}>

          {/* ── Top nav ── */}
          <header
            className="shell-nav sticky top-0 z-40 flex items-center justify-between px-4 sm:px-5 py-3 backdrop-blur-xl border-b"
            style={{
              borderColor:     `${accent}33`,
              backgroundColor: `${panel}A0`,
              boxShadow:       `0 4px 24px ${base}88, inset 0 -1px 0 rgba(255,255,255,0.05)`,
              transition:      'border-color 360ms ease, background-color 360ms ease',
            }}
          >
            {/* ← Home */}
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium"
              style={{
                borderColor:     `${accent}44`,
                backgroundColor: `${panel}60`,
                color:           `${accent}CC`,
                backdropFilter:  'blur(12px)',
                transition:      'all 200ms cubic-bezier(0.23, 1, 0.32, 1)',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.backgroundColor = `${panel}CC`
                ;(e.currentTarget as HTMLElement).style.borderColor     = `${accent}88`
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.backgroundColor = `${panel}60`
                ;(e.currentTarget as HTMLElement).style.borderColor     = `${accent}44`
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8 10L4 6L8 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Home
            </Link>

            {/* Wordmark */}
            <span className="text-xs font-semibold tracking-[0.28em]" style={{ color: `${accent}BB` }}>
              CRONWATCH
            </span>

            {/* Right side: hamburger on mobile, spacer on desktop */}
            <div className="flex items-center">
              {/* Hamburger — only visible on mobile when there's a sidebar */}
              {sidebar && (
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(prev => !prev)}
                  className="lg:hidden flex items-center justify-center rounded-xl border p-2"
                  style={{
                    borderColor:     mobileSidebarOpen ? `${accent}88` : `${accent}44`,
                    backgroundColor: mobileSidebarOpen ? `${panel}CC` : `${panel}60`,
                    color:           `${accent}CC`,
                    transition:      'all 200ms cubic-bezier(0.23, 1, 0.32, 1)',
                  }}
                  aria-label="Toggle sidebar"
                >
                  {mobileSidebarOpen ? (
                    // X icon
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    // Hamburger icon
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 4h10M2 7h10M2 10h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>
              )}

              {/* Spacer — mirrors Home button on desktop so wordmark stays centred */}
              <div
                className={`${sidebar ? 'hidden lg:flex' : 'flex'} items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs opacity-0 pointer-events-none select-none`}
              >
                Home
              </div>
            </div>
          </header>

          {/* ── Body: sidebar + main ── */}
          <div className="flex flex-1 relative">

            {/* Sidebar slot — drawer on mobile, static column on desktop */}
            {sidebar && (
              <aside
                className={[
                  // Desktop: always visible, static in flow
                  'lg:relative lg:translate-x-0 lg:flex lg:shrink-0',
                  // Mobile: fixed drawer that slides in/out
                  'fixed inset-y-0 left-0 z-40 flex flex-col border-r overflow-x-hidden',
                  // Width
                  'w-64',
                  // Mobile open/closed
                  mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
                  // Smooth slide
                  'transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]',
                ].join(' ')}
                style={{
                  borderColor:     `${accent}22`,
                  backgroundColor: `${panel}EE`,
                  // On mobile the sidebar sits on top of content; on desktop it's in-flow
                  top: 0,
                }}
              >
                {/* Sidebar content from DashboardSidebar */}
                <div className="flex-1 overflow-y-auto">
                  {sidebar}
                </div>

                {/* ── Bottom row: [Settings button] [Theme swatch circle] ── */}
                <div
                  className="flex items-center gap-2 px-4 py-3 border-t"
                  style={{ borderColor: `${accent}22` }}
                >
                  <button
                    ref={settingsBtnRef}
                    type="button"
                    onClick={handleOpenSettings}
                    className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium flex-1"
                    style={{
                      borderColor:     settingsOpen ? `${accent}99` : `${accent}44`,
                      backgroundColor: settingsOpen ? `${panel}CC` : `${panel}60`,
                      color:           settingsOpen ? accent         : `${accent}AA`,
                      transition:      'all 200ms cubic-bezier(0.23, 1, 0.32, 1)',
                    }}
                    onMouseEnter={e => {
                      if (!settingsOpen) {
                        ;(e.currentTarget as HTMLElement).style.backgroundColor = `${panel}AA`
                        ;(e.currentTarget as HTMLElement).style.borderColor     = `${accent}66`
                      }
                    }}
                    onMouseLeave={e => {
                      if (!settingsOpen) {
                        ;(e.currentTarget as HTMLElement).style.backgroundColor = `${panel}60`
                        ;(e.currentTarget as HTMLElement).style.borderColor     = `${accent}44`
                      }
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M6.5 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M10.5 6.5h.5M2 6.5h.5M6.5 2v.5M6.5 10v.5M9.3 3.7l-.35.35M4.05 8.95l-.35.35M9.3 9.3l-.35-.35M4.05 4.05l-.35-.35" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    Settings
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenSettings}
                    className="shrink-0 rounded-full border"
                    style={{
                      width:           32,
                      height:          32,
                      backgroundColor: accent,
                      borderColor:     `${accent}66`,
                      boxShadow:       `0 0 10px ${accent}66`,
                      transition:      'all 280ms ease',
                    }}
                    title={`Theme: ${THEMES[activeTheme].name}`}
                  />
                </div>
              </aside>
            )}

            {/* Main content */}
            <main className="shell-content flex-1 px-4 sm:px-10 py-8 overflow-x-hidden min-h-0 w-full">
              {children}
            </main>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shell-panel-in {
          from { opacity: 0; transform: translateY(10px) scale(0.97); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0px); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes shell-panel-in { from { opacity: 0; } to { opacity: 1; } }
        }
      `}</style>
    </ThemeCtx.Provider>
  )
}