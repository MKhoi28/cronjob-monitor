export function foundingMemberEmailHtml(email: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're a CronWatch Founding Member</title>
</head>
<body style="margin:0;padding:0;background:#0C0C0C;font-family:'Courier New',Courier,monospace;color:#E8E0D8;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0C0C0C;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header bar -->
          <tr>
            <td style="padding-bottom:32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:13px;font-weight:700;letter-spacing:0.18em;color:#9B7E6A;">CRONWATCH</span>
                  </td>
                  <td align="right">
                    <span style="font-size:10px;letter-spacing:0.2em;color:rgba(255,255,255,0.2);">FOUNDING MEMBER</span>
                  </td>
                </tr>
              </table>
              <div style="margin-top:12px;height:1px;background:linear-gradient(90deg,#9B7E6A44,transparent);"></div>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding-bottom:32px;">
              <div style="font-size:10px;letter-spacing:0.25em;color:#9B7E6A;opacity:0.7;margin-bottom:12px;">◈ SPOT CONFIRMED</div>
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;line-height:1.2;color:#F0EAE4;font-family:'Courier New',Courier,monospace;">
                You're in. Pro free, forever.
              </h1>
              <p style="margin:0;font-size:14px;line-height:1.8;color:rgba(255,255,255,0.45);">
                Hey — this is Khôi, the solo dev behind CronWatch. You just claimed one of
                10 founding member spots. On launch day (May 28), your account
                <strong style="color:rgba(255,255,255,0.7);">${email}</strong>
                will be upgraded to Pro automatically — no action needed from you.
              </p>
            </td>
          </tr>

          <!-- What I need from you -->
          <tr>
            <td style="padding-bottom:28px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#1A1612;border:1px solid rgba(155,126,106,0.2);border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;">
                    <div style="font-size:10px;letter-spacing:0.22em;color:#9B7E6A;opacity:0.7;margin-bottom:16px;">WHAT I NEED FROM YOU</div>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                      <tr>
                        <td width="20" valign="top" style="padding-top:2px;">
                          <span style="font-size:12px;color:#9B7E6A;opacity:0.55;">◷</span>
                        </td>
                        <td>
                          <span style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.75);">Use it for real, for at least 2 weeks</span><br/>
                          <span style="font-size:12px;color:rgba(255,255,255,0.38);line-height:1.7;">
                            Set up a monitor for an actual cron job you run. The more real your usage,
                            the more useful your feedback will be.
                          </span>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                      <tr>
                        <td width="20" valign="top" style="padding-top:2px;">
                          <span style="font-size:12px;color:#9B7E6A;opacity:0.55;">◈</span>
                        </td>
                        <td>
                          <span style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.75);">Report bugs or confusing UX</span><br/>
                          <span style="font-size:12px;color:rgba(255,255,255,0.38);line-height:1.7;">
                            Doesn't need to be a formal report. Just reply to this email with what
                            broke, what felt wrong, or what you expected to happen but didn't.
                          </span>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="20" valign="top" style="padding-top:2px;">
                          <span style="font-size:12px;color:#9B7E6A;opacity:0.55;">◉</span>
                        </td>
                        <td>
                          <span style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.75);">Fill out one short survey (~5 min) before May 28</span><br/>
                          <span style="font-size:12px;color:rgba(255,255,255,0.38);line-height:1.7;">
                            I'll send the link a week before launch. It covers what features matter
                            most to you, what's missing, and your overall impression.
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding-bottom:32px;" align="center">
              <a
                href="https://crwatch.vercel.app/dashboard"
                style="display:inline-block;padding:12px 32px;background:#9B7E6A;color:#0C0C0C;font-size:13px;font-weight:700;letter-spacing:0.08em;text-decoration:none;border-radius:10px;"
              >
                Set Up Your First Monitor →
              </a>
            </td>
          </tr>

          <!-- Personal note -->
          <tr>
            <td style="padding-bottom:32px;">
              <div style="height:1px;background:rgba(155,126,106,0.12);margin-bottom:24px;"></div>
              <p style="margin:0;font-size:13px;line-height:1.9;color:rgba(255,255,255,0.35);">
                A quick personal note — CronWatch is a solo side project I'm building while
                studying. Your feedback doesn't just improve the product; it shapes what I
                ship before launch. I read every reply.
              </p>
              <p style="margin:16px 0 0;font-size:13px;color:rgba(255,255,255,0.35);">
                If anything is broken or confusing, just hit reply.<br/>
                — Khôi
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td>
              <div style="height:1px;background:rgba(155,126,106,0.08);margin-bottom:20px;"></div>
              <p style="margin:0;font-size:10px;letter-spacing:0.1em;color:rgba(255,255,255,0.18);line-height:1.8;">
                CRONWATCH · crwatch.vercel.app<br/>
                You're receiving this because you claimed a founding member spot.<br/>
                <a href="mailto:duongmkhoi.cronwatch@gmail.com" style="color:rgba(155,126,106,0.5);text-decoration:none;">duongmkhoi.cronwatch@gmail.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `
}