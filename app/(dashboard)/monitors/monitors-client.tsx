"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Clock, Plus, Search, TerminalSquare, Zap } from "lucide-react";
import { useAppTheme } from "@/components/DashboardShell";
import AnalyzeModal from "@/components/AnalyzeModal";

type Monitor = any;

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const itemVariants: any = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
};

export default function MonitorsClient({
  monitors,
  monitorCount,
  monitorLimit,
}: {
  monitors: Monitor[]
  monitorCount: number
  monitorLimit: number
}) {
  const theme = useAppTheme();
  const [base, panel] = theme.palette;
  const accent        = theme.accent;
  const [search, setSearch] = useState("");

  // AI Analyst state
  const [analyzingMonitor, setAnalyzingMonitor] = useState<Monitor | null>(null)

  const isAtLimit = monitorCount >= monitorLimit

  const filteredMonitors = monitors?.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <>
      <motion.div className="max-w-6xl w-full space-y-6" variants={containerVariants} initial="hidden" animate="show">

        {/* ── Header ── */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Monitors</h1>
            <p className="text-sm" style={{ color: `${accent}88` }}>Manage and route all active cron job checks.</p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {isAtLimit ? (
              <Link href="/upgrade">
                <button
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium"
                  style={{ backgroundColor: accent, color: base, boxShadow: `0 8px 24px ${accent}44` }}
                >
                  <Plus className="w-3.5 h-3.5" /> Create Monitor
                </button>
              </Link>
            ) : (
              <Link href="/monitors/new">
                <button
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium"
                  style={{ backgroundColor: accent, color: base, boxShadow: `0 8px 24px ${accent}44` }}
                >
                  <Plus className="w-3.5 h-3.5" /> Create Monitor
                </button>
              </Link>
            )}
            {isAtLimit && (
              <p className="text-[11px] font-mono" style={{ color: '#F87171' }}>
                Limit reached.{' '}
                <Link href="/pricing" className="underline hover:opacity-80 transition-opacity" style={{ color: '#F87171' }}>
                  Upgrade →
                </Link>
              </p>
            )}
          </div>
        </motion.div>

        {/* ── Search ── */}
        <motion.div variants={itemVariants}>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: `${accent}66` }} />
            <Input
              placeholder="Search monitors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-10 text-sm bg-transparent text-white placeholder:text-white/30 outline-none border"
              style={{ borderColor: `${accent}33`, backgroundColor: `${panel}60`, caretColor: accent }}
            />
          </div>
        </motion.div>

        {/* ── Table ── */}
        <motion.div variants={itemVariants}>
          <div className="rounded-2xl border overflow-hidden"
            style={{ borderColor: `${accent}44`, backgroundColor: `${panel}88`, boxShadow: `0 16px 50px ${base}88, inset 0 1px 0 rgba(255,255,255,0.07)` }}>
            {filteredMonitors.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto mb-4"
                  style={{ borderColor: `${accent}33`, backgroundColor: `${panel}88` }}>
                  <TerminalSquare className="w-5 h-5" style={{ color: `${accent}88` }} />
                </div>
                <p className="text-sm font-medium text-white mb-1">No matches</p>
                <p className="text-xs" style={{ color: `${accent}66` }}>No monitors match your current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-0 hover:bg-transparent" style={{ backgroundColor: `${panel}60` }}>
                      {['Name', 'Status', 'Interval', 'Last Ping', 'Ping URL', ''].map((h, i) => (
                        <TableHead key={i} className={`text-[11px] font-medium tracking-[0.18em] py-3 ${i === 5 ? 'text-right' : ''}`}
                          style={{ color: `${accent}77` }}>{h.toUpperCase()}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMonitors.map((monitor: Monitor) => (
                      <TableRow key={monitor.id} className="border-0 transition-colors"
                        style={{ borderTop: `1px solid ${accent}18` }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${panel}60`)}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>

                        {/* Name + status dot */}
                        <TableCell className="py-3 text-sm font-medium text-white">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{
                              backgroundColor: monitor.status === 'healthy' ? '#34D399' : monitor.status === 'down' ? '#F87171' : '#FBBF24',
                              boxShadow: monitor.status === 'healthy' ? '0 0 6px #34D399' : monitor.status === 'down' ? '0 0 6px #F87171' : '0 0 6px #FBBF24',
                            }} />
                            {monitor.name}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3 font-mono text-xs">
                          {monitor.status === 'healthy' && <span style={{ color: '#34D399' }}>OK</span>}
                          {monitor.status === 'down'    && <span style={{ color: '#F87171' }}>DOWN</span>}
                          {monitor.status === 'late'    && <span style={{ color: '#FBBF24' }}>GRACE</span>}
                          {monitor.status === 'waiting' && <span style={{ color: `${accent}66` }}>WAITING</span>}
                        </TableCell>

                        {/* Interval */}
                        <TableCell className="py-3 font-mono text-xs" style={{ color: `${accent}77` }}>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{monitor.interval_minutes}m</span>
                        </TableCell>

                        {/* Last ping */}
                        <TableCell className="py-3 font-mono text-xs" style={{ color: `${accent}77` }}>
                          {monitor.last_ping_at
                            ? new Date(monitor.last_ping_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : 'Waiting...'}
                        </TableCell>

                        {/* Ping URL */}
                        <TableCell className="py-3">
                          <code className="text-[11px] px-2 py-1 rounded font-mono"
                            style={{ backgroundColor: `${panel}AA`, border: `1px solid ${accent}22`, color: `${accent}88` }}>
                            GET /ping/{monitor.id.substring(0, 8)}…
                          </code>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right py-3">
                          <div className="flex items-center justify-end gap-3">

                            {/* AI Analyze button — only show if monitor has been pinged */}
                            {monitor.last_ping_at && (
                              <button
                                onClick={() => setAnalyzingMonitor(monitor)}
                                className="flex items-center gap-1 text-xs font-mono font-medium px-2 py-1 rounded-lg border transition-all hover:scale-105"
                                style={{
                                  color:           accent,
                                  borderColor:     `${accent}33`,
                                  backgroundColor: `${accent}0c`,
                                }}
                                title="Analyze with AI"
                              >
                                <Zap className="w-3 h-3" />
                                Analyze
                              </button>
                            )}

                            <Link
                              href={`/monitors/${monitor.id}/edit`}
                              className="text-xs font-medium hover:underline"
                              style={{ color: `${accent}66` }}
                            >
                              Edit
                            </Link>
                          </div>
                        </TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </motion.div>

      </motion.div>

      {/* ── AI Analyze Modal ── */}
      {analyzingMonitor && (
        <AnalyzeModal
          monitor={analyzingMonitor}
          accent={accent}
          base={base}
          panel={panel}
          onClose={() => setAnalyzingMonitor(null)}
        />
      )}
    </>
  );
}