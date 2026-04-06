import LegalShell from "@/components/LegalShell";

export const metadata = { title: "Terms of Service – CronWatch" };

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" lastUpdated="May 28, 2026">

      <section>
        <h2>1.1 Acceptance of Terms</h2>
        <p>
          By accessing, registering for, or using CronWatch ("the Service"), you ("User," "you," or
          "your") agree to be legally bound by these Terms of Service ("Terms"). These Terms constitute
          a binding agreement between you and CronWatch ("we," "us," or "our"), the operator of the
          Service. If you are using the Service on behalf of an organisation, you represent that you
          have authority to bind that organisation to these Terms.
        </p>
        <p>
          If you do not agree with any part of these Terms, you must immediately discontinue use of the
          Service. Continued use after any modification of these Terms constitutes acceptance of the
          revised Terms.
        </p>
      </section>

      <section>
        <h2>1.2 Description of Service</h2>
        <p>CronWatch is a cloud-based cron job and scheduled-task monitoring platform. The Service enables users to:</p>
        <ul>
          <li>Register heartbeat ping endpoints that signal successful job completion;</li>
          <li>Receive email alerts when monitored jobs fail to ping within a configured window;</li>
          <li>Access AI-powered failure analysis and diagnostic recommendations;</li>
          <li>Display public status badges and status pages for monitored endpoints;</li>
          <li>View historical ping data and uptime analytics.</li>
        </ul>
        <p>
          The Service is provided on an "as is" and "as available" basis. We reserve the right to add,
          modify, suspend, or discontinue any feature, API endpoint, or tier of the Service at any time,
          with reasonable notice where practicable.
        </p>
      </section>

      <section>
        <h2>1.3 Eligibility</h2>
        <p>You must be at least 18 years of age to create an account or use the Service. By registering, you represent and warrant that:</p>
        <ul>
          <li>You are at least 18 years old;</li>
          <li>You have the legal capacity to enter into binding contracts under applicable law;</li>
          <li>You will provide accurate, current, and complete registration information;</li>
          <li>You will maintain and promptly update such information to keep it accurate;</li>
          <li>Your use of the Service does not violate any law or regulation applicable to you.</li>
        </ul>
      </section>

      <section>
        <h2>1.4 Account Security</h2>
        <p>
          You are solely responsible for maintaining the confidentiality of your account credentials and
          for all activities conducted under your account. You agree to:
        </p>
        <ul>
          <li>Use a strong, unique password for your CronWatch account;</li>
          <li>Treat your API ping endpoint URLs as sensitive credentials;</li>
          <li>Notify us immediately at <a href="mailto:support@cronwatch.dev">support@cronwatch.dev</a> if you suspect unauthorised access;</li>
          <li>Not share your account with any third party.</li>
        </ul>
        <p>We will not be liable for any loss or damage arising from your failure to maintain adequate account security.</p>
      </section>

      <section>
        <h2>1.5 Subscription Plans</h2>
        <p>CronWatch offers the following service tiers:</p>
        <table>
          <thead>
            <tr><th>TIER</th><th>INCLUDED FEATURES</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong style={{ color: "white" }}>Free (Hobby)</strong></td>
              <td>Up to 10 monitors, 5-minute check intervals, email alerts, 7-day ping history, public status badges, SVG badge endpoint</td>
            </tr>
            <tr>
              <td><strong style={{ color: "white" }}>Pro</strong></td>
              <td>Unlimited monitors, 1-minute check intervals, email alerts, 90-day ping history, AI Failure Analyst, priority support response, all Free features included</td>
            </tr>
          </tbody>
        </table>
        <p>
          Free tier features are provided at our sole discretion and may be modified or withdrawn at any
          time. Paid Pro features are governed by the Billing &amp; Payment Policy.
        </p>
      </section>

      <section>
        <h2>1.6 Acceptable Use Policy</h2>
        <p>You agree not to use the Service, directly or indirectly, to:</p>
        <ul>
          <li>Transmit pings at a rate that constitutes abuse or creates denial-of-service conditions against our infrastructure or third-party services;</li>
          <li>Reverse engineer, decompile, disassemble, or attempt to extract the source code of the Service;</li>
          <li>Circumvent, disable, or interfere with any security, rate-limiting, or access-control feature;</li>
          <li>Resell, sublicense, white-label, or otherwise commercialise access to the Service without our prior written consent;</li>
          <li>Use the Service for any purpose that is unlawful, deceptive, or harmful;</li>
          <li>Upload or transmit any malware, viruses, or other malicious code via ping requests;</li>
          <li>Scrape, crawl, or systematically harvest data from the Service;</li>
          <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity;</li>
          <li>Use the AI Failure Analyst to generate content intended to mislead, defraud, or harm any third party.</li>
        </ul>
        <p>Violation of this policy may result in immediate account suspension or termination without refund.</p>
      </section>

      <section>
        <h2>1.7 Intellectual Property</h2>
        <p>
          All content, trademarks, logos, software, and proprietary technology comprising the Service are
          owned by CronWatch or its licensors. These Terms do not grant you any ownership interest or
          licence beyond the limited right to use the Service as described herein.
        </p>
        <p>
          You retain full ownership of all monitor configurations, ping data, and other content you submit
          to the Service. By using the Service, you grant us a limited, non-exclusive licence to process,
          store, and display your content solely for the purpose of providing the Service to you.
        </p>
      </section>

      <section>
        <h2>1.8 Third-Party Services</h2>
        <p>
          The Service integrates with third-party providers including Supabase (database and authentication),
          Vercel (application hosting), Resend (transactional email), Lemon Squeezy (payment processing),
          and Google Gemini (AI inference). Your use of these integrations may be subject to the respective
          providers' terms of service. We are not responsible for the availability, accuracy, or conduct
          of any third-party service.
        </p>
      </section>

      <section>
        <h2>1.9 Disclaimer of Warranties</h2>
        <p className="caps">
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
          IMPLIED. WE EXPRESSLY DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES
          OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT
          WARRANT THAT: (A) THE SERVICE WILL BE UNINTERRUPTED, TIMELY, OR ERROR-FREE; (B) DEFECTS WILL
          BE CORRECTED; (C) THE SERVICE IS FREE OF VIRUSES OR HARMFUL COMPONENTS; OR (D) THE AI FAILURE
          ANALYST WILL PRODUCE ACCURATE OR COMPLETE DIAGNOSTIC RESULTS.
        </p>
      </section>

      <section>
        <h2>1.10 Limitation of Liability</h2>
        <p className="caps">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, CRONWATCH, ITS OFFICERS, DIRECTORS,
          EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
          EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, LOSS OF DATA, BUSINESS INTERRUPTION,
          OR MISSED MONITORING ALERTS, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE, EVEN
          IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
        <p className="caps">
          OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING UNDER THESE TERMS SHALL NOT EXCEED
          THE GREATER OF: (A) THE TOTAL FEES PAID BY YOU TO CRONWATCH IN THE TWELVE (12) CALENDAR MONTHS
          IMMEDIATELY PRECEDING THE CLAIM; OR (B) USD 50.00.
        </p>
        <div className="warning">
          <strong style={{ color: "rgba(255,255,255,0.8)" }}>Critical Use Advisory</strong><br />
          CronWatch is a monitoring and alerting tool. It is not a substitute for robust application
          architecture, redundant infrastructure, or disaster recovery planning. We strongly advise
          against relying solely on CronWatch to detect failures in mission-critical systems.
        </div>
      </section>

      <section>
        <h2>1.11 Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless CronWatch and its affiliates from and against
          any claims, liabilities, damages, judgments, awards, losses, costs, and expenses (including
          reasonable legal fees) arising out of or relating to: (a) your use of the Service; (b) your
          violation of these Terms; (c) your violation of any rights of a third party; or (d) any content
          or data you transmit through the Service.
        </p>
      </section>

      <section>
        <h2>1.12 Modifications to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. Material changes will be communicated
          via email to registered users and/or a notice on the Service at least 30 days before taking
          effect. For non-material changes (such as typographical corrections, contact information updates,
          or clarifications that do not reduce your rights), we will update the "Last Updated" date and
          the revised Terms will take effect immediately upon posting.
        </p>
        <p>
          If you do not agree to the revised Terms, your sole remedy is to stop using the Service and,
          where applicable, cancel your subscription before the effective date of the changes.
        </p>
      </section>

      <section>
        <h2>1.13 Termination</h2>
        <p>Either party may terminate the relationship governed by these Terms at any time:</p>
        <ul>
          <li>You may close your account at any time via the Settings page. Paid subscriptions will remain active until the end of the current billing period.</li>
          <li>We may suspend or permanently terminate your account immediately, with or without notice, for material violation of these Terms, non-payment of fees, conduct that poses risk to other users or the Service, or if required by law.</li>
          <li>Upon termination, your right to access the Service ceases immediately. Data deletion is governed by our Privacy Policy.</li>
        </ul>
      </section>

      <section>
        <h2>1.14 Governing Law &amp; Dispute Resolution</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the Socialist
          Republic of Vietnam, without regard to its conflict of law provisions.
        </p>
        <p>
          In the event of a dispute arising out of or relating to these Terms, the parties agree to first
          attempt resolution through good-faith negotiation for a period of 30 days following written
          notice of the dispute. If negotiation fails, the dispute shall be subject to the exclusive
          jurisdiction of the competent courts of Ho Chi Minh City, Vietnam.
        </p>
      </section>

      <section>
        <h2>1.15 Severability &amp; Entire Agreement</h2>
        <p>
          If any provision of these Terms is found to be unenforceable or invalid, that provision shall
          be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise
          remain in full force and effect. These Terms, together with the Privacy Policy, Billing &amp;
          Payment Policy, Cookie Policy, and Service Level Agreement, constitute the entire agreement
          between you and CronWatch with respect to the Service.
        </p>
      </section>

    </LegalShell>
  );
}