import LegalShell from "@/components/LegalShell";

export const metadata = { title: "Payment & Billing Policy – CronWatch" };

export default function BillingPage() {
  return (
    <LegalShell title="Payment & Billing Policy" lastUpdated="May 28, 2026">

      <section>
        <h2>4.1 Payment Processor</h2>
        <p>
          All paid subscriptions are processed by Lemon Squeezy, which acts as Merchant of Record.
          Lemon Squeezy handles payment card data, tax collection and remittance, and transaction
          receipts in compliance with applicable financial regulations. By subscribing to the Pro tier,
          you also agree to Lemon Squeezy's Terms of Service.
        </p>
      </section>

      <section>
        <h2>4.2 Pricing</h2>
        <p>
          Current Pro tier pricing is displayed on the CronWatch pricing page at the time of purchase.
          All prices are quoted in US Dollars (USD) unless otherwise indicated. Prices may vary by
          region due to purchasing power parity adjustments or local tax requirements applied by Lemon
          Squeezy.
        </p>
      </section>

      <section>
        <h2>4.3 Billing Cycles</h2>
        <p>Pro subscriptions are billed on a recurring basis:</p>
        <ul>
          <li><strong style={{ color: "rgba(255,255,255,0.8)" }}>Monthly plan:</strong> billed on the same calendar day each month as the original subscription date;</li>
          <li><strong style={{ color: "rgba(255,255,255,0.8)" }}>Annual plan (when available):</strong> billed once per year as a single upfront payment.</li>
        </ul>
        <p>Your billing date is shown in the Settings page and on receipts issued by Lemon Squeezy.</p>
      </section>

      <section>
        <h2>4.4 Free Trial</h2>
        <p>
          If a free trial period is offered at the time of signup, it will be clearly communicated
          during the checkout flow. Your payment method will not be charged until the trial period
          ends. If you cancel before the trial ends, you will not be charged.
        </p>
      </section>

      <section>
        <h2>4.5 Payment Failure</h2>
        <p>If a recurring payment fails:</p>
        <ul>
          <li>Lemon Squeezy will automatically retry the charge according to its retry schedule (typically 3 attempts over 7–14 days);</li>
          <li>You will receive an email notification of the failed payment;</li>
          <li>If all retries fail, your account will be automatically downgraded to the Free tier at the end of the current billing period;</li>
          <li>Pro features including unlimited monitors will become inaccessible; any monitors exceeding the Free tier limit of 10 will be disabled (not deleted) until your account is upgraded again or you reduce your monitor count.</li>
        </ul>
      </section>

      <section>
        <h2>4.6 Upgrades &amp; Downgrades</h2>
        <p>
          You may upgrade to Pro at any time. Pro access is activated immediately upon successful
          payment confirmation. You may downgrade to the Free tier by cancelling your subscription;
          downgrade takes effect at the end of the current billing period. No prorated credits are
          issued for mid-cycle downgrades.
        </p>
      </section>

      <section>
        <h2>4.7 Taxes</h2>
        <p>
          As Merchant of Record, Lemon Squeezy is responsible for calculating, collecting, and remitting
          applicable sales tax, VAT, GST, and other transaction taxes. The applicable tax amount will be
          displayed at checkout before you complete your purchase. Prices shown on the CronWatch website
          may be exclusive of tax.
        </p>
      </section>

      <section>
        <h2>4.8 Pricing Changes</h2>
        <p>
          We reserve the right to modify subscription pricing with at least 30 days' written notice via
          email to all affected subscribers. If you do not agree with a pricing change, you may cancel
          your subscription before the new pricing takes effect; your subscription will continue at the
          current price until the end of your then-current billing period.
        </p>
      </section>

      <section>
        <h2>4.9 Invoices &amp; Receipts</h2>
        <p>
          Transaction receipts are issued automatically by Lemon Squeezy to the email address associated
          with your account. Copies of all past receipts are accessible via the Lemon Squeezy customer
          portal, linked from your CronWatch Settings page.
        </p>
      </section>

      <section>
        <h2>4.10 Refund Policy</h2>
        <p>
          All payments for CronWatch Pro subscriptions are non-refundable, except as explicitly stated
          below or as required by applicable consumer protection law.
        </p>

        <h3>14-Day Money-Back Guarantee (New Subscribers)</h3>
        <p>
          If you are a new subscriber purchasing a Pro plan for the first time, you are entitled to a
          full refund if you request it within 14 calendar days of your initial payment date, provided
          that:
        </p>
        <ul>
          <li>You have not exceeded 500 AI Failure Analyst requests during the 14-day period;</li>
          <li>The refund request is submitted to <a href="mailto:support@cronwatch.dev">support@cronwatch.dev</a> with your account email and Lemon Squeezy order reference.</li>
        </ul>
        <p>
          Refunds under this guarantee are processed to your original payment method within 5–10 business
          days via Lemon Squeezy. Your account will be downgraded to the Free tier upon refund issuance.
        </p>

        <h3>Discretionary Refunds</h3>
        <p>We may issue partial or full refunds at our sole discretion in the following circumstances:</p>
        <ul>
          <li>Service outages or extended unavailability directly attributable to CronWatch infrastructure that persist beyond our SLA remediation targets;</li>
          <li>Billing errors resulting in duplicate charges;</li>
          <li>Charges made after a cancellation request was properly submitted and acknowledged.</li>
        </ul>
        <p>
          Refund requests under this section must be submitted within 60 days of the charge in question
          to <a href="mailto:support@cronwatch.dev">support@cronwatch.dev</a>.
        </p>

        <h3>Statutory Rights</h3>
        <p>
          Nothing in this Refund Policy limits or excludes any rights you have under applicable consumer
          protection legislation in your jurisdiction that cannot be contracted out of, including rights
          to refunds for services not provided as described.
        </p>

        <h3>Cancellations</h3>
        <p>
          Cancellation of a subscription stops future billing but does not entitle you to a refund of
          any amounts already charged (except as provided above). Your Pro access will remain active
          until the end of the billing period for which you have already paid.
        </p>
      </section>

      <section>
        <h2>Contact for Billing Issues</h2>
        <p>
          For billing inquiries, payment failures, refund requests, or receipt copies, contact us at{" "}
          <a href="mailto:support@cronwatch.dev">support@cronwatch.dev</a>. Please include your account
          email and Lemon Squeezy order reference in all billing-related correspondence.
        </p>
      </section>

    </LegalShell>
  );
}