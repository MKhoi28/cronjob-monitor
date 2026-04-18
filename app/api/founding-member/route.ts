import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { foundingMemberEmailHtml } from '@/lib/emails/founding-member-welcome'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

    const { error } = await resend.emails.send({
      from:    'Khôi @ CronWatch <noreply@crwatch.vercel.app>',
      to:      [email],
      subject: "You're a CronWatch Founding Member — here's what's next",
      html:    foundingMemberEmailHtml(email),
    })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[founding-member email]', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}