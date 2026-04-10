import Link from 'next/link'

interface Props {
  accent: string
  panel: string
  base: string
}

export default function EmptyState({ accent, panel, base }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6 border"
        style={{ borderColor: `${accent}33`, backgroundColor: `${panel}88` }}
      >
        <span className="text-2xl font-mono font-bold" style={{ color: accent }}>+</span>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">No monitors yet</h3>
      <p className="text-sm max-w-sm mb-8" style={{ color: `${accent}88` }}>
        Create your first monitor and add one line to your cron script.
        CronWatch will alert you the moment it stops running.
      </p>

      <Link
        href="/monitors/new"
        className="font-bold font-mono text-sm px-6 py-3 rounded-xl transition-colors"
        style={{ backgroundColor: accent, color: base }}
      >
        Create your first monitor →
      </Link>

      <div
        className="mt-8 p-4 rounded-lg border text-left max-w-sm w-full"
        style={{ borderColor: `${accent}22`, backgroundColor: `${panel}66` }}
      >
        <p className="text-xs font-mono mb-2" style={{ color: `${accent}100` }} >
          Then add to your script
        </p>
        <code className="text-xs font-mono" style={{ color: accent }}>
          curl -s https://crwatch.vercel.app/api/ping/YOUR_ID
        </code>
      </div>
    </div>
  )
}