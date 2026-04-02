import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const revalidate = 60

// ── Prevent SVG injection via monitor names ───────────────────────────────
function escapeSvg(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  const { data: monitor } = await supabase
    .from('monitors')
    .select('name, status, last_ping_at')
    .eq('id', id)
    .single()

  const label  = 'cronwatch'
  const status = monitor?.status ?? 'unknown'

  // ── Escape all user-controlled strings before inserting into SVG ──────
  const name       = escapeSvg(monitor?.name ?? 'monitor')

  const colorMap: Record<string, string> = {
    healthy: '#34D399',
    down:    '#F87171',
    late:    '#FBBF24',
    waiting: '#94A3B8',
    unknown: '#64748B',
  }

  const labelMap: Record<string, string> = {
    healthy: 'passing',
    down:    'failing',
    late:    'late',
    waiting: 'waiting',
    unknown: 'unknown',
  }

  const color      = colorMap[status] ?? '#64748B'
  const statusText = escapeSvg(labelMap[status] ?? status)
  const labelText  = escapeSvg(label)

  const charWidth   = 6.5
  const labelWidth  = Math.round(labelText.length  * charWidth + 16)
  const statusWidth = Math.round(statusText.length * charWidth + 16)
  const totalWidth  = labelWidth + statusWidth
  const labelCenter = Math.round(labelWidth / 2)
  const statusCenter = Math.round(labelWidth + statusWidth / 2)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${labelText}: ${statusText}">
  <title>${name}: ${statusText}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#0f172a"/>
    <rect x="${labelWidth}" width="${statusWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${labelCenter}" y="15" fill="#000" fill-opacity=".3" aria-hidden="true">${labelText}</text>
    <text x="${labelCenter}" y="14">${labelText}</text>
    <text x="${statusCenter}" y="15" fill="#000" fill-opacity=".3" aria-hidden="true">${statusText}</text>
    <text x="${statusCenter}" y="14" fill="${status === 'healthy' ? '#0f172a' : '#fff'}">${statusText}</text>
  </g>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type':  'image/svg+xml',
      'Cache-Control': 'no-cache, max-age=0',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}