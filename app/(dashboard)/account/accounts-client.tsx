"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Check, Copy, Eye, EyeOff, Loader2, RefreshCw, ShieldOff } from "lucide-react";
import { useAppTheme } from "@/components/DashboardShell";
import { updateDisplayName, generateApiKey, revokeApiKey } from "./action";
import OnboardingChecklist from '@/components/onboarding/OnboardingChecklist'

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

// Small inline status pill
function StatusPill({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md"
      style={{
        color:           type === 'success' ? '#34D399' : '#F87171',
        backgroundColor: type === 'success' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
        border:          `1px solid ${type === 'success' ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
      }}>
      {type === 'success' ? '✓ ' : '✗ '}{message}
    </span>
  )
}

export default function SettingsClient({
  user,
  initialDisplayName,
  maskedKey,
  monitorCount,
  hasPinged,
}: {
  user: any
  initialDisplayName: string
  maskedKey: string | null
  monitorCount: number
  hasPinged: boolean
}) {
  const theme = useAppTheme();
  const [base, panel] = theme.palette;
  const accent        = theme.accent;

  const inputStyle = {
    backgroundColor: `${panel}60`,
    borderColor:     `${accent}33`,
    color:           'white',
    caretColor:      accent,
  };

  // ── Identity state ──────────────────────────────────────────
  const [displayName, setDisplayName]     = useState(initialDisplayName)
  const [isSaving,    setIsSaving]         = useState(false)
  const [saveStatus,  setSaveStatus]       = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  async function handleSave() {
    if (!displayName.trim()) return
    setIsSaving(true)
    setSaveStatus(null)
    const res = await updateDisplayName(displayName)
    setIsSaving(false)
    setSaveStatus(res.error
      ? { type: 'error',   msg: res.error }
      : { type: 'success', msg: 'Saved' }
    )
    setTimeout(() => setSaveStatus(null), 3000)
  }

  // ── Token state ─────────────────────────────────────────────
  // After rolling we temporarily store the full plaintext key in state so the
  // user can copy it. On the next page load it's masked again.
  const [visibleKey,   setVisibleKey]   = useState<string | null>(maskedKey)
  const [isNewKey,     setIsNewKey]     = useState(false)          // true right after rolling
  const [showKey,      setShowKey]      = useState(false)
  const [isCopied,     setIsCopied]     = useState(false)
  const [isRolling,    setIsRolling]    = useState(false)
  const [isRevoking,   setIsRevoking]   = useState(false)
  const [tokenStatus,  setTokenStatus]  = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function showTokenFeedback(type: 'success' | 'error', msg: string) {
    setTokenStatus({ type, msg })
    setTimeout(() => {
      setIsCopied(false)
      setShowKey(false)
      setIsNewKey(false)
    }, 2000)
  }

  async function handleCopy() {
    if (!visibleKey) return
    await navigator.clipboard.writeText(visibleKey)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  async function handleRoll() {
    if (!confirm('This will invalidate your current key. Continue?')) return
    setIsRolling(true)
    setTokenStatus(null)
    const res = await generateApiKey()
    setIsRolling(false)
    if (res.error) {
      showTokenFeedback('error', res.error)
    } else if (res.key) {
      setVisibleKey(res.key)
      setIsNewKey(true)
      setShowKey(true)   // auto-reveal so user can copy immediately
      showTokenFeedback('success', 'New key generated — copy it now')
    }
  }

  async function handleRevoke() {
    if (!confirm('Revoke your API key? All scripts using it will stop working.')) return
    setIsRevoking(true)
    setTokenStatus(null)
    const res = await revokeApiKey()
    setIsRevoking(false)
    if (res.error) {
      showTokenFeedback('error', res.error)
    } else {
      setVisibleKey(null)
      setIsNewKey(false)
      setShowKey(false)
      showTokenFeedback('success', 'Key revoked')
    }
  }

  const displayedToken = showKey
    ? (visibleKey ?? '')
    : (visibleKey ? `${visibleKey.substring(0, 12)}${'•'.repeat(20)}` : '')

  return (
    <motion.div className="max-w-3xl w-full space-y-6" variants={containerVariants} initial="hidden" animate="show">

      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Project Preferences</h1>
        <p className="text-sm" style={{ color: `${accent}77` }}>Manage identity, billing, and global alert routing.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-5">

        {/* ── Onboarding checklist ── */}
          <OnboardingChecklist monitorCount={monitorCount} hasPinged={hasPinged} />
        {/* ── Identity ── */}        <Section title="Identity" subtitle="Authenticated session details." accent={accent} panel={panel} base={base}
          footer={
            <div className="flex items-center gap-3 ml-auto">
              {saveStatus && <StatusPill type={saveStatus.type} message={saveStatus.msg} />}
              <button
                onClick={handleSave}
                disabled={isSaving || !displayName.trim()}
                className="flex items-center gap-1.5 rounded-xl px-5 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
                style={{ backgroundColor: accent, color: base, boxShadow: `0 6px 20px ${accent}44` }}
              >
                {isSaving
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                  : 'Commit Changes'
                }
              </button>
            </div>
          }
        >
          <Field label="Email Route" accent={accent}>
            <Input value={user?.email || ''} disabled
              className="h-10 text-sm font-mono cursor-not-allowed opacity-60" style={inputStyle} />
          </Field>
          <Field label="Display Name" accent={accent}>
            <Input
              placeholder="Engineering Team"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              className="h-10 text-sm text-white placeholder:text-white/30 outline-none"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = `${accent}88`)}
              onBlur={e  => (e.target.style.borderColor = `${accent}33`)}
            />
          </Field>
        </Section>

        {/* ── Access Tokens ── */}
        <Section title="Access Tokens" subtitle="Programmatic API authentication." accent={accent} panel={panel} base={base}
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRevoke}
                  disabled={isRevoking || !visibleKey}
                  className="flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-40"
                  style={{ color: `${accent}66` }}
                  onMouseEnter={e => !isRevoking && visibleKey && ((e.currentTarget as HTMLElement).style.color = '#F87171')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = `${accent}66`)}
                >
                  {isRevoking
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <ShieldOff className="w-3 h-3" />
                  }
                  Revoke
                </button>
                {tokenStatus && <StatusPill type={tokenStatus.type} message={tokenStatus.msg} />}
              </div>

              <button
                onClick={handleRoll}
                disabled={isRolling}
                className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-medium transition-colors disabled:opacity-50"
                style={{ borderColor: `${accent}44`, color: `${accent}CC`, backgroundColor: `${panel}60` }}
                onMouseEnter={e => !isRolling && ((e.currentTarget as HTMLElement).style.backgroundColor = `${panel}CC`)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = `${panel}60`)}
              >
                {isRolling
                  ? <><Loader2 className="w-3 h-3 animate-spin" /> Rolling…</>
                  : <><RefreshCw className="w-3 h-3" /> Roll Credentials</>
                }
              </button>
            </div>
          }
        >
          <Field label="Bearer Token" accent={accent}>
            {visibleKey ? (
              <>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={displayedToken}
                    readOnly
                    className="h-10 text-sm font-mono flex-1 opacity-80 select-all"
                    style={inputStyle}
                  />

                  {/* Show / hide toggle */}
                  <button
                    onClick={() => setShowKey(v => !v)}
                    className="rounded-xl border px-3 h-10 transition-colors"
                    style={{ borderColor: `${accent}44`, backgroundColor: `${panel}60`, color: `${accent}AA` }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = `${panel}CC`)}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = `${panel}60`)}
                    title={showKey ? 'Hide key' : 'Reveal key'}
                  >
                    {showKey
                      ? <EyeOff className="w-3.5 h-3.5" />
                      : <Eye    className="w-3.5 h-3.5" />
                    }
                  </button>

                  {/* Copy */}
                  <button
                    onClick={handleCopy}
                    className="rounded-xl border px-3 h-10 transition-colors"
                    style={{
                      borderColor:     isCopied ? 'rgba(52,211,153,0.3)' : `${accent}44`,
                      backgroundColor: isCopied ? 'rgba(52,211,153,0.08)' : `${panel}60`,
                      color:           isCopied ? '#34D399' : `${accent}AA`,
                    }}
                    title="Copy token"
                  >
                    {isCopied
                      ? <Check className="w-3.5 h-3.5" />
                      : <Copy  className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>

                {isNewKey && (
                  <p className="text-[11px] mt-1 font-mono" style={{ color: '#FBBF24' }}>
                    ⚠ Copy this key now — it won't be shown in full again.
                  </p>
                )}
                {!isNewKey && (
                  <p className="text-[11px] mt-1" style={{ color: `${accent}55` }}>
                    Include in the Authorization header for scripted operations.
                  </p>
                )}
              </>
            ) : (
              <div className="h-10 flex items-center px-3 rounded-xl border text-xs font-mono"
                style={{ borderColor: `${accent}22`, backgroundColor: `${panel}44`, color: `${accent}44` }}>
                No key — click Roll Credentials to generate one.
              </div>
            )}
          </Field>
        </Section>

      </motion.div>
    </motion.div>
  );
}