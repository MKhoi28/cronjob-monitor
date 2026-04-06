import LegalShell from "@/components/LegalShell";

export const metadata = { title: "Cookie Policy – CronWatch" };

export default function CookiesPage() {
  return (
    <LegalShell title="Cookie Policy" lastUpdated="May 28, 2026">

      <section>
        <h2>3.1 What Are Cookies</h2>
        <p>
          Cookies are small text files placed on your device when you visit a website. Related
          technologies include localStorage (browser-side storage) and session tokens transmitted via
          HTTP headers. This policy covers all such mechanisms used by CronWatch.
        </p>
      </section>

      <section>
        <h2>3.2 Cookies and Storage We Use</h2>
        <p>
          CronWatch uses a minimal set of storage mechanisms — only what is strictly necessary to operate
          the Service and remember your preferences.
        </p>
        <table>
          <thead>
            <tr><th>NAME / KEY</th><th>TYPE</th><th>PURPOSE</th><th>DURATION</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><code style={{ color: "rgba(200,160,80,0.9)", fontSize: "0.75rem" }}>sb-access-token</code></td>
              <td>Essential / Authentication</td>
              <td>JWT session token issued by Supabase Auth. Required to authenticate API requests.</td>
              <td>Until expiry or logout</td>
            </tr>
            <tr>
              <td><code style={{ color: "rgba(200,160,80,0.9)", fontSize: "0.75rem" }}>sb-refresh-token</code></td>
              <td>Essential / Authentication</td>
              <td>Refresh token used to renew the access token. Required for persistent sessions.</td>
              <td>Until expiry or logout</td>
            </tr>
            <tr>
              <td><code style={{ color: "rgba(200,160,80,0.9)", fontSize: "0.75rem" }}>cw-theme</code></td>
              <td>Preference (localStorage)</td>
              <td>Stores your selected UI theme index. Contains no personal data.</td>
              <td>Until manually cleared</td>
            </tr>
          </tbody>
        </table>
        <p>
          The <code style={{ color: "rgba(200,160,80,0.9)", fontSize: "0.78rem" }}>cw-theme</code> entry
          is stored in localStorage — not an HTTP cookie — and is never transmitted to our servers.
        </p>
      </section>

      <section>
        <h2>3.3 What We Do Not Use</h2>
        <div className="notice">
          CronWatch does not load, set, or read any of the following:
        </div>
        <ul>
          <li>Google Analytics or any web analytics tracking cookies;</li>
          <li>Meta Pixel, Google Ads, or any advertising network scripts;</li>
          <li>Cross-site tracking cookies of any kind;</li>
          <li>Third-party session recording or heatmap tools.</li>
        </ul>
        <p>
          Since CronWatch does not use advertising or tracking cookies, cookie consent banners or opt-out
          mechanisms for third-party advertising are not applicable to this Service.
        </p>
      </section>

      <section>
        <h2>3.4 Managing Cookies</h2>
        <p>
          Essential authentication cookies cannot be disabled without preventing login and use of the
          Service. You can control or delete cookies at any time via your browser settings. Clearing your
          browser storage will log you out of the Service and reset your theme preference to the default.
        </p>
        <p>
          Most browsers allow you to refuse cookies or delete existing cookies. Refer to your browser's
          help documentation for instructions. Common browsers:
        </p>
        <ul>
          <li>Chrome: Settings → Privacy and Security → Cookies and other site data</li>
          <li>Firefox: Settings → Privacy &amp; Security → Cookies and Site Data</li>
          <li>Safari: Preferences → Privacy → Manage Website Data</li>
          <li>Edge: Settings → Cookies and site permissions</li>
        </ul>
      </section>

      <section>
        <h2>3.5 Changes to This Policy</h2>
        <p>
          If we introduce new cookies or storage mechanisms in the future, we will update this policy and
          notify users at least 14 days before the change takes effect. The "Last Updated" date at the
          top of this page will always reflect the most recent revision.
        </p>
      </section>

    </LegalShell>
  );
}