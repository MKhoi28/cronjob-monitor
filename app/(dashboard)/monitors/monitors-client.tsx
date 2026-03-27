"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Activity, Clock, Plus, TerminalSquare, Search, Filter } from "lucide-react";
import { useState } from "react";
import HeroAnimation from "@/components/HeroAnimation";
import { THEMES, ThemeChooserBar } from "@/components/ThemeChooserBar";

type Monitor = any;

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
};

export default function MonitorsClient({ monitors }: { monitors: Monitor[] }) {
  const [search, setSearch] = useState("");
  const [activeTheme, setActiveTheme] = useState(0);
  const theme = THEMES[activeTheme];

  const filteredMonitors = monitors?.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div
      className="relative left-[-1rem] right-[-1rem] md:left-[-2.5rem] md:right-[-2.5rem] w-[calc(100%+2rem)] md:w-[calc(100%+5rem)] px-4 md:px-10 pb-8"
      style={{
        background:
          `radial-gradient(circle at 8% 0%, ${theme.accent}44 0%, transparent 45%),` +
          `radial-gradient(circle at 100% 100%, ${theme.palette[1]}CC 0%, transparent 40%),` +
          theme.palette[0],
      }}
    >
      <div className="max-w-6xl mx-auto">
        <ThemeChooserBar activeTheme={activeTheme} onChange={setActiveTheme} />
      </div>

      <HeroAnimation />

      <motion.div 
        className="max-w-6xl w-full space-y-6 mx-auto relative z-20 -mt-24"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">Monitors</h1>
          <p className="text-sm text-muted-foreground">Manage and route all active cron job checks.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/monitors/new">
            <Button className="font-medium h-9 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Create Monitor
            </Button>
          </Link>
        </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 items-center justify-between">
         <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search monitors..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 h-9 text-sm bg-surface border-border-subtle hover:border-border-strong rounded-md transition-colors"
            />
         </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="border border-border-subtle rounded-md bg-background overflow-hidden">
            {filteredMonitors.length === 0 ? (
              <div className="text-center py-16 px-6 bg-surface/30">
                <div className="w-12 h-12 rounded-lg border border-border-subtle bg-surface flex items-center justify-center mx-auto mb-4">
                  <TerminalSquare className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">No matches</p>
                <p className="text-xs text-muted-foreground mb-4">No monitors match your current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border-subtle hover:bg-transparent bg-surface/50">
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">Name</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">Status</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">Interval</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">Last Ping</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">Ping URL</TableHead>
                      <TableHead className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">Options</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMonitors.map((monitor, i) => (
                      <TableRow 
                        key={monitor.id}
                        className="border-border-subtle hover:bg-surface/50 transition-colors group cursor-pointer"
                      >
                        <TableCell className="font-medium text-sm text-foreground py-3">
                          <span className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${monitor.status === 'healthy' ? 'bg-emerald-500' : monitor.status === 'down' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                            {monitor.name}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          {monitor.status === 'healthy' && <span className="text-xs text-emerald-500 font-medium font-mono">OK</span>}
                          {monitor.status === 'down' && <span className="text-xs text-red-500 font-medium font-mono">DOWN</span>}
                          {monitor.status === 'late' && <span className="text-xs text-yellow-500 font-medium font-mono">GRACE</span>}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground py-3">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {monitor.interval_minutes}m
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground py-3">
                          {monitor.last_ping_at
                            ? new Date(monitor.last_ping_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })
                            : 'Waiting...'}
                        </TableCell>
                        <TableCell className="py-3">
                          <code className="text-[11px] bg-surface border border-border-subtle px-1.5 py-1 rounded text-muted-foreground font-mono transition-colors group-hover:bg-background">
                            POST /ping/{monitor.id.substring(0,8)}...
                          </code>
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <span className="text-xs font-medium text-muted-foreground hover:text-foreground">Edit</span>
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
    </div>
  );
}
