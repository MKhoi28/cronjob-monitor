'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'

// ── Per-channel config ─────────────────────────────────────────────────────
export const CHANNELS = [
  {
    id:          'slack',
    label:       'Slack',
    field:       'slack_webhook_url' as const,
    placeholder: 'https://hooks.slack.com/services/...',
    helpText:    'Slack → Your workspace → Configure apps → Incoming Webhooks',
    helpUrl:     'https://api.slack.com/messaging/webhooks',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
      </svg>
    ),
    color: '#4A154B',
    accent: '#E01E5A',
  },
  {
    id:          'discord',
    label:       'Discord',
    field:       'discord_webhook_url' as const,
    placeholder: 'https://discord.com/api/webhooks/...',
    helpText:    'Discord channel → Edit → Integrations → Webhooks → New Webhook',
    helpUrl:     'https://support.discord.com/hc/en-us/articles/228383668',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    ),
    color: '#5865F2',
    accent: '#5865F2',
  },
  {
    id:          'webhook',
    label:       'Webhook',
    field:       'webhook_url' as const,
    placeholder: 'https://your-service.com/webhook',
    helpText:    'Any URL — CronWatch will POST JSON with monitor name, status, and timestamp',
    helpUrl:     null,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
    color: '#374151',
    accent: '#9CA3AF',
  },
] as const

export type ChannelField = 'slack_webhook_url' | 'discord_webhook_url' | 'webhook_url'

export interface NotificationValues {
  slack_webhook_url:   string
  discord_webhook_url: string
  webhook_url:         string
}

interface Props {
  values:    NotificationValues
  onChange:  (field: ChannelField, value: string) => void
  accent:    string
  panel:     string
  inputStyle: React.CSSProperties
  onFocus:   (e: React.FocusEvent<HTMLInputElement>) => void
  onBlur:    (e: React.FocusEvent<HTMLInputElement>) => void
  isPro:     boolean
}

export default function NotificationChannels({
  values, onChange, accent, panel, inputStyle, onFocus, onBlur, isPro,
}: Props) {
  const [open,       setOpen]       = useState(false)
  const [activeIds,  setActiveIds]  = useState<Set<string>>(new Set())

  function toggle(id: string) {
    const ch = CHANNELS.find(c => c.id === id)!

    setActiveIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })

    if (activeIds.has(id)) {
      onChange(ch.field, '')
    }
  }

  const anyActive = activeIds.size > 0

  return (
    <div className="space-y-3">

      {/* ── Pro gate ────────────────────────────────────────────────────── */}
      {!isPro ? (
        <div
          className="rounded-xl border px-4 py-4 flex items-center justify-between gap-4"
          style={{
            borderColor:     `${accent}22`,
            backgroundColor: `${accent}06`,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {CHANNELS.map(ch => (
                <div
                  key={ch.id}
                  className="w-5 h-5 rounded flex items-center justify-center opacity-25"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}
                >
                  <span className="scale-75">{ch.icon}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-mono text-white/40">Slack · Discord · Webhook</p>
              <p className="text-[11px] font-mono mt-0.5" style={{ color: `${accent}55` }}>
                Extra notification channels are a{' '}
                <span className="font-bold" style={{ color: accent }}>Pro</span> feature
              </p>
            </div>
          </div>
          <a
            href="/pricing"
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all hover:brightness-110"
            style={{
              backgroundColor: `${accent}18`,
              border:          `1px solid ${accent}40`,
              color:           accent,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Upgrade
          </a>
        </div>
      ) : (<>
      {/* Section toggle */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all"
        style={{
          borderColor:     open ? `${accent}55` : `${accent}22`,
          backgroundColor: open ? `${accent}08` : 'transparent',
          color:           open ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
        }}
      >
        <div className="flex items-center gap-2.5">
          {/* Channel icon pills */}
          <div className="flex items-center gap-1">
            {CHANNELS.map(ch => (
              <div
                key={ch.id}
                className="w-5 h-5 rounded flex items-center justify-center transition-all"
                style={{
                  backgroundColor: activeIds.has(ch.id) ? ch.color : 'rgba(255,255,255,0.06)',
                  color:           activeIds.has(ch.id) ? 'white'  : 'rgba(255,255,255,0.25)',
                  opacity:         activeIds.has(ch.id) ? 1        : 0.7,
                }}
              >
                <span className="scale-75">{ch.icon}</span>
              </div>
            ))}
          </div>
          <span className="text-xs font-mono tracking-wide">
            {anyActive
              ? `${activeIds.size} extra channel${activeIds.size > 1 ? 's' : ''} enabled`
              : 'Add notification channels'}
          </span>
          {anyActive && (
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
              style={{ background: `${accent}20`, color: accent }}
            >
              optional
            </span>
          )}
        </div>
        <ChevronDown
          className="w-4 h-4 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: `${accent}66` }}
        />
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-1">
              {CHANNELS.map(ch => {
                const isActive = activeIds.has(ch.id)
                return (
                  <div
                    key={ch.id}
                    className="rounded-xl border overflow-hidden transition-all"
                    style={{
                      borderColor:     isActive ? `${ch.accent}44` : `${accent}18`,
                      backgroundColor: isActive ? `${panel}AA` : `${panel}44`,
                    }}
                  >
                    {/* Channel header row */}
                    <button
                      type="button"
                      onClick={() => toggle(ch.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    >
                      {/* Toggle pill */}
                      <div
                        className="w-8 h-4 rounded-full relative transition-all shrink-0"
                        style={{
                          backgroundColor: isActive ? ch.accent : 'rgba(255,255,255,0.1)',
                        }}
                      >
                        <div
                          className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all"
                          style={{ left: isActive ? '17px' : '2px' }}
                        />
                      </div>

                      {/* Icon */}
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: isActive ? ch.color : 'rgba(255,255,255,0.05)',
                          color:           isActive ? 'white'  : 'rgba(255,255,255,0.3)',
                        }}
                      >
                        {ch.icon}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{ch.label}</p>
                        <p className="text-[11px] font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {ch.helpText}
                          {ch.helpUrl && (
                            <a
                              href={ch.helpUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="ml-1 underline underline-offset-2"
                              style={{ color: `${accent}88` }}
                            >
                              How?
                            </a>
                          )}
                        </p>
                      </div>
                    </button>

                    {/* URL input — only when active */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-4 pb-4"
                        >
                          <Input
                            type="url"
                            placeholder={ch.placeholder}
                            value={values[ch.field]}
                            onChange={e => onChange(ch.field, e.target.value)}
                            className="h-10 font-mono text-sm text-white placeholder:text-white/20"
                            style={{
                              ...inputStyle,
                              borderColor: `${ch.accent}44`,
                            }}
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}

              <p className="text-[11px] font-mono px-1" style={{ color: `${accent}44` }}>
                {'// '} all channels fire in parallel when a monitor goes down
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </>)}

    </div>
  )
}