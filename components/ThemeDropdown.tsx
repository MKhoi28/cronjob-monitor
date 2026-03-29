'use client'

import { Listbox } from '@headlessui/react'
import { Fragment } from 'react'

type Theme = {
  id: string
  name: string
  mood: string
  palette: [string, string, string]
  accent: string
}

export default function ThemeDropdown({
  themes,
  value,
  onChange,
}: {
  themes: Theme[]
  value: number
  onChange: (index: number) => void
}) {
  const selected = themes[value]

  return (
    <div className="relative z-[9999]">
      <Listbox value={value} onChange={onChange}>
        {/* BUTTON */}
        <Listbox.Button
          className="flex items-center gap-2.5 rounded-xl border px-3.5 py-2 text-sm font-medium backdrop-blur-md"
          style={{
            borderColor: `${selected.accent}66`,
            backgroundColor: `${selected.palette[1]}90`,
          }}
        >
          <span
            className="h-3 w-3 rounded-full"
            style={{
              backgroundColor: selected.accent,
              boxShadow: `0 0 8px ${selected.accent}`,
            }}
          />
          {selected.name}
        </Listbox.Button>

        {/* DROPDOWN */}
        <Listbox.Options
          className="fixed left-6 top-20 w-72 rounded-2xl border backdrop-blur-2xl z-[9999]"
          style={{
            backgroundColor: `${selected.palette[1]}F0`,
            borderColor: `${selected.accent}44`,
            boxShadow: `0 20px 60px rgba(0,0,0,0.6)`,
          }}
        >
          <div className="px-4 pt-3 pb-2 text-[10px] tracking-[0.22em]">
            CHOOSE THEME
          </div>

          <div className="p-2">
            {themes.map((theme, index) => (
              <Listbox.Option key={theme.id} value={index} as={Fragment}>
                {({ active, selected }) => (
                  <button
                    className="w-full rounded-xl px-3 py-2.5 text-left"
                    style={{
                      backgroundColor: active
                        ? `${theme.palette[1]}CC`
                        : selected
                        ? `${theme.palette[1]}88`
                        : 'transparent',
                      border: active
                        ? `1px solid ${theme.accent}`
                        : '1px solid transparent',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{theme.name}</p>
                        <p className="text-[11px] text-white/60">
                          {theme.mood}
                        </p>
                      </div>

                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: theme.accent,
                        }}
                      />
                    </div>
                  </button>
                )}
              </Listbox.Option>
            ))}
          </div>
        </Listbox.Options>
      </Listbox>
    </div>
  )
}