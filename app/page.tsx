'use client'

  import { useEffect, useMemo, useRef, useState } from 'react'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import Link from 'next/link'
  import { usePersistedTheme } from '@/hooks/usePersistedTheme'

  gsap.registerPlugin(ScrollTrigger)

  type Palette = [string, string, string]

  type Theme = {
    id: string
    name: string
    mood: string
    palette: Palette
    accent: string
  }

  const THEMES: Theme[] = [
    { id: 'obsidian-ember',    name: 'Obsidian Ember',    mood: 'Warm cinematic contrast',     palette: ['#0C0C0C', '#2A2420', '#443C36'], accent: '#9B7E6A' },
    { id: 'graphite-steel',    name: 'Graphite Steel',    mood: 'Cold industrial luxe',         palette: ['#0F1113', '#1E2227', '#2D333B'], accent: '#7E9DB4' },
    { id: 'forest-nocturne',   name: 'Forest Nocturne',   mood: 'Organic cyber depth',          palette: ['#0D110F', '#1A2421', '#2A2833'], accent: '#62A58B' },
    { id: 'midnight-amethyst', name: 'Midnight Amethyst', mood: 'High-fashion violet aura',     palette: ['#120E16', '#1F1A24', '#2E2735'], accent: '#9A7AC8' },
  ]

  export default function LandingPage() {
    const [activeTheme, setActiveTheme]   = usePersistedTheme()  // persisted across all pages
    const [hoveredTheme, setHoveredTheme] = useState<number | null>(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)

    // ── NEW: track button position so the fixed panel lines up ──────────────
    const [btnRect, setBtnRect] = useState<{ top: number; left: number } | null>(null)

    const dropdownRef = useRef<HTMLDivElement>(null)
    const btnRef      = useRef<HTMLButtonElement>(null)

    // Live-preview on hover; fall back to active selection
    const displayIndex = hoveredTheme !== null ? hoveredTheme : activeTheme
    const theme        = useMemo(() => THEMES[displayIndex], [displayIndex])
    const [base, panel, edge] = theme.palette
    const accent = theme.accent

    const pageRef       = useRef<HTMLElement>(null)
    const heroRef       = useRef<HTMLElement>(null)
    const heroVisualRef = useRef<HTMLDivElement>(null)
    const metricsRef    = useRef<HTMLElement>(null)
    const orbOneRef     = useRef<HTMLDivElement>(null)
    const orbTwoRef     = useRef<HTMLDivElement>(null)
    const orbThreeRef   = useRef<HTMLDivElement>(null)
    const cursorGlowRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
          setDropdownOpen(false)
          setHoveredTheme(null)
        }
      }
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    }, [])

    // ── Measure button on open so fixed panel aligns correctly ───────────────
    const handleOpenDropdown = () => {
      if (!dropdownOpen && btnRef.current) {
        const r = btnRef.current.getBoundingClientRect()
        setBtnRect({ top: r.bottom + 10, left: r.left })
      }
      setDropdownOpen(prev => !prev)
    }

    // Reposition on scroll / resize while open
    useEffect(() => {
      if (!dropdownOpen) return
      const reposition = () => {
        if (btnRef.current) {
          const r = btnRef.current.getBoundingClientRect()
          setBtnRect({ top: r.bottom + 10, left: r.left })
        }
      }
      window.addEventListener('scroll', reposition, { passive: true })
      window.addEventListener('resize', reposition)
      return () => {
        window.removeEventListener('scroll', reposition)
        window.removeEventListener('resize', reposition)
      }
    }, [dropdownOpen])

    useEffect(() => {
      if (!pageRef.current) return
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduceMotion) return

      const ctx = gsap.context(() => {
        gsap.set('.reveal-nav',         { opacity: 0, y: -14 })
        gsap.set('.hero-word',          { opacity: 0, y: 30,  filter: 'blur(8px)' })
        gsap.set('.hero-subline',       { opacity: 0, y: 24,  filter: 'blur(7px)' })
        gsap.set('.hero-chip',          { opacity: 0, y: 18,  scale: 0.97, filter: 'blur(6px)' })
        gsap.set('.hero-stat',          { opacity: 0, y: 20,  filter: 'blur(6px)' })
        gsap.set('.hero-visual-layer',  { opacity: 0, y: 42,  rotateX: 9, scale: 0.98 })
        gsap.set('.theme-dropdown-btn', { opacity: 0, y: 10 })

        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .to('.reveal-nav',         { opacity: 1, y: 0, duration: 0.6 })
          .to('.theme-dropdown-btn', { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
          .to('.hero-word',          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.07 }, '-=0.2')
          .to('.hero-subline',       { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, stagger: 0.08 }, '-=0.42')
          .to('.hero-chip',          { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.5, stagger: 0.07 }, '-=0.42')
          .to('.hero-stat',          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, stagger: 0.08 }, '-=0.34')
          .to('.hero-visual-layer',  { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 0.85, stagger: 0.06 }, '-=0.44')

        gsap.to('.hero-orbit-line',         { rotation: '+=360',  duration: 22,   ease: 'none', repeat: -1, transformOrigin: '50% 50%' })
        gsap.to('.hero-orbit-line-delayed', { rotation: '-=360',  duration: 30,   ease: 'none', repeat: -1, transformOrigin: '50% 50%' })
        gsap.to('.hero-portal-spin',        { rotation: '+=360',  duration: 18,   ease: 'none', repeat: -1, transformOrigin: '50% 50%' })
        gsap.to('.hero-core-pulse',         { scale: 1.1,         duration: 2.4,  yoyo: true, repeat: -1, ease: 'sine.inOut' })
        gsap.to('.hero-deco-float',         { y: -12,             duration: 4.8,  yoyo: true, repeat: -1, ease: 'sine.inOut' })
        gsap.to(orbOneRef.current,          { y: -22, x: 14,      duration: 7,    repeat: -1, yoyo: true, ease: 'sine.inOut' })
        gsap.to(orbTwoRef.current,          { y: -30, x: -12,     duration: 8.3,  repeat: -1, yoyo: true, ease: 'sine.inOut' })
        gsap.to(orbThreeRef.current,        { y: -18, x: 8,       duration: 9.1,  repeat: -1, yoyo: true, ease: 'sine.inOut' })
        gsap.to('.cta-glow-sweep',          { xPercent: 180,      duration: 2.1,  ease: 'power2.inOut', repeat: -1, repeatDelay: 1.3 })

        gsap.to(heroRef.current, {
          yPercent: -6,
          ease: 'none',
          scrollTrigger: { trigger: pageRef.current, start: 'top top', end: 'bottom top', scrub: 1.2 },
        })
        gsap.to('.hero-visual-layer', {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1.4 },
        })
        gsap.fromTo(
          metricsRef.current,
          { y: 70, opacity: 0, rotateX: 8, filter: 'blur(10px)' },
          {
            y: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)',
            duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: metricsRef.current, start: 'top 82%' },
          }
        )
      }, pageRef)

      const moveHandler = (event: MouseEvent) => {
        if (!pageRef.current) return
        const x = (event.clientX / window.innerWidth  - 0.5) * 20
        const y = (event.clientY / window.innerHeight - 0.5) * 16
        // Query from pageRef so GSAP never searches a stale/unmounted document
        const parallax     = Array.from(pageRef.current.querySelectorAll('.mouse-parallax'))
        const parallaxSoft = Array.from(pageRef.current.querySelectorAll('.mouse-parallax-soft'))
        if (parallax.length)     gsap.to(parallax,     { x,          y: y * 0.62, duration: 0.9, ease: 'power3.out' })
        if (parallaxSoft.length) gsap.to(parallaxSoft, { x: x * 0.5, y: y * 0.35, duration: 1.2, ease: 'power3.out' })
        if (cursorGlowRef.current) {
          gsap.to(cursorGlowRef.current, { x: event.clientX - 120, y: event.clientY - 120, opacity: 0.88, duration: 0.45, ease: 'power2.out' })
        }
      }
      const leaveHandler = () => gsap.to(cursorGlowRef.current, { opacity: 0, duration: 0.35, ease: 'power2.out' })

      window.addEventListener('mousemove', moveHandler)
      window.addEventListener('mouseleave', leaveHandler)
      return () => {
        window.removeEventListener('mousemove', moveHandler)
        window.removeEventListener('mouseleave', leaveHandler)
        ctx.revert()
      }
    }, [])

    // Pulse animation only on confirmed selection, not hover
    useEffect(() => {
      if (!pageRef.current) return
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduceMotion) return
      gsap.fromTo('.palette-pulse', { scale: 0.985, filter: 'brightness(0.93)' }, { scale: 1, filter: 'brightness(1)', duration: 0.46, ease: 'power2.out', clearProps: 'all' })
      const a = THEMES[activeTheme].accent
      gsap.fromTo(heroVisualRef.current, { boxShadow: `0 0 0 ${a}00` }, { boxShadow: `0 22px 90px ${a}44`, duration: 0.55, ease: 'power2.out' })
    }, [activeTheme])

    const handleThemeSelect = (index: number) => {
      setActiveTheme(index)
      setDropdownOpen(false)
      setHoveredTheme(null)
    }

    const handleDropdownLeave = () => {
      setHoveredTheme(null)
    }

    return (
      <main
        ref={pageRef}
        className="min-h-screen overflow-hidden text-white"
        style={{
          background:
            `radial-gradient(circle at 8% 0%, ${accent}52 0%, transparent 48%),` +
            `radial-gradient(circle at 100% 100%, ${panel}CC 0%, transparent 38%),` +
            `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 62%),` +
            base,
          transition: 'background 360ms cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        <div ref={cursorGlowRef} className="pointer-events-none fixed left-0 top-0 h-60 w-60 rounded-full opacity-0 blur-[70px]" style={{ background: `${accent}4D`, zIndex: 1 }} />
        <div className="pointer-events-none absolute inset-0">
          <div ref={orbOneRef}   className="absolute left-[8%]  top-[12%]    h-56 w-56 rounded-full blur-[80px]  mouse-parallax-soft" style={{ background: `${accent}48` }} />
          <div ref={orbTwoRef}   className="absolute right-[10%] top-[24%]   h-72 w-72 rounded-full blur-[100px] mouse-parallax"      style={{ background: `${panel}9A` }} />
          <div ref={orbThreeRef} className="absolute bottom-[8%] left-[35%]  h-80 w-80 rounded-full blur-[130px] mouse-parallax-soft" style={{ background: `${edge}44` }}  />
        </div>

        {/* ── FIXED DROPDOWN PANEL — rendered here at root level to escape all stacking contexts ── */}
        {dropdownOpen && btnRect && (
          <div
            ref={dropdownRef}
            onMouseLeave={handleDropdownLeave}
            style={{
              position:        'fixed',
              top:             btnRect.top,
              left:            btnRect.left,
              width:           288,
              zIndex:          99999,   // above everything: orbs, backdrop-blur nav, canvas
              borderRadius:    16,
              overflow:        'hidden',
              borderWidth:     1,
              borderStyle:     'solid',
              borderColor:     `${accent}55`,
              backgroundColor: `${panel}E8`,
              backdropFilter:  'blur(24px)',
              boxShadow:
                `0 24px 64px ${base}CC,` +
                `0 8px 24px ${accent}28,` +
                `inset 0 1px 0 rgba(255,255,255,0.13)`,
              animation: 'dropdown-in 220ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
            }}
          >
            {/* Header label */}
            <div
              className="px-4 pt-3 pb-2 text-[10px] tracking-[0.22em] font-medium"
              style={{ color: `${accent}BB`, borderBottom: `1px solid ${accent}22` }}
            >
              CHOOSE THEME
            </div>

            {/* Theme options */}
            <div className="p-2">
              {THEMES.map((item, index) => {
                const isActive  = activeTheme  === index
                const isHovered = hoveredTheme === index
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleThemeSelect(index)}
                    onMouseEnter={() => setHoveredTheme(index)}
                    className="w-full rounded-xl px-3 py-2.5 text-left"
                    style={{
                      backgroundColor: isHovered
                        ? `${item.palette[1]}CC`
                        : isActive
                          ? `${item.palette[1]}88`
                          : 'transparent',
                      borderWidth:  1,
                      borderStyle:  'solid',
                      borderColor:  isHovered
                        ? `${item.accent}BB`
                        : isActive
                          ? `${item.accent}66`
                          : 'transparent',
                      boxShadow:    isHovered ? `0 4px 16px ${item.accent}33` : 'none',
                      transition:   'all 180ms cubic-bezier(0.23, 1, 0.32, 1)',
                      marginBottom: '4px',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium leading-snug">{item.name}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{item.mood}</p>
                      </div>

                      {/* Mini palette swatches */}
                      <div className="flex items-center gap-1 shrink-0 ml-3">
                        {item.palette.map((color, ci) => (
                          <span
                            key={ci}
                            className="rounded-full"
                            style={{
                              width:           ci === 0 ? 8 : 6,
                              height:          ci === 0 ? 8 : 6,
                              backgroundColor: color,
                              border:          '1px solid rgba(255,255,255,0.15)',
                            }}
                          />
                        ))}
                        <span
                          className="rounded-full ml-0.5"
                          style={{
                            width:           10,
                            height:          10,
                            backgroundColor: item.accent,
                            boxShadow:       `0 0 6px ${item.accent}99`,
                            border:          '1px solid rgba(255,255,255,0.2)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Hover preview bar */}
                    {isHovered && (
                      <div
                        className="mt-2 h-1 rounded-full overflow-hidden"
                        style={{ background: `linear-gradient(90deg, ${item.palette[0]}, ${item.palette[1]}, ${item.palette[2]}, ${item.accent})` }}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Footer hint */}
            <div
              className="px-4 py-2.5 text-[10px] tracking-[0.14em]"
              style={{ color: 'rgba(255,255,255,0.3)', borderTop: `1px solid ${accent}18` }}
            >
              Hover to preview · Click to apply
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10 palette-pulse">

          {/* ── Nav ── */}
          <nav
            className="reveal-nav flex items-center justify-between rounded-2xl border px-5 py-4 backdrop-blur-xl"
            style={{
              borderColor:     `${accent}AA`,
              backgroundColor: `${panel}C0`,
              boxShadow:       `0 16px 40px ${base}88, inset 0 1px 0 rgba(255,255,255,0.12)`,
              transition:      'border-color 360ms ease, background-color 360ms ease, box-shadow 360ms ease',
              // No 'relative' + 'z-index' here — backdrop-filter would trap the dropdown
            }}
          >
            {/* ── Theme Dropdown Trigger (button only, panel is now at root) ── */}
              <div className="theme-dropdown-btn">
                <button
                  ref={btnRef}
                  type="button"
                  onClick={handleOpenDropdown}
                  className="flex items-center gap-2.5 rounded-xl border px-3.5 py-2 text-sm font-medium backdrop-blur-md"
                  style={{
                    borderColor:     dropdownOpen ? `${accent}CC` : `${accent}66`,
                    backgroundColor: dropdownOpen ? `${panel}E0` : `${panel}90`,
                    boxShadow:       dropdownOpen ? `0 8px 24px ${accent}33, inset 0 1px 0 rgba(255,255,255,0.14)` : `inset 0 1px 0 rgba(255,255,255,0.08)`,
                    transition:      'all 220ms cubic-bezier(0.23, 1, 0.32, 1)',
                  }}
                >
                {/* Live accent swatch */}
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{
                    backgroundColor: accent,
                    boxShadow:       `0 0 8px ${accent}BB`,
                    transition:      'background-color 280ms ease, box-shadow 280ms ease',
                  }}
                />
                <span style={{ transition: 'color 280ms ease' }}>Themes</span>
                {/* Chevron */}
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  style={{
                    transform:  dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 260ms cubic-bezier(0.23, 1, 0.32, 1)',
                    opacity:    0.7,
                  }}
                >
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Logo */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold tracking-wide"
            >
              CronWatch
            </Link>
            {/* ── Right nav links ── */}
            <div className="reveal-nav flex items-center gap-1">
              {[
                { label: 'About',   href: '/about'   },
                { label: 'Pricing', href: '/pricing' },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="rounded-xl px-3.5 py-2 text-sm font-medium"
                  style={{
                    color:           'rgba(255,255,255,0.62)',
                    transition:      'color 180ms ease, background-color 180ms ease',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.95)'
                    ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = `${accent}18`
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.62)'
                    ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'
                  }}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/signup"
                className="ml-2 rounded-xl border px-4 py-2 text-sm font-medium"
                style={{
                  borderColor:     `${accent}88`,
                  backgroundColor: `${accent}18`,
                  color:           accent,
                  transition:      'all 180ms ease',
                  boxShadow:       `0 0 0 0 ${accent}00`,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = `${accent}30`
                  ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 4px 18px ${accent}44`
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = `${accent}18`
                  ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 0 0 0 ${accent}00`
                }}
              >
                Get Started
              </Link>
            </div>
          </nav>

          {/* ── Hero ── */}
          <section ref={heroRef} className="relative pb-12 pt-14 text-center md:pt-20">
            <div className="hero-deco-float pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="hero-orbit-line absolute h-[420px] w-[420px] rounded-full border" style={{ borderColor: `${accent}35` }} />
              <div className="hero-orbit-line hero-orbit-line-delayed absolute h-[520px] w-[520px] rounded-full border border-dashed" style={{ borderColor: `${panel}86` }} />
              <div className="hero-core-pulse absolute h-[260px] w-[260px] rounded-full blur-[90px]" style={{ background: `${accent}30` }} />
            </div>

            <h1 className="mx-auto max-w-5xl text-4xl font-bold leading-[1.08] md:text-7xl">
              <span className="hero-word inline-block">
                The only cron monitor that tells you <u>why</u> your job failed
              </span>
            </h1>

            <p className="hero-subline mt-8 md:mt-10 max-w-2xl mx-auto text-sm md:text-base text-muted-foreground">
              CronWatch watches your cron jobs 24/7 and uses AI to diagnose failures —
              not just alert you that something went wrong.
            </p>

            <div className="mx-auto mt-7 flex max-w-2xl flex-wrap items-center justify-center gap-3">
              <div className="hero-stat rounded-xl border px-4 py-2 text-xs tracking-[0.16em]" style={{ borderColor: `${accent}86`, backgroundColor: `${panel}B8` }}>12,800 JOBS TRACKED</div>
              <div className="hero-stat rounded-xl border px-4 py-2 text-xs tracking-[0.16em]" style={{ borderColor: `${accent}86`, backgroundColor: `${panel}B8` }}>42ms ALERT LATENCY</div>
              <div className="hero-stat rounded-xl border px-4 py-2 text-xs tracking-[0.16em]" style={{ borderColor: `${accent}86`, backgroundColor: `${panel}B8` }}>GLOBAL COVERAGE</div>
            </div>

            <div ref={heroVisualRef} className="hero-visual-layer mouse-parallax-soft mx-auto mt-12 max-w-4xl">
              <div className="relative overflow-hidden rounded-[28px] border p-3 md:p-4" style={{ borderColor: `${accent}A0`, backgroundColor: `${panel}C6`, boxShadow: `0 30px 90px ${base}99, 0 10px 30px ${accent}33`, transformStyle: 'preserve-3d' }}>
                <div className="hero-portal-spin absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed" style={{ borderColor: `${accent}57` }} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
                <div className="relative h-[280px] rounded-[22px] border p-6 md:h-[360px]" style={{ borderColor: `${accent}4F`, backgroundColor: `${base}D2` }}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_50%,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.01)_40%,transparent_66%)]" />
                  <div className="absolute left-1/2 top-1/2 h-[44%] w-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[70px]" style={{ background: `${accent}4A` }} />
                  <div className="absolute left-1/2 top-1/2 h-[32%] w-[32%] -translate-x-1/2 -translate-y-1/2 rounded-full border hero-orbit-line" style={{ borderColor: `${accent}9F` }} />
                  <div className="hero-core-pulse absolute left-1/2 top-1/2 h-[16%] w-[16%] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 38px ${accent}` }} />
                  <div className="hero-visual-layer absolute left-6 top-6 rounded-xl border px-3 py-2 text-xs tracking-[0.15em]" style={{ borderColor: `${accent}72`, backgroundColor: `${panel}CE` }}>Ping stream online</div>
                  <div className="hero-visual-layer absolute bottom-6 right-6 rounded-xl border px-3 py-2 text-xs tracking-[0.15em]" style={{ borderColor: `${accent}72`, backgroundColor: `${panel}CE` }}>
                    Incident response <span style={{ color: '#A6FFCE' }}>2.1x faster</span>
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* ── Features / Three Pillars ── */}
          <section className="mx-auto max-w-7xl px-6 md:px-10 mt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="rounded-xl border border-border-subtle bg-surface p-6">
                <div className="text-2xl mb-3">⚡</div>
                <h3 className="font-semibold text-foreground mb-2">AI Failure Analyst</h3>
                <p className="text-sm text-muted-foreground">
                  When a job misses a ping, our AI reads the ping history and tells you
                  exactly what went wrong and how to fix it. No competitor does this.
                </p>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface p-6">
                <div className="text-2xl mb-3">🔔</div>
                <h3 className="font-semibold text-foreground mb-2">Instant Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Email alerts the moment your job misses its window.
                  Configurable grace periods so you only get alerted when it matters.
                </p>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface p-6">
                <div className="text-2xl mb-3">📊</div>
                <h3 className="font-semibold text-foreground mb-2">Public Status Badges</h3>
                <p className="text-sm text-muted-foreground">
                  Embed live status badges in your GitHub README.
                  Show the world your jobs are healthy.
                </p>
              </div>
            </div>
          </section>

          {/* ── Section 2: How It Works ── */}
          <section className="mx-auto max-w-7xl px-6 md:px-10 mt-32 mb-24">
            <div className="text-center mb-16">
              <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.25em', color: accent, opacity: 0.7, marginBottom: '0.75rem' }}>◈ HOW IT WORKS</p>
              <h2 className="text-3xl md:text-5xl font-bold" style={{ letterSpacing: '-0.02em' }}>
                Dead simple to integrate.<br />
                <span style={{ color: accent }}>Impossibly smart to analyze.</span>
              </h2>
            </div>

            {/* Step 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center mb-28">
              {/* Left: Visual */}
              <div className="relative">
                <div
                  className="rounded-2xl border p-8"
                  style={{ borderColor: `${accent}30`, background: `${panel}88`, boxShadow: `0 20px 60px ${base}88, 0 0 0 1px ${accent}10` }}
                >
                  <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: accent, opacity: 0.5, marginBottom: '1rem', letterSpacing: '0.15em' }}>STEP 01 — INTEGRATE</div>
                  <div
                    className="rounded-xl p-4"
                    style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${accent}18` }}
                  >
                    <div className="flex gap-1.5 mb-3">
                      {['#ff5f57','#febc2e','#28c840'].map(c => (
                        <span key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }} />
                      ))}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: 1.9 }}>
                      <div style={{ color: 'rgba(255,255,255,0.3)' }}># At the end of your cron script</div>
                      <div><span style={{ color: accent }}>curl</span><span style={{ color: 'rgba(255,255,255,0.7)' }}> https://cronwatch.app/api/ping/</span><span style={{ color: accent }}>{'{'}<span style={{ color: '#f97316' }}>your-id</span>{'}'}</span></div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}># That's literally it.</div>
                    </div>
                  </div>
                  <div
                    className="mt-4 rounded-xl px-4 py-3 flex items-center gap-3"
                    style={{ background: `${accent}10`, border: `1px solid ${accent}22` }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840', boxShadow: '0 0 8px #28c840', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>Ping received — 200 OK — 12ms</span>
                  </div>
                </div>
                {/* Glow */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '60%', height: '60%', background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`, pointerEvents: 'none', zIndex: -1 }} />
              </div>

              {/* Right: Text */}
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '2.5rem', fontWeight: 700, color: `${accent}18`, lineHeight: 1, marginBottom: '0.5rem' }}>01</div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ letterSpacing: '-0.01em' }}>
                  One HTTP call.<br />Zero configuration.
                </h3>
                <p className="text-sm md:text-base mb-6" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>
                  Add a single <code style={{ background: `${accent}18`, color: accent, padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace' }}>curl</code> command to the end of any cron script. No SDKs, no agents, no YAML. CronWatch starts watching immediately.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Any language', 'Any scheduler', 'Any cloud'].map(tag => (
                    <span key={tag} style={{ fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.1em', padding: '4px 10px', border: `1px solid ${accent}30`, color: `${accent}88`, borderRadius: 6 }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2 — reversed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center mb-28">
              {/* Left: Text */}
              <div className="md:order-1 order-2">
                <div style={{ fontFamily: 'monospace', fontSize: '2.5rem', fontWeight: 700, color: `${accent}18`, lineHeight: 1, marginBottom: '0.5rem' }}>02</div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ letterSpacing: '-0.01em' }}>
                  Miss a ping?<br />We know in 60 seconds.
                </h3>
                <p className="text-sm md:text-base mb-6" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>
                  CronWatch checks every monitor every minute. The moment your job goes silent past its expected window, an alert fires — with context, not just a timestamp.
                </p>
                <div
                  className="rounded-xl p-4"
                  style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)' }}
                >
                  <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'rgba(248,113,113,0.8)', marginBottom: '0.25rem', letterSpacing: '0.1em' }}>⚠ ALERT TRIGGERED</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
                    <div>Monitor: <span style={{ color: 'rgba(255,255,255,0.7)' }}>daily-backup-job</span></div>
                    <div>Expected ping at: <span style={{ color: 'rgba(255,255,255,0.7)' }}>03:00 UTC</span></div>
                    <div>Last seen: <span style={{ color: 'rgba(248,113,113,0.8)' }}>47 minutes ago</span></div>
                  </div>
                </div>
              </div>

              {/* Right: Visual */}
              <div className="md:order-2 order-1 relative">
                <div
                  className="rounded-2xl border p-8"
                  style={{ borderColor: `${accent}30`, background: `${panel}88`, boxShadow: `0 20px 60px ${base}88` }}
                >
                  <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: accent, opacity: 0.5, marginBottom: '1.25rem', letterSpacing: '0.15em' }}>STEP 02 — DETECT</div>
                  {/* Timeline bars */}
                  <div className="space-y-3">
                    {[
                      { label: 'Mon 03:00', ok: true },
                      { label: 'Tue 03:00', ok: true },
                      { label: 'Wed 03:00', ok: true },
                      { label: 'Thu 03:00', ok: false },
                      { label: 'Fri 03:00', ok: false },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span style={{ fontFamily: 'monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', width: 68, flexShrink: 0 }}>{row.label}</span>
                        <div style={{ flex: 1, height: 8, borderRadius: 4, background: row.ok ? accent : 'rgba(248,113,113,0.7)', opacity: row.ok ? 0.8 : 1, boxShadow: row.ok ? `0 0 8px ${accent}44` : '0 0 8px rgba(248,113,113,0.4)' }} />
                        <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: row.ok ? accent : 'rgba(248,113,113,0.8)', width: 20, flexShrink: 0 }}>{row.ok ? '✓' : '✗'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '60%', height: '60%', background: `radial-gradient(circle, ${accent}12 0%, transparent 70%)`, pointerEvents: 'none', zIndex: -1 }} />
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
              {/* Left: Visual */}
              <div className="relative">
                <div
                  className="rounded-2xl border p-8"
                  style={{ borderColor: `${accent}30`, background: `${panel}88`, boxShadow: `0 20px 60px ${base}88` }}
                >
                  <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: accent, opacity: 0.5, marginBottom: '1.25rem', letterSpacing: '0.15em' }}>STEP 03 — DIAGNOSE</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: `${accent}66`, marginBottom: '0.5rem', letterSpacing: '0.1em' }}>AI VERDICT</div>
                  <div
                    className="rounded-xl p-4 mb-3"
                    style={{ background: `${accent}0E`, border: `1px solid ${accent}25` }}
                  >
                    <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: accent, fontWeight: 700, marginBottom: '0.5rem' }}>
                      Job degrading — avg gap increased 340% over 14 days
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                      Peak failures cluster Thursday–Friday UTC nights, suggesting a resource contention issue with concurrent batch jobs. Recommend staggering execution by 20 minutes.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['warning', 'trending up', 'resource contention'].map(tag => (
                      <span key={tag} style={{ fontFamily: 'monospace', fontSize: '0.6rem', padding: '2px 8px', border: `1px solid ${accent}25`, color: `${accent}66`, borderRadius: 4 }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '60%', height: '60%', background: `radial-gradient(circle, ${accent}14 0%, transparent 70%)`, pointerEvents: 'none', zIndex: -1 }} />
              </div>

              {/* Right: Text */}
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '2.5rem', fontWeight: 700, color: `${accent}18`, lineHeight: 1, marginBottom: '0.5rem' }}>03</div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ letterSpacing: '-0.01em' }}>
                  Not just an alert.<br />
                  <span style={{ color: accent }}>An actual diagnosis.</span>
                </h3>
                <p className="text-sm md:text-base mb-4" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>
                  Click Analyze on any monitor. Our AI reads your entire ping history, computes 7 statistical metrics, and returns a plain-English verdict — severity, pattern, root cause, and a concrete fix.
                </p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.28)', lineHeight: 1.7, fontFamily: 'monospace' }}>
                  // No competitor offers this at any price point.
                </p>
              </div>
            </div>
          </section>

          {/* ── Section 3: Social Proof / Comparison ── */}
          <section className="mx-auto max-w-7xl px-6 md:px-10 mt-16 mb-24">
            <div
              className="rounded-2xl border p-8 md:p-12"
              style={{ borderColor: `${accent}20`, background: `${panel}55`, position: 'relative', overflow: 'hidden' }}
            >
              {/* Background accent */}
              <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '40%', height: '80%', background: `radial-gradient(circle, ${accent}0C 0%, transparent 70%)`, pointerEvents: 'none' }} />

              <div className="text-center mb-10">
                <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.25em', color: accent, opacity: 0.7, marginBottom: '0.75rem' }}>◈ WHY CRONWATCH</p>
                <h2 className="text-2xl md:text-4xl font-bold" style={{ letterSpacing: '-0.01em' }}>
                  Every competitor tells you <em>that</em> it broke.<br />
                  <span style={{ color: accent }}>Only CronWatch tells you why.</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Healthchecks.io', price: 'Free / $20+', ai: false, badge: false, themes: false },
                  { name: 'Cronitor',         price: '$21+/mo',     ai: false, badge: true,  themes: false },
                  { name: 'CronWatch',        price: 'Free / $9/mo', ai: true,  badge: true,  themes: true,  highlight: true },
                ].map((row) => (
                  <div
                    key={row.name}
                    className="rounded-xl p-5"
                    style={{
                      border: `1px solid ${row.highlight ? accent : `${accent}18`}`,
                      background: row.highlight ? `${accent}10` : 'rgba(0,0,0,0.2)',
                      position: 'relative',
                    }}
                  >
                    {row.highlight && (
                      <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.15em', color: base, background: accent, padding: '2px 10px', borderRadius: 20 }}>YOU ARE HERE</div>
                    )}
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: row.highlight ? accent : 'rgba(255,255,255,0.6)', marginBottom: '0.25rem' }}>{row.name}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>{row.price}</div>
                    <div className="space-y-2">
                      {[
                        { label: 'AI Failure Analyst', val: row.ai },
                        { label: 'Status Badges',      val: row.badge },
                        { label: 'Multi-theme UI',     val: row.themes },
                        { label: 'Instant Alerts',     val: true },
                      ].map(f => (
                        <div key={f.label} className="flex items-center gap-2">
                          <span style={{ fontSize: '0.7rem', color: f.val ? accent : 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{f.val ? '✓' : '✗'}</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: f.val ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.25)' }}>{f.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Section 4: CTA Banner ── */}
          <section className="mx-auto max-w-7xl px-6 md:px-10 mt-16 mb-16">
            <div
              className="rounded-2xl p-10 md:p-16 text-center relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${panel}CC 0%, ${base}FF 100%)`, border: `1px solid ${accent}28` }}
            >
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '60%', height: '120%', background: `radial-gradient(circle, ${accent}12 0%, transparent 65%)`, pointerEvents: 'none' }} />
              <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.25em', color: accent, opacity: 0.7, marginBottom: '1.25rem' }}>◈ GET STARTED TODAY</div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ letterSpacing: '-0.02em' }}>
                Your first 10 monitors<br />
                <span style={{ color: accent }}>are free. Forever.</span>
              </h2>
              <p className="text-sm md:text-base mb-8 mx-auto max-w-lg" style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.8 }}>
                No credit card. No trial expiry. Just paste one line into your cron script and start sleeping better at night.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href="/signup"
                  className="relative overflow-hidden rounded-xl px-8 py-3.5 text-sm font-semibold"
                  style={{ backgroundColor: accent, color: base, boxShadow: `0 14px 34px ${accent}44`, transition: 'all 180ms ease' }}
                >
                  Start Monitoring Free →
                </a>
                <a
                  href="/about"
                  className="rounded-xl border px-8 py-3.5 text-sm font-medium"
                  style={{ borderColor: `${accent}44`, color: 'rgba(255,255,255,0.6)', transition: 'all 180ms ease' }}
                >
                  Learn More
                </a>
              </div>
            </div>
          </section>

          {/* ── Footer ── */}
          <footer
            className="mx-auto max-w-7xl px-6 md:px-10 py-12"
            style={{ borderTop: `1px solid ${accent}14`, marginTop: '2rem' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
              {/* Brand */}
              <div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: accent, marginBottom: '0.75rem', letterSpacing: '0.05em' }}>CRONWATCH</div>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.8, maxWidth: 240 }}>
                  AI-powered cron job monitoring. Know when your jobs fail — and exactly why.
                </p>
              </div>

              {/* Links */}
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.25)', marginBottom: '1rem' }}>PRODUCT</div>
                <div className="space-y-2">
                  {[
                    { label: 'About',   href: '/about'   },
                    { label: 'Pricing', href: '/pricing' },
                    { label: 'Dashboard', href: '/dashboard' },
                  ].map(({ label, href }) => (
                    <div key={label}>
                      <a href={href} style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 160ms ease' }}
                        onMouseEnter={e => (e.currentTarget.style.color = accent)}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                      >{label}</a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal + Contact */}
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.25)', marginBottom: '1rem' }}>LEGAL & CONTACT</div>
                <div className="space-y-2">
                  {[
                    { label: 'Terms of Service', href: '/terms'   },
                    { label: 'Privacy Policy',   href: '/privacy' },
                    { label: 'Cookie Policy',    href: '/cookies' },
                  ].map(({ label, href }) => (
                    <div key={label}>
                      <a href={href} style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 160ms ease' }}
                        onMouseEnter={e => (e.currentTarget.style.color = accent)}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                      >{label}</a>
                    </div>
                  ))}
                  <div>
                    <a
                      href="mailto:duongmkhoi.cronwatch@gmail.com"
                      style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: accent, opacity: 0.7, textDecoration: 'none', transition: 'opacity 160ms ease' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
                    >
                      Contact Us ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6" style={{ borderTop: `1px solid ${accent}0E` }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.06em' }}>CRONWATCH © 2026</span>
            </div>
          </footer>

        </div>

        <style jsx>{`
          button {
            transform: scale(1);
            transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
          }
          button:active {
            transform: scale(0.97);
          }
          @media (hover: hover) and (pointer: fine) {
            button:hover {
              transform: scale(1.02);
            }
          }
          @keyframes dropdown-in {
            from {
              opacity: 0;
              transform: translateY(-8px) scale(0.97);
              filter: blur(4px);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0px);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            button {
              transition-duration: 120ms !important;
            }
            @keyframes dropdown-in {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
          }
        `}</style>
      </main>
    )
  }