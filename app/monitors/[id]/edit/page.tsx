'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { THEMES, ThemePicker } from '@/components/ThemeChooserBar'
import { usePersistedTheme } from '@/hooks/usePersistedTheme'
import BackgroundAnimation from '@/components/BackgroundAnimation'

export default function EditMonitorPage() {
  const params  = useParams()
  const router  = useRouter()
  const id      = params.id as string

  const [activeTheme, setActiveTheme]   = usePersistedTheme()
  const [previewTheme, setPreviewTheme] = useState<number | null>(null)
  const theme  = THEMES[previewTheme ?? activeTheme]
  const accent = theme.accent
  const base   = theme.palette[0]
  const panel  = theme.palette[1]

  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [form, setForm] = useState({
    name:             '',
    interval_minutes: 60,
    grace_minutes:    5,
    alert_email:      '',
  })

  // Load existing monitor data
  useEffect(() => {
    if (!id) return
    const supabase = createClient()
    supabase
      .from('monitors')
      .select('name, interval_minutes, grace_minutes, alert_email')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setError('Monitor not found.')
        } else {
          setForm({
            name:             data.name,
            interval_minutes: data.interval_minutes,
            grace_minutes:    data.grace_minutes,
            alert_email:      data.alert_email,
          })
        }
        setLoading(false)
      })
  }, [id])

  async function handleSave() {
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase
      .from('monitors')
      .update({
        name:             form.name.trim(),
        interval_minutes: form.interval_minutes,
        grace_minutes:    form.grace_minutes,
        alert_email:      form.alert_email.trim(),
      })
      .eq('id', id)

    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/monitors'), 1200)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('monitors').delete().eq('id', id)
    router.push('/monitors')
  }

  const inputStyle = {
    width:           '100%',
    background:      `${panel}88`,
    border:          `1px solid ${accent}28`,
    borderRadius:    '10px',
    padding:         '0.65rem 0.9rem',
    color:           'rgba(255,255,255,0.9)',
    fontFamily:      'monospace',
    fontSize:        '0.85rem',
    outline:         'none',
    transition:      'border-color 0.2s',
  }

  const labelStyle = {
    fontFamily:   'monospace',
    fontSize:     '0.65rem',
    letterSpacing:'0.12em',
    color:        'rgba(255,255,255,0.35)',
    marginBottom: '0.4rem',
    display:      'block' as const,
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: base }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        background: `radial-gradient(circle at 15% 0%, ${accent}18 0%, transparent 45%), radial-gradient(circle at 85% 100%, ${panel}50 0%, transparent 40%)`,
        zIndex: 1,
      }} />

      <BackgroundAnimation theme={theme} />

      <ThemePicker
        className="fixed left-5 top-5 z-50"
        activeTheme={activeTheme}
        onChange={(i) => { setActiveTheme(i); setPreviewTheme(null) }}
        onPreviewChange={setPreviewTheme}
      />

      <Link
        href="/monitors"
        className="fixed top-5 right-5 z-50 flex items-center gap-1.5 font-mono text-xs hover:opacity-100 transition-opacity"
        style={{ color: `${accent}88` }}
      >
        <ArrowLeft className="w-3 h-3" />
        back to monitors
      </Link>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-lg"
        >
          {/* Wordmark */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
            <span className="font-mono text-lg font-bold" style={{ color: accent }}>CronWatch</span>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              background:     'rgba(0,0,0,0.78)',
              borderColor:    `${accent}28`,
              boxShadow:      `0 0 80px ${accent}10, 0 40px 100px rgba(0,0,0,0.7)`,
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Header */}
            <div className="px-8 py-5" style={{ borderBottom: `1px solid ${accent}18`, background: `${accent}08` }}>
              <h1 className="text-lg font-bold text-white">Edit Monitor</h1>
            </div>

            {/* Body */}
            <div className="px-8 py-7 space-y-5">
              {loading ? (
                <p className="text-center font-mono text-sm" style={{ color: `${accent}66 ` }}>
                  Loading monitor...
                </p>
              ) : (
                <>
                  {/* Name */}
                  <div>
                    <label style={labelStyle}>MONITOR NAME</label>
                    <input
                      style={inputStyle}
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Daily backup job"
                      onFocus={e => e.target.style.borderColor = `${accent}88`}
                      onBlur={e  => e.target.style.borderColor = `${accent}28`}
                    />
                  </div>

                  {/* Interval + Grace side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>CHECK INTERVAL (MIN)</label>
                      <input
                        type="number"
                        min={1}
                        style={inputStyle}
                        value={form.interval_minutes}
                        onChange={e => setForm(f => ({ ...f, interval_minutes: Number(e.target.value) }))}
                        onFocus={e => e.target.style.borderColor = `${accent}88`}
                        onBlur={e  => e.target.style.borderColor = `${accent}28`}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>GRACE PERIOD (MIN)</label>
                      <input
                        type="number"
                        min={0}
                        style={inputStyle}
                        value={form.grace_minutes}
                        onChange={e => setForm(f => ({ ...f, grace_minutes: Number(e.target.value) }))}
                        onFocus={e => e.target.style.borderColor = `${accent}88`}
                        onBlur={e  => e.target.style.borderColor = `${accent}28`}
                      />
                    </div>
                  </div>

                  {/* Alert email */}
                  <div>
                    <label style={labelStyle}>ALERT EMAIL</label>
                    <input
                      type="email"
                      style={inputStyle}
                      value={form.alert_email}
                      onChange={e => setForm(f => ({ ...f, alert_email: e.target.value }))}
                      placeholder="you@example.com"
                      onFocus={e => e.target.style.borderColor = `${accent}88`}
                      onBlur={e  => e.target.style.borderColor = `${accent}28`}
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="text-xs font-mono" style={{ color: '#f87171' }}>✗ {error}</p>
                  )}

                  {/* Success */}
                  {success && (
                    <p className="text-xs font-mono" style={{ color: accent }}>✓ Saved! Redirecting...</p>
                  )}

                  {/* Actions */}
                  <div className="space-y-3 pt-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      disabled={saving || success}
                      className="w-full h-11 rounded-xl font-mono font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: accent, color: base, boxShadow: `0 0 24px ${accent}44` }}
                    >
                      {saving ? 'Saving...' : 'Save changes'}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDelete}
                      disabled={deleting}
                      className="w-full h-10 rounded-xl font-mono text-xs flex items-center justify-center gap-2 border transition-colors disabled:opacity-50"
                      style={{
                        borderColor: confirmDelete ? 'rgba(248,113,113,0.6)' : `${accent}80`,
                        color:       confirmDelete ? '#f87171' : `${accent}100`,
                        background:  confirmDelete ? 'rgba(248,113,113,0.08)' : 'transparent',
                      }}
                    >
                      {deleting ? 'Deleting...' : confirmDelete ? 'Click again to confirm delete' : 'Delete monitor'}
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}