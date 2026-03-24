"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Activity, CheckCircle2, AlertTriangle, Clock, Plus, TerminalSquare } from "lucide-react";

type Monitor = any;

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
};

export default function DashboardClient({ monitors }: { monitors: Monitor[] }) {
  const healthyCount = monitors?.filter(m => m.status === 'healthy').length ?? 0;
  const downCount = monitors?.filter(m => m.status === 'down').length ?? 0;
  const totalCount = monitors?.length ?? 0;

  return (
    <motion.div 
      className="max-w-6xl w-full space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">Metrics</h1>
          <p className="text-sm text-muted-foreground">System telemetry and active routing targets.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/monitors/new">
            <Button className="font-medium h-9 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Target
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-surface border-border-subtle rounded-md shadow-none">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground tracking-wide uppercase flex justify-between">
              Monitored Nodes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-semibold text-foreground tracking-tight">{totalCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border-subtle rounded-md shadow-none relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500/50" />
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground tracking-wide uppercase flex justify-between">
              Passing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-semibold text-emerald-500 tracking-tight">
              {healthyCount}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border-subtle rounded-md shadow-none relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500/50" />
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground tracking-wide uppercase flex justify-between">
              Failing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-semibold text-red-500 tracking-tight">
              {downCount}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="border border-border-subtle rounded-md bg-background overflow-hidden mt-6">
          <div className="border-b border-border-subtle bg-surface/50 px-4 py-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Recent Pings</h3>
            <span className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">View all</span>
          </div>
          
          {!monitors || monitors.length === 0 ? (
            <div className="text-center py-12 px-4 bg-surface/20">
              <p className="text-sm text-foreground bg-surface border border-border-subtle rounded px-2 py-1 inline-block mb-3">0 configurations found</p>
              <p className="text-xs text-muted-foreground">Use the CLI or UI to attach a target endpoint.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border-subtle hover:bg-transparent">
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase py-2">Target</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase py-2">State</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase py-2">Window</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase py-2 whitespace-nowrap">Last Event</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monitors.slice(0, 5).map((monitor) => (
                    <TableRow key={monitor.id} className="border-border-subtle hover:bg-surface/50 transition-colors">
                      <TableCell className="font-medium text-sm text-foreground py-2.5">
                        <span className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${monitor.status === 'healthy' ? 'bg-emerald-500' : monitor.status === 'down' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                          {monitor.name}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        {monitor.status === 'healthy' && <span className="text-xs text-emerald-500 font-mono">OK</span>}
                        {monitor.status === 'down' && <span className="text-xs text-red-500 font-mono">ERR</span>}
                        {monitor.status === 'late' && <span className="text-xs text-yellow-500 font-mono">WAIT</span>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground py-2.5 font-mono">
                        {monitor.interval_minutes}m
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground py-2.5 font-mono">
                        {monitor.last_ping_at ? new Date(monitor.last_ping_at).toLocaleTimeString([], { hour12: false }) : '--:--:--'}
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
  );
}
