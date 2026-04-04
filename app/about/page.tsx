'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import Link from 'next/link'
import { usePersistedTheme } from '@/hooks/usePersistedTheme'

type Palette = [string, string, string]
type Theme = { id: string; name: string; mood: string; palette: Palette; accent: string }

const THEMES: Theme[] = [
  { id: 'obsidian-ember',    name: 'Obsidian Ember',    mood: 'Warm cinematic contrast',   palette: ['#0C0C0C', '#2A2420', '#443C36'], accent: '#9B7E6A' },
  { id: 'graphite-steel',    name: 'Graphite Steel',    mood: 'Cold industrial luxe',       palette: ['#0F1113', '#1E2227', '#2D333B'], accent: '#7E9DB4' },
  { id: 'forest-nocturne',   name: 'Forest Nocturne',   mood: 'Organic cyber depth',        palette: ['#0D110F', '#1A2421', '#2A2833'], accent: '#62A58B' },
  { id: 'midnight-amethyst', name: 'Midnight Amethyst', mood: 'High-fashion violet aura',   palette: ['#120E16', '#1F1A24', '#2E2735'], accent: '#9A7AC8' },
]

const STEPS = [
  { num: '01', title: 'Create a Monitor',   body: 'Name your cron job, set the expected ping interval, and CronWatch generates a unique endpoint URL for it.',                                              code: 'POST /api/monitor/create' },
  { num: '02', title: 'Ping After Each Run', body: 'At the end of your cron script, fire a single GET or POST to your endpoint. That\'s the entire integration.',                                        code: 'GET /api/ping/{your-id}' },
  { num: '03', title: 'CronWatch Watches',   body: 'A background job runs every 60 seconds checking for overdue monitors. If a ping is late, it fires an alert pipeline immediately.',                   code: '// checker runs every 60s' },
  { num: '04', title: 'AI Diagnoses',        body: 'Open the AI Analyst on any monitor to get a machine-generated diagnosis of failure patterns — not just raw timestamps.',                             code: '// verdict in < 3s' },
]

const FEATURES = [
  { icon: '⚡', title: 'AI Failure Analyst',       desc: 'Claude reads your ping history and gap patterns to surface root causes. No competitor does this.' },
  { icon: '🔔', title: 'Instant Email Alerts',     desc: 'Powered by Resend. Get notified the moment a job goes silent, with full context of what failed.' },
  { icon: '◉',  title: 'Real-Time Ping Tracking',  desc: 'Every cron job gets a unique endpoint. Hit it after each run — CronWatch timestamps it instantly.' },
  { icon: '◧',  title: 'Plan-Based Limits',        desc: 'Free tier: 10 monitors. Pro: unlimited. Enforced at the database level — no client-side tricks.' },
  { icon: '▣',  title: 'Minimal Integration',      desc: 'One HTTP request. No SDKs, no agents, no config files. Works with any language or scheduler.' },
  { icon: '◫',  title: 'Missed Run Detection',     desc: 'Define your interval. If a ping doesn\'t arrive on time, CronWatch flags it before your users do.' },
]

const STACK = [
  { label: 'Framework', value: 'Next.js 15 App Router' },
  { label: 'Database',  value: 'Supabase (Postgres + RLS)' },
  { label: 'Auth',      value: 'Supabase Auth' },
  { label: 'Email',     value: 'Resend' },
  { label: 'Payments',  value: 'Lemon Squeezy' },
  { label: 'AI',        value: 'Claude API (Anthropic)' },
  { label: 'Hosting',   value: 'Vercel Edge Network' },
  { label: 'Styling',   value: 'Tailwind CSS + CSS Variables' },
]

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'none'; observer.disconnect() } },
      { threshold: 0.08 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useReveal()
  return (
    <div ref={ref} style={{ opacity: 0, transform: 'translateY(28px)', transition: `opacity 0.7s ${delay}ms ease, transform 0.7s ${delay}ms ease` }}>
      {children}
    </div>
  )
}

function SectionLabel({ label, accent }: { label: string; accent: string }) {
  return (
    <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.25em', color: accent, opacity: 0.7, marginBottom: '0.75rem' }}>
      ◈ {label}
    </p>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 800, fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)', color: 'rgba(255,255,255,0.92)', lineHeight: 1.15, letterSpacing: '-0.01em', marginBottom: '3rem' }}>
      {children}
    </h2>
  )
}

export default function AboutPage() {
  const [activeTheme] = usePersistedTheme()
  const theme   = useMemo(() => THEMES[activeTheme], [activeTheme])
  const [base, panel] = theme.palette
  const accent  = theme.accent

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Animated grid background — same as landing page orb setup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    let frame = 0, animId: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = `${accent}08`
      ctx.lineWidth = 1
      const g = 52, oy = (frame * 0.25) % g
      for (let x = 0; x < canvas.width; x += g) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke() }
      for (let y = -g + oy; y < canvas.height; y += g) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke() }
      // scanline
      const sy = (frame * 1.5) % canvas.height
      const gr = ctx.createLinearGradient(0, sy - 60, 0, sy + 60)
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.018)'); gr.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = gr; ctx.fillRect(0, sy - 60, canvas.width, 120)
      frame++; animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [accent])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:none } }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0} }
        .about-nav-link:hover { color: rgba(255,255,255,0.95) !important; background: rgba(255,255,255,0.06) !important; }
        .step-card:hover  { border-color: ${accent}55 !important; background: ${accent}08 !important; }
        .feat-card:hover  { background: ${accent}0A !important; }
        .feat-card:hover .feat-icon { transform: scale(1.15); }
        .stack-row:hover  { background: ${accent}08 !important; }
        .about-cta-primary:hover  { background: ${accent} !important; color: #0a0a0a !important; box-shadow: 0 8px 32px ${accent}55 !important; }
        .about-cta-secondary:hover { border-color: ${accent}88 !important; color: rgba(255,255,255,0.8) !important; }
      `}</style>

      {/* Animated canvas */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: '-15vh', left: '50%', transform: 'translateX(-50%)', width: '70vw', height: '50vh', background: `radial-gradient(ellipse, ${accent}0D 0%, transparent 70%)`, zIndex: 0, pointerEvents: 'none' }} />

      <main style={{ position: 'relative', zIndex: 1, minHeight: '100vh', background: `radial-gradient(circle at 10% 0%, ${accent}30 0%, transparent 45%), radial-gradient(circle at 90% 90%, ${panel}AA 0%, transparent 40%), ${base}`, color: 'rgba(255,255,255,0.82)', transition: 'background 360ms ease' }}>

        {/* ── NAV ── */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 2.5rem', borderBottom: `1px solid ${accent}22`, backdropFilter: 'blur(14px)', background: `${panel}B0`, position: 'sticky', top: 0, zIndex: 100 }}>
          <Link href="/" style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem', color: accent, textDecoration: 'none', letterSpacing: '0.06em' }}>
            CRON<span style={{ color: 'rgba(255,255,255,0.7)' }}>WATCH</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {[{ label: 'Home', href: '/' }, { label: 'Pricing', href: '/pricing' }].map(({ label, href }) => (
              <Link key={label} href={href} className="about-nav-link" style={{ fontFamily: 'monospace', fontSize: '0.72rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', padding: '0.45rem 0.9rem', borderRadius: '8px', transition: 'all 180ms ease' }}>
                {label}
              </Link>
            ))}
            <Link href="/dashboard" style={{ fontFamily: 'monospace', fontSize: '0.7rem', letterSpacing: '0.1em', padding: '0.45rem 1.1rem', borderRadius: '8px', border: `1px solid ${accent}66`, color: accent, textDecoration: 'none', marginLeft: '0.5rem', transition: 'all 180ms ease' }}>
              DASHBOARD →
            </Link>
          </div>
        </nav>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>

          {/* ── HERO ── */}
          <section style={{ padding: '7rem 0 5rem', textAlign: 'center', animation: 'fadeUp 0.8s ease both' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.25em', color: accent, opacity: 0.65, marginBottom: '1.25rem' }}>◈ ABOUT CRONWATCH</div>
            <h1 style={{ fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 800, fontSize: 'clamp(2.6rem, 6vw, 5rem)', lineHeight: 1.06, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.94)', marginBottom: '1.5rem' }}>
              Your cron jobs deserve<br />
              <span style={{ color: accent }}>to be watched.</span>
            </h1>
            <p style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: '1.05rem', color: 'rgba(255,255,255,0.45)', maxWidth: '520px', margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
              CronWatch is a lightweight, AI-powered monitoring tool built for developers who ship fast and can't afford silent failures.
            </p>

            {/* Terminal block */}
            <div style={{ display: 'inline-block', textAlign: 'left', background: 'rgba(0,0,0,0.55)', border: `1px solid ${accent}22`, borderRadius: '10px', padding: '1.25rem 1.75rem', minWidth: '320px' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '0.9rem' }}>
                {['#ff5f57','#febc2e','#28c840'].map(c => <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, display: 'inline-block' }} />)}
              </div>
              {[
                { text: '$ initializing cronwatch...', delay: 0 },
                { text: '$ loading monitor registry', delay: 300 },
                { text: '$ AI analyst: ready', delay: 600 },
                { text: '$ all systems operational ✓', delay: 900 },
              ].map(({ text, delay }) => (
                <TerminalLine key={text} text={text} delay={delay} accent={accent} />
              ))}
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <RevealSection>
            <section style={{ padding: '4rem 0' }}>
              <div style={{ textAlign: 'center' }}>
                <SectionLabel label="HOW IT WORKS" accent={accent} />
                <SectionTitle>Four steps to complete visibility.</SectionTitle>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1px', background: `${accent}14`, border: `1px solid ${accent}14` }}>
                {STEPS.map((s, i) => (
                  <div key={i} className="step-card" style={{ background: base, padding: '1.75rem', transition: 'all 0.2s', border: '1px solid transparent', cursor: 'default' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '2.2rem', fontWeight: 700, color: `${accent}22`, marginBottom: '0.75rem', lineHeight: 1 }}>{s.num}</div>
                    <h3 style={{ fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'rgba(255,255,255,0.88)', marginBottom: '0.6rem' }}>{s.title}</h3>
                    <p style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: '0.83rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, marginBottom: '1rem' }}>{s.body}</p>
                    <code style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: accent, opacity: 0.6, background: `${accent}0F`, padding: '0.3rem 0.6rem', display: 'inline-block', borderRadius: '4px' }}>{s.code}</code>
                  </div>
                ))}
              </div>
            </section>
          </RevealSection>

          {/* ── FEATURES ── */}
          <RevealSection delay={100}>
            <section style={{ padding: '4rem 0' }}>
              <div style={{ textAlign: 'center' }}>
                <SectionLabel label="FEATURES" accent={accent} />
                <SectionTitle>Everything you need. Nothing you don't.</SectionTitle>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1px', background: `${accent}10` }}>
                {FEATURES.map((f, i) => (
                  <div key={i} className="feat-card" style={{ background: base, padding: '1.75rem', transition: 'background 0.2s' }}>
                    <div className="feat-icon" style={{ fontSize: '1.4rem', marginBottom: '0.75rem', display: 'inline-block', transition: 'transform 0.2s' }}>{f.icon}</div>
                    <h3 style={{ fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'rgba(255,255,255,0.88)', marginBottom: '0.5rem' }}>{f.title}</h3>
                    <p style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: '0.83rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.75 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </RevealSection>

          {/* ── TECH STACK ── */}
          <RevealSection delay={100}>
            <section style={{ padding: '4rem 0', maxWidth: '680px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center' }}>
                <SectionLabel label="TECH STACK" accent={accent} />
                <SectionTitle>Built on solid ground.</SectionTitle>
              </div>
              <div style={{ border: `1px solid ${accent}18`, overflow: 'hidden', borderRadius: '6px' }}>
                {STACK.map((item, i) => (
                  <div key={i} className="stack-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.4rem', borderBottom: i < STACK.length - 1 ? `1px solid ${accent}0E` : 'none', transition: 'background 0.15s' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em' }}>{item.label.toUpperCase()}</span>
                    <span style={{ fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 600, fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </RevealSection>

          {/* ── MISSION ── */}
          <RevealSection delay={100}>
            <section style={{ padding: '4rem 0 2rem', maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
              <SectionLabel label="THE MISSION" accent={accent} />
              <SectionTitle>Why CronWatch exists.</SectionTitle>
              <blockquote style={{ borderLeft: `2px solid ${accent}44`, padding: '1.25rem 1.5rem', textAlign: 'left', background: `${accent}06`, marginBottom: '2rem', borderRadius: '0 6px 6px 0' }}>
                <p style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.85, fontStyle: 'italic' }}>
                  "I built CronWatch because I kept waking up to silent failures. Scheduled jobs would miss their window, data pipelines would stall, and nothing would tell me — until a user did. I wanted a tool that's dead simple to integrate but smart enough to explain what went wrong."
                </p>
                <footer style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.85rem', letterSpacing: '0.12em' }}>— MKHOI28, FOUNDER</footer>
              </blockquote>
              <p style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.85 }}>
                CronWatch is a solo side project built with a zero-budget constraint and a commercial ambition. Every design decision favors developer simplicity over feature bloat. The AI layer isn't a gimmick — it's the reason this tool exists.
              </p>
            </section>
          </RevealSection>

          {/* ── CTA ── */}
          <RevealSection delay={100}>
            <section style={{ padding: '5rem 0 7rem', textAlign: 'center' }}>
              <SectionLabel label="GET STARTED FREE" accent={accent} />
              <h2 style={{ fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', color: 'rgba(255,255,255,0.92)', lineHeight: 1.1, marginBottom: '0.75rem' }}>
                Start monitoring in<br /><span style={{ color: accent }}>under 60 seconds.</span>
              </h2>
              <p style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.32)', marginBottom: '2.25rem' }}>Free tier · No credit card · 10 monitors included</p>
              <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/signup" className="about-cta-primary" style={{ fontFamily: 'monospace', fontSize: '0.75rem', letterSpacing: '0.1em', padding: '0.8rem 1.9rem', background: `${accent}22`, border: `1px solid ${accent}66`, color: accent, textDecoration: 'none', borderRadius: '8px', transition: 'all 0.2s', display: 'inline-block' }}>
                  CREATE FREE ACCOUNT →
                </Link>
                <Link href="/" className="about-cta-secondary" style={{ fontFamily: 'monospace', fontSize: '0.75rem', letterSpacing: '0.1em', padding: '0.8rem 1.9rem', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', borderRadius: '8px', transition: 'all 0.2s', display: 'inline-block' }}>
                  ← BACK TO HOME
                </Link>
              </div>
            </section>
          </RevealSection>

        </div>

        {/* Footer */}
        <footer style={{ borderTop: `1px solid ${accent}14`, padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>CRONWATCH © 2026</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Privacy', 'Terms', 'Status'].map(item => (
              <Link key={item} href="#" style={{ fontFamily: 'monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', textDecoration: 'none', letterSpacing: '0.08em' }}>{item}</Link>
            ))}
          </div>
        </footer>
      </main>
    </>
  )
}

function TerminalLine({ text, delay, accent }: { text: string; delay: number; accent: string }) {
  const [visible, setVisible] = useState(false)
  const [typed, setTyped]     = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true)
      let i = 0
      const iv = setInterval(() => {
        setTyped(text.slice(0, i + 1))
        i++
        if (i >= text.length) clearInterval(iv)
      }, 25)
      return () => clearInterval(iv)
    }, delay + 600)
    return () => clearTimeout(t)
  }, [text, delay])

  if (!visible) return <div style={{ height: '1.5rem' }} />

  return (
    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: accent, opacity: 0.75, lineHeight: 1.9 }}>
      {typed}
      {typed.length < text.length && (
        <span style={{ display: 'inline-block', width: '7px', height: '13px', background: accent, marginLeft: '2px', verticalAlign: 'middle', animation: 'blink 1s step-end infinite' }} />
      )}
    </div>
  )
}