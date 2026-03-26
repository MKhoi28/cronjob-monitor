import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CronGuard | Modern Cron Job Monitoring",
  description: "Monitor your scheduled tasks 24/7. Get alerted the moment something goes wrong.",
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
