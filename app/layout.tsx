import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CronGuard | Modern Cron Job Monitoring",
  description: "Monitor your scheduled tasks 24/7. Get alerted the moment something goes wrong.",
};

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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
