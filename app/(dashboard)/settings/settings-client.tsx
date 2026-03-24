"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Copy, User, Key, Bell } from "lucide-react";

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
};

export default function SettingsClient({ user }: { user: any }) {
  return (
    <motion.div 
      className="max-w-3xl w-full space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">Project Preferences</h1>
        <p className="text-sm text-muted-foreground">Manage organization identity, billing, and global alert routing.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-6">
        
        {/* Profile Card */}
        <div className="border border-border-subtle rounded-md bg-background overflow-hidden">
          <div className="border-b border-border-subtle bg-surface/50 px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Identity</h2>
            <p className="text-xs text-muted-foreground">Authenticated session details.</p>
          </div>
          <div className="p-5 space-y-4 bg-background">
             <div className="grid gap-2">
               <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Email Route</label>
               <Input 
                 value={user?.email || "user@example.com"} 
                 disabled 
                 className="bg-surface border-border-subtle text-muted-foreground h-9 text-sm font-mono cursor-not-allowed"
               />
             </div>
             <div className="grid gap-2">
               <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Display Name</label>
               <Input 
                 placeholder="Engineering Team" 
                 className="bg-background border-border-subtle focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground h-9 text-sm"
               />
             </div>
          </div>
          <div className="px-5 py-3 border-t border-border-subtle bg-surface/30 flex justify-end">
             <Button className="h-8 text-xs font-medium">Commit Changes</Button>
          </div>
        </div>

        {/* API Card */}
        <div className="border border-border-subtle rounded-md bg-background overflow-hidden">
          <div className="border-b border-border-subtle bg-surface/50 px-5 py-4 flex justify-between items-center">
            <div>
               <h2 className="text-sm font-semibold text-foreground">Access Tokens</h2>
               <p className="text-xs text-muted-foreground">Programmatic API authentication.</p>
            </div>
          </div>
          <div className="p-5 space-y-4 bg-background">
             <div className="grid gap-2">
               <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Bearer Token</label>
               <div className="flex gap-2">
                 <Input 
                   type="password"
                   value="cg_live_z89d2k1m3bvcxz9021mnb" 
                   disabled 
                   className="bg-surface border-border-subtle text-muted-foreground font-mono h-9 text-sm"
                 />
                 <Button variant="outline" className="h-9 px-3 border-border-subtle hover:bg-surface">
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                 </Button>
               </div>
               <p className="text-[11px] text-muted-foreground mt-1">Include this token in the Authorization header to script operations.</p>
             </div>
          </div>
          <div className="px-5 py-3 border-t border-border-subtle bg-surface/30 flex items-center justify-between">
             <span className="text-xs text-muted-foreground hover:text-red-500 cursor-pointer font-medium">Revoke</span>
             <Button variant="outline" className="h-8 text-xs font-medium border-border-subtle">Roll Credentials</Button>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
