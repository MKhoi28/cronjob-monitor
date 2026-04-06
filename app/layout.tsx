import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CronWatch | Modern Cron Job Monitoring",
  description: "Monitor your scheduled tasks 24/7 with CronWatch. Get alerted the moment something goes wrong.",
};

// Tells mobile browsers to match the device width and never auto-zoom.
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