"use client";

import { useState, useEffect } from 'react'
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Clock } from "lucide-react";
import { useAppTheme } from "@/components/DashboardShell";
import { ViewAllModal } from '@/components/ViewAllModal'
import WelcomeModal from '@/components/onboarding/WelcomeModal'
import OnboardingTour from '@/components/onboarding/OnboardingTour'
import EmptyState from '@/components/onboarding/EmptyState'
type Monitor = any;

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const itemVariants: any = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
};

export default function DashboardClient({ monitors, showWelcome }: { monitors: Monitor[], showWelcome: boolean }) {
  const theme = useAppTheme();
  const [base, panel] = theme.palette;
  const accent        = theme.accent;
  const [showAll, setShowAll] = useState(false)
  const [runTour, setRunTour] = useState(false)

  // Belt-and-suspenders: even if the server still passes showWelcome=true
  // (e.g. DB update hasn't propagated yet), localStorage blocks the re-show.
  const [actuallyShow, setActuallyShow] = useState(false)
  useEffect(() => {
    const alreadySeen = localStorage.getItem('cw-welcome-seen')
    setActuallyShow(showWelcome && !alreadySeen)
  }, [showWelcome])

  const healthyCount = monitors?.filter(m => m.status === 'healthy').length ?? 0;
  const downCount    = monitors?.filter(m => m.status === 'down').length    ?? 0;
  const totalCount   = monitors?.length ?? 0;

  return (
    <>
      <WelcomeModal show={actuallyShow} onStartTour={() => setRunTour(true)} />

      {runTour && (
        <OnboardingTour
          accent={accent}
          onComplete={() => setRunTour(false)}
        />
      )}

      <motion.div className="max-w-6xl w-full space-y-6" variants={containerVariants} initial="hidden" animate="show">

        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Metrics</h1>
            <p className="text-sm" style={{ color: `${accent}88` }}>System telemetry and active routing targets.</p>
          </div>
        </motion.div>

        <motion.div id="tour-metrics" variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Monitored Nodes', value: totalCount,   color: accent    },
            { label: 'Passing',         value: healthyCount, color: '#34D399' },
            { label: 'Failing',         value: downCount,    color: '#F87171' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border p-5 relative overflow-hidden"
              style={{ borderColor: `${accent}44`, backgroundColor: `${panel}99`, boxShadow: `0 8px 30px ${base}66, inset 0 1px 0 rgba(255,255,255,0.08)` }}>
              <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-full" style={{ backgroundColor: color }} />
              <p className="text-[11px] tracking-[0.2em] mb-2" style={{ color: `${accent}88` }}>{label.toUpperCase()}</p>
              <p className="text-3xl font-bold font-mono" style={{ color }}>{value}</p>
            </div>
          ))}
        </motion.div>

        <motion.div id="tour-recent-pings" variants={itemVariants}>
          <div className="rounded-2xl border overflow-hidden"
            style={{ borderColor: `${accent}44`, backgroundColor: `${panel}88`, boxShadow: `0 16px 50px ${base}88, inset 0 1px 0 rgba(255,255,255,0.07)` }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${accent}22` }}>
              <h3 className="text-sm font-semibold text-white">Recent Pings</h3>
              <span className="text-xs cursor-pointer hover:underline" style={{ color: `${accent}88` }} onClick={() => setShowAll(true)}>View all</span>
            </div>

            {!monitors || monitors.length === 0 ? (
              <EmptyState accent={accent} panel={panel} base={base} />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-0 hover:bg-transparent">
                      {['Target', 'State', 'Window', 'Last Event'].map(h => (
                        <TableHead key={h} className="text-[11px] font-medium tracking-[0.18em] py-3"
                          style={{ color: `${accent}77` }}>{h.toUpperCase()}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monitors.slice(0, 5).map((monitor: Monitor) => (
                      <TableRow key={monitor.id} className="border-0 transition-colors"
                        style={{ borderTop: `1px solid ${accent}18` }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${panel}60`)}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                        <TableCell className="py-3 text-sm font-medium text-white">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{
                              backgroundColor: monitor.status === 'healthy' ? '#34D399' : monitor.status === 'down' ? '#F87171' : '#FBBF24',
                              boxShadow: monitor.status === 'healthy' ? '0 0 6px #34D399' : monitor.status === 'down' ? '0 0 6px #F87171' : '0 0 6px #FBBF24',
                            }} />
                            {monitor.name}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 font-mono text-xs">
                          {monitor.status === 'healthy' && <span style={{ color: '#34D399' }}>OK</span>}
                          {monitor.status === 'down'    && <span style={{ color: '#F87171' }}>ERR</span>}
                          {monitor.status === 'late'    && <span style={{ color: '#FBBF24' }}>WAIT</span>}
                        </TableCell>
                        <TableCell className="py-3 font-mono text-xs" style={{ color: `${accent}77` }}>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{monitor.interval_minutes}m</span>
                        </TableCell>
                        <TableCell className="py-3 font-mono text-xs" style={{ color: `${accent}77` }}>
                          {monitor.last_ping_at
                            ? new Date(monitor.last_ping_at).toLocaleTimeString([], { hour12: false })
                            : '--:--:--'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </motion.div>

        {showAll && (
          <ViewAllModal
            accent={accent}
            panel={panel}
            base={base}
            onClose={() => setShowAll(false)}
          />
        )}

      </motion.div>
    </>
  );
}