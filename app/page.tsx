'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'

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
  { id: 'obsidian-ember', name: 'Obsidian Ember', mood: 'Warm cinematic contrast', palette: ['#0C0C0C', '#2A2420', '#443C36'], accent: '#9B7E6A' },
  { id: 'graphite-steel', name: 'Graphite Steel', mood: 'Cold industrial luxe', palette: ['#0F1113', '#1E2227', '#2D333B'], accent: '#7E9DB4' },
  { id: 'forest-nocturne', name: 'Forest Nocturne', mood: 'Organic cyber depth', palette: ['#0D110F', '#1A2421', '#2A2833'], accent: '#62A58B' },
  { id: 'midnight-amethyst', name: 'Midnight Amethyst', mood: 'High-fashion violet aura', palette: ['#120E16', '#1F1A24', '#2E2735'], accent: '#9A7AC8' },
]

export default function LandingPage() {
  const [activeTheme, setActiveTheme] = useState(0)
  const theme = useMemo(() => THEMES[activeTheme], [activeTheme])
  const [base, panel, edge] = theme.palette
  const accent = theme.accent

  const pageRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const heroVisualRef = useRef<HTMLDivElement>(null)
  const metricsRef = useRef<HTMLElement>(null)
  const orbOneRef = useRef<HTMLDivElement>(null)
  const orbTwoRef = useRef<HTMLDivElement>(null)
  const orbThreeRef = useRef<HTMLDivElement>(null)
  const cursorGlowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const ctx = gsap.context(() => {
      gsap.set('.reveal-nav', { opacity: 0, y: -14 })
      gsap.set('.hero-word', { opacity: 0, y: 30, filter: 'blur(8px)' })
      gsap.set('.hero-subline', { opacity: 0, y: 24, filter: 'blur(7px)' })
      gsap.set('.hero-chip', { opacity: 0, y: 18, scale: 0.97, filter: 'blur(6px)' })
      gsap.set('.hero-stat', { opacity: 0, y: 20, filter: 'blur(6px)' })
      gsap.set('.hero-visual-layer', { opacity: 0, y: 42, rotateX: 9, scale: 0.98 })
      gsap.set('.theme-chip', { opacity: 0, y: 12 })

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .to('.reveal-nav', { opacity: 1, y: 0, duration: 0.6 })
        .to('.theme-chip', { opacity: 1, y: 0, duration: 0.5, stagger: 0.05 }, '-=0.35')
        .to('.hero-word', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.07 }, '-=0.2')
        .to('.hero-subline', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, stagger: 0.08 }, '-=0.42')
        .to('.hero-chip', { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.5, stagger: 0.07 }, '-=0.42')
        .to('.hero-stat', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, stagger: 0.08 }, '-=0.34')
        .to('.hero-visual-layer', { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 0.85, stagger: 0.06 }, '-=0.44')

      gsap.to('.hero-orbit-line', { rotation: '+=360', duration: 22, ease: 'none', repeat: -1, transformOrigin: '50% 50%' })
      gsap.to('.hero-orbit-line-delayed', { rotation: '-=360', duration: 30, ease: 'none', repeat: -1, transformOrigin: '50% 50%' })
      gsap.to('.hero-portal-spin', { rotation: '+=360', duration: 18, ease: 'none', repeat: -1, transformOrigin: '50% 50%' })
      gsap.to('.hero-core-pulse', { scale: 1.1, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      gsap.to('.hero-deco-float', { y: -12, duration: 4.8, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      gsap.to(orbOneRef.current, { y: -22, x: 14, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to(orbTwoRef.current, { y: -30, x: -12, duration: 8.3, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to(orbThreeRef.current, { y: -18, x: 8, duration: 9.1, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to('.cta-glow-sweep', { xPercent: 180, duration: 2.1, ease: 'power2.inOut', repeat: -1, repeatDelay: 1.3 })

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
          y: 0,
          opacity: 1,
          rotateX: 0,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: metricsRef.current, start: 'top 82%' },
        }
      )
    }, pageRef)

    const moveHandler = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 20
      const y = (event.clientY / window.innerHeight - 0.5) * 16
      gsap.to('.mouse-parallax', { x, y: y * 0.62, duration: 0.9, ease: 'power3.out' })
      gsap.to('.mouse-parallax-soft', { x: x * 0.5, y: y * 0.35, duration: 1.2, ease: 'power3.out' })
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

  useEffect(() => {
    if (!pageRef.current) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return
    gsap.fromTo('.palette-pulse', { scale: 0.985, filter: 'brightness(0.93)' }, { scale: 1, filter: 'brightness(1)', duration: 0.46, ease: 'power2.out', clearProps: 'all' })
    gsap.fromTo(heroVisualRef.current, { boxShadow: `0 0 0 ${accent}00` }, { boxShadow: `0 22px 90px ${accent}44`, duration: 0.55, ease: 'power2.out' })
  }, [activeTheme, accent])

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
        transition: 'background 420ms cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    >
      <div ref={cursorGlowRef} className="pointer-events-none fixed left-0 top-0 h-60 w-60 rounded-full opacity-0 blur-[70px]" style={{ background: `${accent}4D`, zIndex: 1 }} />
      <div className="pointer-events-none absolute inset-0">
        <div ref={orbOneRef} className="absolute left-[8%] top-[12%] h-56 w-56 rounded-full blur-[80px] mouse-parallax-soft" style={{ background: `${accent}48` }} />
        <div ref={orbTwoRef} className="absolute right-[10%] top-[24%] h-72 w-72 rounded-full blur-[100px] mouse-parallax" style={{ background: `${panel}9A` }} />
        <div ref={orbThreeRef} className="absolute bottom-[8%] left-[35%] h-80 w-80 rounded-full blur-[130px] mouse-parallax-soft" style={{ background: `${edge}44` }} />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10 palette-pulse">
        <nav className="reveal-nav relative flex items-center justify-between rounded-2xl border px-5 py-4 backdrop-blur-xl" style={{ borderColor: `${accent}AA`, backgroundColor: `${panel}C0`, boxShadow: `0 16px 40px ${base}88, inset 0 1px 0 rgba(255,255,255,0.12)` }}>
          <Link href="/" className="text-lg font-semibold tracking-wide">
            CronWatch
          </Link>
          <p className="text-xs tracking-[0.16em]" style={{ color: '#D8D8D8' }}>THEME BAR</p>
        </nav>

        <div className="mt-4 grid gap-2 md:grid-cols-4">
          {THEMES.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTheme(index)}
              className="theme-chip rounded-xl border px-3 py-2 text-left transition-transform"
              style={{
                borderColor: activeTheme === index ? `${item.accent}F0` : 'rgba(255,255,255,0.18)',
                backgroundColor: activeTheme === index ? `${item.palette[1]}EC` : `${item.palette[0]}B8`,
                boxShadow: activeTheme === index ? `0 10px 28px ${item.accent}40` : 'none',
              }}
            >
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs opacity-80">{item.mood}</p>
            </button>
          ))}
        </div>

        <section ref={heroRef} className="relative pb-12 pt-14 text-center md:pt-20">
          <div className="hero-deco-float pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="hero-orbit-line absolute h-[420px] w-[420px] rounded-full border" style={{ borderColor: `${accent}35` }} />
            <div className="hero-orbit-line hero-orbit-line-delayed absolute h-[520px] w-[520px] rounded-full border border-dashed" style={{ borderColor: `${panel}86` }} />
            <div className="hero-core-pulse absolute h-[260px] w-[260px] rounded-full blur-[90px]" style={{ background: `${accent}30` }} />
          </div>

          <div className="hero-deco-float pointer-events-none absolute left-[11%] top-[26%] hidden md:block">
            <div className="hero-chip rounded-xl border px-3 py-2 text-[11px] tracking-[0.16em]" style={{ borderColor: `${accent}92`, backgroundColor: `${panel}C0` }}>
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
              LIVE MONITORING
            </div>
          </div>
          <div className="hero-deco-float pointer-events-none absolute right-[12%] top-[18%] hidden md:block">
            <div className="hero-chip rounded-xl border px-3 py-2 text-[11px] tracking-[0.16em]" style={{ borderColor: `${accent}92`, backgroundColor: `${panel}C0` }}>
              99.99% UPTIME LAYER
            </div>
          </div>

          <p className="hero-subline mb-4 text-xs tracking-[0.32em]" style={{ color: '#CECECE' }}>ONE MILLION DOLLAR HERO</p>
          <h1 className="mx-auto max-w-5xl text-4xl font-bold leading-[1.08] md:text-7xl">
            <span className="hero-word inline-block">A living</span>{' '}
            <span className="hero-word inline-block">hero section</span>{' '}
            <span className="hero-word inline-block">with elite</span>{' '}
            <span className="hero-word inline-block">3D storytelling.</span>
          </h1>
          <p className="hero-subline mx-auto mt-7 max-w-3xl text-base md:text-xl" style={{ color: '#C9C9C9' }}>
            Crafted for CronWatch with deep layered motion, dramatic lighting, and distinct visual identity per theme.
          </p>

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

                <div className="hero-visual-layer absolute left-6 top-6 rounded-xl border px-3 py-2 text-xs tracking-[0.15em]" style={{ borderColor: `${accent}72`, backgroundColor: `${panel}CE` }}>
                  Ping stream online
                </div>
                <div className="hero-visual-layer absolute bottom-6 right-6 rounded-xl border px-3 py-2 text-xs tracking-[0.15em]" style={{ borderColor: `${accent}72`, backgroundColor: `${panel}CE` }}>
                  Incident response <span style={{ color: '#A6FFCE' }}>2.1x faster</span>
                </div>
              </div>
            </div>
          </div>
        </section>

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
            transform: scale(1.03);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          button {
            transition-duration: 120ms !important;
          }
        }
      `}</style>
    </main>
  )
}