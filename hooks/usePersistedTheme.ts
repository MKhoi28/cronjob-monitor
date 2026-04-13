import { useEffect, useState } from 'react'

const STORAGE_KEY = 'cw-theme'
const THEME_COUNT = 5   // must match THEMES.length in both page.tsx and DashboardShell.tsx

/**
 * Drop-in replacement for useState(0) for the active theme index.
 * - Reads from localStorage on first render (no flash — returns 0 until hydrated)
 * - Writes to localStorage every time the user picks a new theme
 * - Works identically on the landing page, login, signup, dashboard, monitors, settings
 *
 * Usage:
 *   const [activeTheme, setActiveTheme] = usePersistedTheme()
 *   // then use exactly like useState — setActiveTheme(index) syncs everywhere
 */
export function usePersistedTheme(): [number, (index: number) => void] {
  const [activeTheme, setActiveThemeState] = useState(0)

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== null) {
        const idx = Number(saved)
        if (Number.isInteger(idx) && idx >= 0 && idx < THEME_COUNT) {
          setActiveThemeState(idx)
        }
      }
    } catch {
      // localStorage unavailable (private browsing, etc.) — silently fall back to default
    }
  }, [])

  const setActiveTheme = (index: number) => {
    setActiveThemeState(index)
    try {
      localStorage.setItem(STORAGE_KEY, String(index))
    } catch {}
  }

  return [activeTheme, setActiveTheme]
}