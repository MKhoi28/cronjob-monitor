import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const revalidate = 60

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const { data: monitor } = await supabase
    .from('monitors')
    .select('name, status')
    .eq('id', id)
    .single()

  return {
    title: monitor ? `${monitor.name} — CronWatch Status` : 'CronWatch Status',
    description: monitor ? `Live status for ${monitor.name} — powered by CronWatch` : '',
  }
}

export default async function StatusPage({ params }: Props) {
  const { id } = await params

  const { data: monitor } = await supabase
    .from('monitors')
    .select('id, name, status, last_ping_at, interval_minutes, grace_minutes, created_at')
    .eq('id', id)
    .single()

  if (!monitor) notFound()

  const { data: logs } = await supabase
    .from('ping_logs')
    .select('pinged_at')
    .eq('monitor_id', id)
    .order('pinged_at', { ascending: false })
    .limit(30)

  const statusConfig = {
    healthy: { color: '#34D399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.3)',  label: 'OPERATIONAL' },
    down:    { color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', label: 'OUTAGE'      },
    late:    { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)',  label: 'DEGRADED'    },
    waiting: { color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', label: 'WAITING'     },
  }

  const cfg      = statusConfig[monitor.status as keyof typeof statusConfig] ?? statusConfig.waiting
  const lastPing = monitor.last_ping_at ? new Date(monitor.last_ping_at) : null
  const uptimePct = logs && logs.length > 1
    ? Math.round(((logs.length - 1) / logs.length) * 100)
    : 100

  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cronwatch.app'
  const badgeUrl = `${appUrl}/api/badge/${monitor.id}`
  const statusUrl = `${appUrl}/status/${monitor.id}`

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080c10',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: "'SF Mono', 'Fira Code', monospace",
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: 'rgba(15,23,42,0.9)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: `0 0 80px rgba(0,0,0,0.6), 0 0 30px ${cfg.color}10`,
      }}>

        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#475569', marginBottom: '1rem', textTransform: 'uppercase' }}>
            {'// '}<span style={{ color: '#34D399' }}>CronWatch</span>{' — live status'}
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
            {monitor.name}
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: '999px',
            border: `1px solid ${cfg.border}`, background: cfg.bg,
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: cfg.color,
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: cfg.color,
              animation: monitor.status === 'healthy' ? 'pulse 2s infinite' : 'none',
            }} />
            {cfg.label}
          </div>
          {lastPing && (
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '8px' }}>
              last ping: {lastPing.toLocaleString(undefined, {
                month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              })}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
            {[
              { label: 'INTERVAL', value: `${monitor.interval_minutes}m`, sub: 'expected' },
              { label: 'GRACE',    value: `${monitor.grace_minutes}m`,    sub: 'tolerance' },
              { label: 'UPTIME',   value: `${uptimePct}%`,                sub: `${logs?.length ?? 0} pings`, color: cfg.color },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px', padding: '12px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color ?? '#f1f5f9' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '9px', color: '#334155', marginTop: '3px' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Ping history bars */}
          {logs && logs.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#334155', textTransform: 'uppercase', marginBottom: '10px' }}>
                {`// ping history (last ${logs.length})`}
              </div>
              <div style={{ display: 'flex', gap: '3px', height: '32px', alignItems: 'flex-end' }}>
                {[...logs].reverse().map((log, i) => (
                  <div
                    key={i}
                    title={new Date(log.pinged_at).toLocaleString()}
                    style={{
                      flex: 1, borderRadius: '2px', minHeight: '8px',
                      height: `${Math.max(30, Math.min(100, 60 + Math.random() * 40))}%`,
                      background: cfg.color,
                      opacity: 0.3 + (i / logs.length) * 0.7,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Embed section */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '10px', padding: '1rem',
          }}>
            <div style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#334155', textTransform: 'uppercase', marginBottom: '10px' }}>
              {'// embed this badge'}
            </div>

            {/* Live badge preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={badgeUrl} alt={`${monitor.name} status`} height="20" />
              <span style={{ fontSize: '10px', color: '#334155' }}>← live, updates every 60s</span>
            </div>

            {/* Markdown */}
            <div style={{
              background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px', padding: '8px 12px', fontSize: '10px',
              color: '#64748b', wordBreak: 'break-all', lineHeight: '1.6', marginBottom: '6px',
            }}>
              <span style={{ color: '#34D399' }}>Markdown:</span><br />
              {`[![${monitor.name} status](${badgeUrl})](${statusUrl})`}
            </div>

            {/* HTML */}
            <div style={{
              background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px', padding: '8px 12px', fontSize: '10px',
              color: '#64748b', wordBreak: 'break-all', lineHeight: '1.6',
            }}>
              <span style={{ color: '#34D399' }}>HTML:</span><br />
              {`<a href="${statusUrl}"><img src="${badgeUrl}" alt="${monitor.name} status" /></a>`}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '10px', color: '#1e293b' }}>
            monitored since {new Date(monitor.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </span>
          <a href={appUrl} style={{ fontSize: '10px', color: '#334155', textDecoration: 'none' }}>
            powered by CronWatch →
          </a>
        </div>

      </div>
    </div>
  )
}