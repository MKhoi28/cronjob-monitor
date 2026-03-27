'use client'

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

export function ThemeChooserBar({
  activeTheme,
  onChange,
}: {
  activeTheme: number
  onChange: (index: number) => void
}) {
  return (
    <div className="mt-4 grid gap-2 md:grid-cols-4">
      {THEMES.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(index)}
          className="rounded-xl border px-3 py-2 text-left transition-transform hover:scale-[1.01] active:scale-[0.99]"
          style={{
            borderColor: activeTheme === index ? `${item.accent}F0` : 'rgba(255,255,255,0.18)',
            backgroundColor: activeTheme === index ? `${item.palette[1]}EC` : `${item.palette[0]}B8`,
            boxShadow: activeTheme === index ? `0 10px 28px ${item.accent}40` : 'none',
          }}
        >
          <p className="text-sm font-medium text-white">{item.name}</p>
          <p className="text-xs text-white/75">{item.mood}</p>
        </button>
      ))}
    </div>
  )
}
