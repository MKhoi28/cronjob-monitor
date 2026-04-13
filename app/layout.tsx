import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata = {
  title: 'CronWatch — AI-Powered Cron Job Monitoring',
  description: 'Monitor your cron jobs and scheduled tasks. Get instant alerts when jobs fail, with AI-powered failure analysis and public status pages.',
  metadataBase: new URL('https://crwatch.vercel.app'),

  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },

  manifest: '/manifest.json',

  openGraph: {
    title: 'CronWatch — AI-Powered Cron Job Monitoring',
    description: 'Get instant alerts when your cron jobs fail.',
    url: 'https://crwatch.vercel.app',
    siteName: 'CronWatch',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'CronWatch — AI-Powered Cron Job Monitoring',
    description: 'Get instant alerts when your cron jobs fail.',
  },
}// Tells mobile browsers to match the device width and never auto-zoom.


// Without this, phones render at a desktop viewport and shrink everything down.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,   // prevents iOS double-tap zoom on form inputs
};

import { Outfit, Great_Vibes } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-script",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased dark`}
    >
      <body className={`${outfit.variable} ${greatVibes.variable} min-h-full flex flex-col font-sans`}>{children}</body>
    </html>
  );
}

