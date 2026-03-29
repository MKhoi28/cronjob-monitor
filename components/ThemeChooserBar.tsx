'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export type ThemePalette = [string, string, string]

export type ThemeItem = {
  id: string
  name: string
  mood: string
  palette: ThemePalette
  accent: string
}

export const THEMES: ThemeItem[] = [
  { id: 'obsidian-ember', name: 'Obsidian Ember', mood: 'Warm cinematic contrast', palette: ['#0C0C0C', '#2A2420', '#443C36'], accent: '#9B7E6A' },
  { id: 'graphite-steel', name: 'Graphite Steel', mood: 'Cold industrial luxe', palette: ['#0F1113', '#1E2227', '#2D333B'], accent: '#7E9DB4' },
  { id: 'forest-nocturne', name: 'Forest Nocturne', mood: 'Organic cyber depth', palette: ['#0D110F', '#1A2421', '#2A2833'], accent: '#62A58B' },
  { id: 'midnight-amethyst', name: 'Midnight Amethyst', mood: 'High-fashion violet aura', palette: ['#120E16', '#1F1A24', '#2E2735'], accent: '#9A7AC8' },
]

export function ThemePicker({
  activeTheme,
  onChange,
  onPreviewChange,
  className,
}: {
  activeTheme: number
  onChange: (index: number) => void
  onPreviewChange?: (index: number | null) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const effectivePreview = hovered ?? activeTheme
  const previewTheme = useMemo(() => THEMES[effectivePreview], [effectivePreview])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  useEffect(() => {
    onPreviewChange?.(hovered)
  }, [hovered, onPreviewChange])

  return (
    <div ref={rootRef} className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group relative overflow-hidden rounded-xl border px-3 py-2 text-xs font-medium tracking-[0.18em] text-white"
        style={{
          borderColor: `${THEMES[activeTheme].accent}A8`,
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(14px)',
          boxShadow: `0 14px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08) inset`,
          transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        THEMES
        <span
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
          style={{
            background: `linear-gradient(130deg, transparent 10%, ${THEMES[activeTheme].accent}55 50%, transparent 90%)`,
            transition: 'opacity 180ms ease-out',
          }}
        />
      </button>

      {open && (
        <div
          className="mt-3 w-[340px] rounded-2xl border p-3 text-white"
          style={{
            borderColor: 'rgba(255,255,255,0.14)',
            background: 'rgba(20, 20, 24, 0.55)',
            backdropFilter: 'blur(18px)',
            boxShadow: '0 28px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 space-y-2">
              {THEMES.map((item, index) => {
                const isActive = index === activeTheme
                const isHovered = index === hovered
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(index)}
                    onBlur={() => setHovered(null)}
                    onClick={() => {
                      onChange(index)
                      setHovered(null)
                      setOpen(false)
                    }}
                    className="w-full rounded-xl border px-3 py-2 text-left transition-transform"
                    style={{
                      borderColor: isActive ? `${item.accent}E8` : 'rgba(255,255,255,0.12)',
                      background: isHovered || isActive ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.15)',
                      boxShadow: isActive ? `0 10px 26px ${item.accent}2A` : 'none',
                      transform: isHovered ? 'translateY(-1px)' : 'translateY(0px)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-white/70">{item.mood}</p>
                      </div>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.accent, boxShadow: `0 0 14px ${item.accent}` }} />
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="w-[120px] rounded-xl border p-2" style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.18)' }}>
              <div
                className="h-16 w-full rounded-lg border"
                style={{
                  borderColor: 'rgba(255,255,255,0.12)',
                  background:
                    `radial-gradient(circle at 20% 0%, ${previewTheme.accent}80 0%, transparent 55%),` +
                    `radial-gradient(circle at 100% 100%, ${previewTheme.palette[1]}D0 0%, transparent 48%),` +
                    previewTheme.palette[0],
                }}
              />
              <div className="mt-2 flex gap-1.5">
                {previewTheme.palette.map((c) => (
                  <span key={c} className="h-4 w-4 rounded border" style={{ backgroundColor: c, borderColor: 'rgba(255,255,255,0.12)' }} />
                ))}
                <span className="h-4 w-4 rounded border" style={{ backgroundColor: previewTheme.accent, borderColor: 'rgba(255,255,255,0.12)' }} />
              </div>
              <p className="mt-2 text-[10px] tracking-[0.16em] text-white/70">HOVER PREVIEW</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
