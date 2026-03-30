'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import BackgroundAnimation from '@/components/BackgroundAnimation'
import { THEMES, ThemePicker } from '@/components/ThemeChooserBar'
import { usePersistedTheme } from '@/hooks/usePersistedTheme'
import { PricingCard, type PricingTier } from '@/components/ui/pricing-card'
import { Tab } from '@/components/ui/pricing-tab'

// ── Tier definitions ─────────────────────────────────────────────────────────
const TIERS: PricingTier[] = [
  {
    name:        'Hobby',
    price:       { monthly: 'Free', yearly: 'Free' },
    description: 'Everything you need to get started.',
    features: [
      'Up to 10 monitors',
      'Email alerts',
      '5-minute check interval',
      'Dead-man switch',
      '7-day log history',
    ],
    cta: 'Get started free',
  },
  {
    name:        'Pro',
    price:       { monthly: 9, yearly: 6 },
    description: 'For teams and production workloads.',
    features: [
      'Unlimited monitors',
      'Email + Slack alerts',
      '30-second check interval',
      'Dead-man switch',
      '90-day log history',
      'Priority support',
      'Custom webhooks',
    ],
    cta:         'Upgrade to Pro',
    highlighted: true,
    popular:     true,
  },
]

const FREQUENCIES = ['monthly', 'yearly']

export default function PricingPage() {
  const [activeTheme, setActiveTheme]   = usePersistedTheme()
  const [previewTheme, setPreviewTheme] = useState<number | null>(null)
  const [frequency, setFrequency]       = useState('monthly')

  const router = useRouter()
  const theme  = THEMES[previewTheme ?? activeTheme]

  // ── Stripe checkout ──────────────────────────────────────────────────────
  async function handleUpgrade() {
    const res  = await fetch('/api/stripe', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      console.error('[pricing] Stripe error:', data.error)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden text-white"
      style={{ background: theme.palette[0] }}>

      {/* Gradient overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background:
          `radial-gradient(circle at 15% 0%, ${theme.accent}28 0%, transparent 50%),` +
          `radial-gradient(circle at 85% 100%, ${theme.palette[1]}60 0%, transparent 45%)`,
        zIndex: 1,
      }} />

      {/* Three.js + grid background */}
      <BackgroundAnimation theme={theme} />

      {/* Theme picker */}
      <ThemePicker
        className="fixed left-5 top-5 z-50"
        activeTheme={activeTheme}
        onChange={(i) => { setActiveTheme(i); setPreviewTheme(null) }}
        onPreviewChange={setPreviewTheme}
      />

      {/* Back to home */}
      <Link href="/" className="fixed top-5 right-5 z-50 font-mono text-xs transition-colors"
        style={{ color: `${theme.accent}99` }}>
        {'<'} back to home
      </Link>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-24">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-4xl"
        >

          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.accent }} />
              <span className="font-mono text-lg font-bold" style={{ color: theme.accent }}>CronWatch</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Simple, honest pricing
            </h1>
            <p className="text-white/60 font-mono text-sm">
              {'>'} Start free. Upgrade when you need more.
            </p>

            {/* Frequency toggle */}
            <div className="flex justify-center mt-6">
              <div
                className="flex rounded-full p-1"
                style={{ backgroundColor: `${theme.palette[1]}AA`, border: `1px solid ${theme.accent}33` }}
              >
                {FREQUENCIES.map(freq => (
                  <Tab
                    key={freq}
                    text={freq}
                    selected={frequency === freq}
                    setSelected={setFrequency}
                    discount={freq === 'yearly'}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.55, ease: 'easeOut' }}
            className="grid gap-6 sm:grid-cols-2"
          >
            {TIERS.map(tier => (
              <PricingCard
                key={tier.name}
                tier={tier}
                paymentFrequency={frequency}
                // Only wire Stripe to the paid tier
                onCtaClick={tier.highlighted ? handleUpgrade : undefined}
              />
            ))}
          </motion.div>

          {/* Footer note */}
          <p className="text-center font-mono text-xs mt-8" style={{ color: `${theme.accent}44` }}>
            // All plans include a 14-day money-back guarantee · No hidden fees
          </p>
        </motion.div>
      </div>
    </div>
  )
}