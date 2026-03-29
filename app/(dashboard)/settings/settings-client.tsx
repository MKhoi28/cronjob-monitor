"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { useAppTheme } from "@/components/DashboardShell";

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const itemVariants: any = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
};

function Section({ title, subtitle, accent, panel, base, footer, children }: {
  title: string; subtitle: string; accent: string; panel: string; base: string
  footer?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ borderColor: `${accent}44`, backgroundColor: `${panel}88`, boxShadow: `0 8px 30px ${base}66, inset 0 1px 0 rgba(255,255,255,0.07)` }}>
      <div className="px-6 py-4" style={{ borderBottom: `1px solid ${accent}22` }}>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <p className="text-xs mt-0.5" style={{ color: `${accent}77` }}>{subtitle}</p>
      </div>
      <div className="p-6 space-y-4">{children}</div>
      {footer && (
        <div className="px-6 py-3 flex items-center justify-between"
          style={{ borderTop: `1px solid ${accent}22`, backgroundColor: `${panel}44` }}>
          {footer}
        </div>
      )}
    </div>
  )
}

function Field({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium tracking-[0.18em]" style={{ color: `${accent}88` }}>
        {label.toUpperCase()}
      </label>
      {children}
    </div>
  )
}

export default function SettingsClient({ user }: { user: any }) {
  const theme = useAppTheme();
  const [base, panel] = theme.palette;
  const accent        = theme.accent;

  const inputStyle = {
    backgroundColor: `${panel}60`,
    borderColor:     `${accent}33`,
    color:           'white',
    caretColor:      accent,
  };

  return (
    <motion.div className="max-w-3xl w-full space-y-6" variants={containerVariants} initial="hidden" animate="show">

      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Project Preferences</h1>
        <p className="text-sm" style={{ color: `${accent}77` }}>Manage identity, billing, and global alert routing.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-5">

        {/* Identity */}
        <Section title="Identity" subtitle="Authenticated session details." accent={accent} panel={panel} base={base}
          footer={
            <button className="rounded-xl px-5 py-2 text-sm font-medium ml-auto"
              style={{ backgroundColor: accent, color: base, boxShadow: `0 6px 20px ${accent}44` }}>
              Commit Changes
            </button>
          }
        >
          <Field label="Email Route" accent={accent}>
            <Input value={user?.email || "user@example.com"} disabled
              className="h-10 text-sm font-mono cursor-not-allowed opacity-60" style={inputStyle} />
          </Field>
          <Field label="Display Name" accent={accent}>
            <Input placeholder="Engineering Team"
              className="h-10 text-sm text-white placeholder:text-white/30 outline-none" style={inputStyle}
              onFocus={e => (e.target.style.borderColor = `${accent}88`)}
              onBlur={e  => (e.target.style.borderColor = `${accent}33`)} />
          </Field>
        </Section>

        {/* Access Tokens */}
        <Section title="Access Tokens" subtitle="Programmatic API authentication." accent={accent} panel={panel} base={base}
          footer={
            <>
              <span className="text-xs font-medium cursor-pointer hover:text-red-400 transition-colors"
                style={{ color: `${accent}66` }}>Revoke</span>
              <button className="rounded-xl border px-4 py-2 text-xs font-medium transition-colors"
                style={{ borderColor: `${accent}44`, color: `${accent}CC`, backgroundColor: `${panel}60` }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = `${panel}CC`)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = `${panel}60`)}>
                Roll Credentials
              </button>
            </>
          }
        >
          <Field label="Bearer Token" accent={accent}>
            <div className="flex gap-2">
              <Input type="password" value="cg_live_z89d2k1m3bvcxz9021mnb" disabled
                className="h-10 text-sm font-mono flex-1 opacity-60" style={inputStyle} />
              <button className="rounded-xl border px-3 h-10 transition-colors"
                style={{ borderColor: `${accent}44`, backgroundColor: `${panel}60`, color: `${accent}AA` }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = `${panel}CC`)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = `${panel}60`)}>
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] mt-1" style={{ color: `${accent}55` }}>
              Include in the Authorization header for scripted operations.
            </p>
          </Field>
        </Section>

      </motion.div>
    </motion.div>
  );
}