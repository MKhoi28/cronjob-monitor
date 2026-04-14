// app/about/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — CronWatch',
  description: 'CronWatch is an AI-powered cron job monitoring tool built for developers who need instant alerts when scheduled tasks fail.',
  alternates: {
    canonical: 'https://crwatch.vercel.app/about',
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}