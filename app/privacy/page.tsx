import LegalShell from "@/components/LegalShell";

export const metadata = { title: "Privacy Policy – CronWatch" };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" lastUpdated="May 28, 2026">

      <section>
        <h2>2.1 Introduction</h2>
        <p>
          CronWatch is committed to protecting your privacy. This Privacy Policy explains what personal
          data we collect, how we use it, with whom we share it, how long we retain it, and what rights
          you have over it. This policy applies to all users of the Service, including visitors to our
          website.
        </p>
        <p>
          We comply with applicable data protection laws, including obligations relevant to processing
          personal data of individuals located in the European Economic Area (GDPR) and other
          jurisdictions where data protection law applies.
        </p>
      </section>

      <section>
        <h2>2.2 Data We Collect</h2>

        <h3>2.2.1 Account Data</h3>
        <p>
          When you register, we collect your email address and a cryptographic hash of your password.
          We do not store plaintext passwords.
        </p>

        <h3>2.2.2 Monitor &amp; Usage Data</h3>
        <p>
          We store the monitor configurations you create (name, interval, grace period, alert email
          address) and the ping event logs associated with each monitor, including timestamps. This data
          is necessary to provide the core Service.
        </p>

        <h3>2.2.3 Payment Data</h3>
        <p>
          Payment card and billing information is processed and stored exclusively by Lemon Squeezy (our
          Merchant of Record). We store only the resulting subscription status, plan tier, and the Lemon
          Squeezy customer reference identifier. We never receive or store raw card data.
        </p>

        <h3>2.2.4 Technical &amp; Log Data</h3>
        <p>
          Our servers and third-party infrastructure providers automatically collect IP addresses, HTTP
          request metadata (URL, method, status code, response time), User-Agent strings, and request
          timestamps. This data is used for security monitoring, rate-limiting, abuse detection, and
          infrastructure diagnostics.
        </p>

        <h3>2.2.5 Communications</h3>
        <p>
          If you contact us for support, we retain the content of that communication and your contact
          details in order to respond and maintain support history.
        </p>
      </section>

      <section>
        <h2>2.3 How We Use Your Data</h2>
        <p>We process your personal data for the following purposes:</p>
        <ul>
          <li><strong style={{ color: "rgba(255,255,255,0.8)" }}>Service delivery:</strong> authenticate your account, process ping events, compute monitor status, and enforce plan limits;</li>
          <li><strong style={{ color: "rgba(255,255,255,0.8)" }}>Alerting:</strong> send transactional alert emails when a monitored job fails to ping;</li>
          <li><strong style={{ color: "rgba(255,255,255,0.8)" }}>Payments:</strong> manage subscription billing and plan entitlements via Lemon Squeezy;</li>
          <li><strong style={{ color: "rgba(255,255,255,0.8)" }}>Security:</strong> detect and prevent abuse, fraud, and unauthorised access;</li>
          <li><strong style={{ color: "rgba(255,255,255,0.8)" }}>AI analysis:</strong> pass anonymised statistical summaries of ping history (not personal data) to the Google Gemini API for failure diagnosis. No personally identifiable information is transmitted to AI inference providers;</li>
          <li><strong style={{ color: "rgba(255,255,255,0.8)" }}>Legal compliance:</strong> retain records as required by applicable law;</li>
          <li><strong style={{ color: "rgba(255,255,255,0.8)" }}>Product improvement:</strong> analyse aggregated, anonymised usage patterns to improve the Service.</li>
        </ul>
        <div className="notice">
          We do not sell, rent, trade, or otherwise transfer your personal data to third parties for advertising or marketing purposes.
        </div>
      </section>

      <section>
        <h2>2.4 Data Retention</h2>
        <table>
          <thead>
            <tr><th>DATA CATEGORY</th><th>RETENTION PERIOD</th></tr>
          </thead>
          <tbody>
            <tr><td>Ping logs (Free tier)</td><td>7 days from creation, then automatically purged</td></tr>
            <tr><td>Ping logs (Pro tier)</td><td>90 days from creation, then automatically purged</td></tr>
            <tr><td>Monitor configurations</td><td>Retained for the lifetime of the account</td></tr>
            <tr><td>Account data (email, hashed password)</td><td>Retained until account deletion, then removed within 30 days</td></tr>
            <tr><td>Payment records (subscription status, customer ID)</td><td>7 years from last transaction for legal and tax compliance</td></tr>
            <tr><td>Server / access logs</td><td>30 days rolling window</td></tr>
            <tr><td>Support communications</td><td>2 years from last communication, unless earlier deletion is requested</td></tr>
          </tbody>
        </table>
        <p>
          Upon account deletion, all personal data and monitor data is permanently removed within 30 days,
          except where retention is required by law, contractual obligation, or legitimate fraud-prevention
          purposes.
        </p>
      </section>

      <section>
        <h2>2.5 Third-Party Data Processors</h2>
        <p>We share your data with the following categories of processors, each bound by appropriate data processing agreements:</p>
        <table>
          <thead>
            <tr><th>PROCESSOR</th><th>PURPOSE &amp; DATA SHARED</th></tr>
          </thead>
          <tbody>
            <tr><td>Supabase (AWS ap-southeast-1, Singapore)</td><td>Database hosting: stores all account, monitor, and ping data</td></tr>
            <tr><td>Vercel (global edge network)</td><td>Application hosting: processes all HTTP requests to the Service</td></tr>
            <tr><td>Resend</td><td>Transactional email: receives alert email address to deliver monitoring alerts</td></tr>
            <tr><td>Lemon Squeezy</td><td>Payment processing: receives billing information as Merchant of Record</td></tr>
            <tr><td>Google Gemini API</td><td>AI inference: receives anonymised ping statistics with no PII</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>2.6 International Data Transfers</h2>
        <p>
          Your data is primarily stored on infrastructure located in Singapore (AWS ap-southeast-1) and
          processed via Vercel's global edge network. Transfers to processors outside your country of
          residence are conducted under appropriate legal mechanisms. If you are located in the EEA, any
          transfers to third countries are subject to adequate safeguards such as Standard Contractual
          Clauses.
        </p>
      </section>

      <section>
        <h2>2.7 Your Rights</h2>
        <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
        <ul>
          <li><strong style={{ color: "rgba(255,255,255,0.8)" }}>Access:</strong> request a copy of the personal data we hold about you;</li>
          <li><strong style={{ color: "rgba(255,255,255,0.8)" }}>Rectification:</strong> request correction of inaccurate or incomplete data;</li>
          <li><strong style={{ color: "rgba(255,255,255,0.8)" }}>Erasure:</strong> request deletion of your personal data ("right to be forgotten");</li>
          <li><strong style={{ color: "rgba(255,255,255,0.8)" }}>Restriction:</strong> request that we limit processing of your data in certain circumstances;</li>
          <li><strong style={{ color: "rgba(255,255,255,0.8)" }}>Portability:</strong> receive your monitor and ping data in a machine-readable format (JSON);</li>
          <li><strong style={{ color: "rgba(255,255,255,0.8)" }}>Objection:</strong> object to processing for purposes other than service delivery;</li>
          <li><strong style={{ color: "rgba(255,255,255,0.8)" }}>Withdraw consent:</strong> where processing is based on consent, withdraw it at any time.</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at <a href="mailto:privacy@cronwatch.dev">privacy@cronwatch.dev</a>.
          We will acknowledge your request within 5 business days and respond substantively within 30
          calendar days.
        </p>
      </section>

      <section>
        <h2>2.8 Security</h2>
        <p>We implement industry-standard technical and organisational measures to protect your personal data, including:</p>
        <ul>
          <li>TLS encryption for all data in transit;</li>
          <li>AES-256 encryption at rest via Supabase managed infrastructure;</li>
          <li>Row Level Security (RLS) policies ensuring users can only access their own data;</li>
          <li>Bcrypt password hashing managed by Supabase Auth;</li>
          <li>Rate limiting on all public API endpoints;</li>
          <li>Timing-safe credential comparison for internal cron job authentication;</li>
          <li>Regular security reviews and dependency audits.</li>
        </ul>
        <p>
          No method of electronic transmission or storage is 100% secure. If you become aware of any
          security vulnerability related to the Service, please disclose it responsibly to{" "}
          <a href="mailto:security@cronwatch.dev">security@cronwatch.dev</a>.
        </p>
      </section>

      <section>
        <h2>2.9 Children's Privacy</h2>
        <p>
          The Service is not directed to individuals under the age of 18. We do not knowingly collect
          personal data from minors. If we become aware that we have collected data from a person under
          18 without verified parental consent, we will take steps to delete that data promptly.
        </p>
      </section>

      <section>
        <h2>2.10 Contact</h2>
        <p>For privacy-related inquiries, data access requests, or to report a suspected data breach:</p>
        <ul>
          <li>Email: <a href="mailto:privacy@cronwatch.dev">privacy@cronwatch.dev</a></li>
          <li>Address: CronWatch, Ho Chi Minh City, Vietnam</li>
          <li>Response time: within 30 calendar days for substantive requests</li>
        </ul>
      </section>

    </LegalShell>
  );
}