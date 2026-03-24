"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal, Activity, ShieldCheck, Zap } from "lucide-react";

const fadeUpVariants: any = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "circOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-hidden">
      
      {/* Precision Grid Background */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none bg-grid-pattern mask-radial-faded" />

      {/* Structured Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border-subtle bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-foreground flex items-center justify-center rounded-sm">
               <div className="w-2 h-2 bg-background" />
            </div>
            <span className="font-semibold tracking-tight text-sm">CronGuard</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="#docs" className="hover:text-foreground transition-colors">Documentation</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Log in</span>
            </Link>
            <Link href="/signup">
              <Button className="h-8 rounded-md bg-foreground text-background hover:bg-foreground/90 font-medium text-xs px-4">
                Start for free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 container mx-auto px-6">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUpVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-strong bg-surface mb-8">
             <span className="w-2 h-2 rounded-full bg-primary" />
             <span className="text-xs font-semibold tracking-wide text-muted-foreground">CRONGUARD v2.0 IS LIVE</span>
          </motion.div>
          
          <motion.h1 variants={fadeUpVariants} className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
            Infrastructure monitoring,<br className="hidden md:block"/> engineered for precision.
          </motion.h1>
          
          <motion.p variants={fadeUpVariants} className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            A minimalist, high-performance platform to track every cron job, background worker, and scheduled task. Know immediately when silent failures occur.
          </motion.p>
          
          <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button className="h-11 px-8 rounded-md bg-foreground text-background hover:bg-foreground/90 font-medium shadow-none">
                Start Monotoring <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="#docs">
              <Button variant="outline" className="h-11 px-8 rounded-md border-border-strong text-foreground hover:bg-surface shadow-none">
                Read Documentation
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Flat Terminal Mockup */}
        <motion.div 
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mt-20 max-w-3xl mx-auto"
        >
          <div className="border border-border-strong rounded-lg bg-[#1f1b18] overflow-hidden shadow-[0_20px_50px_rgba(22,23,17,0.8)]">
            <div className="flex border-b border-border-subtle bg-surface px-4 py-2.5 items-center justify-between">
              <div className="flex gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                 <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                 <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">bash — 80x24</span>
            </div>
            <div className="p-6 font-mono text-xs md:text-sm text-muted-foreground leading-relaxed">
              <p><span className="text-primary">$</span> cronguard login</p>
              <p className="text-foreground">Authentication successful.</p>
              <br/>
              <p><span className="text-primary">$</span> cronguard monitor:create --name "DB Backup" --schedule "0 0 * * *"</p>
              <p className="text-foreground">Created monitor: <span className="text-muted-foreground">mon_z9x8c7v6b5n4m</span></p>
              <br/>
              <p><span className="text-primary">$</span> cronguard ping mon_z9x8c7v6b5n4m</p>
              <p className="text-primary">200 OK — Ping acknowledged.</p>
              <br/>
              <p className="animate-pulse"><span className="text-primary">$</span> _</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Structural Features Section */}
      <section id="features" className="py-24 border-t border-border-subtle bg-surface/30 relative z-10">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border-subtle border border-border-subtle rounded-xl overflow-hidden">
            
            <div className="bg-background p-10 flex flex-col justify-center">
              <Terminal className="w-6 h-6 text-foreground mb-6" />
              <h3 className="text-xl font-semibold mb-3">CLI First</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Everything you can do in the dashboard, you can do from your terminal. Built for developers who prefer to stay in their editor.</p>
            </div>
            
            <div className="bg-background p-10 flex flex-col justify-center">
              <Activity className="w-6 h-6 text-foreground mb-6" />
              <h3 className="text-xl font-semibold mb-3">Instant Telemetry</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Pings are processed with sub-millisecond latency. Your dashboard updates in real-time without polling.</p>
            </div>
            
            <div className="bg-background p-10 flex flex-col justify-center">
               <ShieldCheck className="w-6 h-6 text-foreground mb-6" />
               <h3 className="text-xl font-semibold mb-3">Grace Periods</h3>
               <p className="text-muted-foreground text-sm leading-relaxed">Define exact intervals with configurable grace periods to prevent false positives during heavy server loads.</p>
            </div>
            
            <div className="bg-background p-10 flex flex-col justify-center">
               <Zap className="w-6 h-6 text-foreground mb-6" />
               <h3 className="text-xl font-semibold mb-3">Webhooks & Slack</h3>
               <p className="text-muted-foreground text-sm leading-relaxed">Route critical alerts directly to PagerDuty, Slack, or any custom webhook endpoint the moment a task fails.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-border-subtle bg-background py-10 relative z-10 text-center">
         <p className="text-xs text-muted-foreground">© 2026 CronGuard Platform. Engineered for reliability.</p>
      </footer>
    </div>
  );
}