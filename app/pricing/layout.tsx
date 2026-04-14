// app/pricing/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — CronWatch',
  description: 'Simple, transparent pricing for cron job monitoring. Start free, upgrade when you need more.',
  alternates: {
    canonical: 'https://crwatch.vercel.app/pricing',
  },
  openGraph: {
    title: 'Pricing — CronWatch',
    description: 'Simple, transparent pricing for cron job monitoring.',
    url: 'https://crwatch.vercel.app/pricing',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}