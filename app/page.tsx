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
            <Link href="/" className="text-lg font-semibold tracking-wide">
              CronWatch
            </Link>
          </nav>

          {/* ── Hero ── */}
          <section ref={heroRef} className="relative pb-12 pt-14 text-center md:pt-20">
            <div className="hero-deco-float pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="hero-orbit-line absolute h-[420px] w-[420px] rounded-full border" style={{ borderColor: `${accent}35` }} />
              <div className="hero-orbit-line hero-orbit-line-delayed absolute h-[520px] w-[520px] rounded-full border border-dashed" style={{ borderColor: `${panel}86` }} />
              <div className="hero-core-pulse absolute h-[260px] w-[260px] rounded-full blur-[90px]" style={{ background: `${accent}30` }} />
            </div>

            <h1 className="mx-auto max-w-5xl text-4xl font-bold leading-[1.08] md:text-7xl">
              <span className="hero-word inline-block">CronWatch</span>{' '}
              <span className="hero-word inline-block">never sleeps.</span>{' '}
              <br />
              <span className="hero-word inline-block">So</span>{' '}
              <span className="hero-word inline-block">you can.</span>
            </h1>

            <div className="mx-auto mt-7 flex max-w-2xl flex-wrap items-center justify-center gap-3">
              <div className="hero-stat rounded-xl border px-4 py-2 text-xs tracking-[0.16em]" style={{ borderColor: `${accent}86`, backgroundColor: `${panel}B8` }}>12,800 JOBS TRACKED</div>
              <div className="hero-stat rounded-xl border px-4 py-2 text-xs tracking-[0.16em]" style={{ borderColor: `${accent}86`, backgroundColor: `${panel}B8` }}>42ms ALERT LATENCY</div>
              <div className="hero-stat rounded-xl border px-4 py-2 text-xs tracking-[0.16em]" style={{ borderColor: `${accent}86`, backgroundColor: `${panel}B8` }}>GLOBAL COVERAGE</div>
            </div>

            <div className="hero-subline mt-9 flex justify-center gap-4">
              <Link
                href="/signup"
                className="relative overflow-hidden rounded-xl px-6 py-3 text-sm font-medium"
                style={{ backgroundColor: accent, color: '#F8F8F8', boxShadow: `0 14px 34px ${accent}55`, transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 180ms ease-out' }}
              >
                <span className="cta-glow-sweep absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.48) 50%, transparent 100%)' }} />
                Start Monitoring
              </Link>
              <Link
                href="/login"
                className="rounded-xl border px-6 py-3 text-sm font-medium"
                style={{ borderColor: `${accent}AA`, backgroundColor: `${panel}AA`, transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 180ms ease-out' }}
              >
                Sign In
              </Link>
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

          {/* ── Metrics ── */}
          <section
            ref={metricsRef}
            className="relative mt-8 overflow-hidden rounded-3xl border p-8 md:p-12"
            style={{ borderColor: `${accent}8F`, backgroundColor: `${panel}AA`, boxShadow: `0 20px 80px ${base}A6, inset 0 1px 0 rgba(255,255,255,0.12)`, transformStyle: 'preserve-3d' }}
          >
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full blur-[70px]" style={{ background: `${accent}52` }} />
            <p className="relative text-xs tracking-[0.24em]" style={{ color: '#CACACA' }}>THEME DNA</p>
            <div className="relative mt-4 grid items-end gap-6 md:grid-cols-[1.2fr_1fr]">
              <h2 className="text-3xl font-semibold leading-tight md:text-5xl">{theme.name} with deliberate depth, contrast, and motion hierarchy.</h2>
              <div className="space-y-3 rounded-2xl border p-5" style={{ borderColor: `${accent}78`, backgroundColor: `${base}8F` }}>
                <p className="text-sm" style={{ color: '#D6D6D6' }}>Current mood: {theme.mood}</p>
                <div className="flex gap-2">
                  {theme.palette.map((color) => (
                    <span key={color} className="h-8 w-8 rounded-lg border" style={{ backgroundColor: color, borderColor: 'rgba(255,255,255,0.14)' }} />
                  ))}
                  <span className="h-8 w-8 rounded-lg border" style={{ backgroundColor: accent, borderColor: 'rgba(255,255,255,0.14)' }} />
                </div>
              </div>
            </div>
          </section>
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