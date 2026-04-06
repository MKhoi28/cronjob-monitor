"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, Shield, Cookie, CreditCard, ArrowLeft } from "lucide-react";

const NAV = [
  { href: "/terms",   label: "Terms of Service",        icon: FileText   },
  { href: "/privacy", label: "Privacy Policy",           icon: Shield     },
  { href: "/cookies", label: "Cookie Policy",            icon: Cookie     },
  { href: "/billing", label: "Payment & Billing Policy", icon: CreditCard },
];

export default function LegalShell({ children, title, lastUpdated }: {
  children: React.ReactNode;
  title: string;
  lastUpdated: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0a", color: "white" }}>

      {/* Top bar */}
      <div className="border-b sticky top-0 z-40 backdrop-blur-md"
        style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(10,10,10,0.9)" }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-mono transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "white")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
            <ArrowLeft className="w-3.5 h-3.5" />
            back to home
          </Link>
          <span className="font-mono text-sm font-bold tracking-widest" style={{ color: "#c8a050" }}>
            CRONWATCH
          </span>
          <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
            Legal
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 flex gap-12">

        {/* Sidebar */}
        <aside className="w-56 shrink-0 hidden md:block">
          <div className="sticky top-24 space-y-1">
            <p className="text-[10px] font-mono tracking-[0.2em] mb-4"
              style={{ color: "rgba(255,255,255,0.25)" }}>
              LEGAL DOCUMENTS
            </p>
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-mono transition-all"
                  style={{
                    backgroundColor: active ? "rgba(200,160,80,0.1)"  : "transparent",
                    color:           active ? "#c8a050"                : "rgba(255,255,255,0.45)",
                    border:          active ? "1px solid rgba(200,160,80,0.25)" : "1px solid transparent",
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)" }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent" }}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="leading-tight">{label}</span>
                </Link>
              );
            })}

            <div className="pt-6 border-t mt-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
                Effective May 28, 2026
              </p>
              <p className="text-[10px] font-mono mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>
                © 2026 CronWatch
              </p>
            </div>
          </div>
        </aside>

        {/* Content */}
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 min-w-0"
        >
          {/* Page header */}
          <div className="mb-10 pb-8 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <p className="text-xs font-mono mb-2" style={{ color: "#c8a050" }}>CRONWATCH LEGAL</p>
            <h1 className="text-3xl font-bold tracking-tight mb-3">{title}</h1>
            <p className="text-sm font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>
              Effective Date: May 28, 2026 · Last Updated: {lastUpdated}
            </p>
          </div>

          {/* Body */}
          <div className="legal-body space-y-8 text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.7)" }}>
            {children}
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t flex flex-wrap gap-4 text-xs font-mono"
            style={{ borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.25)" }}>
            <span>cronwatch.dev</span>
            <span>·</span>
            <a href="mailto:support@cronwatch.dev" className="hover:text-white transition-colors">
              support@cronwatch.dev
            </a>
            <span>·</span>
            <span>Ho Chi Minh City, Vietnam</span>
          </div>

          {/* Mobile nav */}
          <div className="md:hidden mt-12 pt-8 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <p className="text-[10px] font-mono tracking-[0.2em] mb-3"
              style={{ color: "rgba(255,255,255,0.25)" }}>OTHER POLICIES</p>
            <div className="flex flex-wrap gap-2">
              {NAV.filter(n => n.href !== pathname).map(({ href, label }) => (
                <Link key={href} href={href}
                  className="text-xs font-mono px-3 py-1.5 rounded-lg border transition-colors"
                  style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)" }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </motion.main>
      </div>

      <style>{`
        .legal-body h2 {
          font-size: 1.05rem;
          font-weight: 600;
          color: white;
          margin-top: 2.5rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(200,160,80,0.15);
        }
        .legal-body h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .legal-body p { margin-bottom: 0.75rem; }
        .legal-body ul {
          list-style: none;
          padding: 0;
          margin: 0.75rem 0;
          space-y: 0.4rem;
        }
        .legal-body ul li {
          padding-left: 1.25rem;
          position: relative;
          margin-bottom: 0.35rem;
        }
        .legal-body ul li::before {
          content: "–";
          position: absolute;
          left: 0;
          color: rgba(200,160,80,0.6);
        }
        .legal-body .notice {
          padding: 1rem 1.25rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(200,160,80,0.2);
          background: rgba(200,160,80,0.05);
          color: rgba(255,255,255,0.6);
          font-size: 0.8rem;
          margin: 1rem 0;
        }
        .legal-body .warning {
          padding: 1rem 1.25rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(248,113,113,0.2);
          background: rgba(248,113,113,0.05);
          color: rgba(255,255,255,0.6);
          font-size: 0.8rem;
          margin: 1rem 0;
        }
        .legal-body .caps {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.5);
          line-height: 1.6;
        }
        .legal-body table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.8rem;
        }
        .legal-body th {
          text-align: left;
          padding: 0.6rem 1rem;
          font-mono: true;
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          color: rgba(200,160,80,0.8);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .legal-body td {
          padding: 0.6rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.6);
          vertical-align: top;
        }
        .legal-body tr:last-child td { border-bottom: none; }
        .legal-body a {
          color: #c8a050;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
      `}</style>
    </div>
  );
}