import HeroAnimation from '@/components/HeroAnimation'
import { PricingSection } from '@/components/ui/pricing-section'

const PAYMENT_FREQUENCIES = ["monthly", "yearly"]

const TIERS = [
  {
    name: "Free",
    price: { monthly: "Free", yearly: "Free" },
    description: "Perfect for getting started",
    features: [
      "Up to 3 monitors",
      "Email alerts",
      "30-day ping history",
      "1-hour check interval",
    ],
    cta: "Get started",
  },
  {
    name: "Pro",
    price: { monthly: 7, yearly: 5 },
    description: "For serious developers",
    features: [
      "Unlimited monitors",
      "Email alerts",
      "90-day ping history",
      "1-minute check interval",
      "Priority support",
    ],
    cta: "Start free trial",
    popular: true,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">

      {/* Grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,70,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,70,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative border-b border-green-500/20 px-8 py-4 flex items-center justify-between backdrop-blur-sm z-50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-lg font-bold text-green-400">CronGuard</span>
        </div>
        <div className="flex gap-3">
          <a href="/login">
            <button className="font-mono border border-green-500/30 text-green-400 hover:bg-green-500/10 px-4 py-2 rounded-lg text-sm transition-all">
              $ login
            </button>
          </a>
          <a href="/signup">
            <button className="font-mono bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition-all">
              $ get_started
            </button>
          </a>
        </div>
      </nav>

      {/* Hero with GSAP animations */}
      <HeroAnimation />

      {/* Features */}
      <div className="relative max-w-5xl mx-auto px-8 py-16 grid grid-cols-3 gap-6">
        {[
          {
            icon: '⚡',
            title: 'instant_alerts()',
            desc: 'Email fired the millisecond your cron job misses a ping. No delays, no batching.'
          },
          {
            icon: '📡',
            title: 'simple_integration()',
            desc: 'Add one curl command to your cron job. Nothing to install, no agents, no SDKs.'
          },
          {
            icon: '📊',
            title: 'live_dashboard()',
            desc: 'See all monitor statuses at a glance. Healthy, late, or down — always in sync.'
          },
        ].map((f) => (
          <div key={f.title} className="feature-card border border-green-500/20 rounded-xl p-6 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/40 transition-all hover:scale-105">
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="font-mono font-bold text-green-400 mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="relative max-w-5xl mx-auto px-8 py-16">
        <p className="font-mono text-green-400 text-sm mb-2 text-center">// pricing.config</p>
        <div className="pricing-card">
          <PricingSection
            title="Simple Pricing"
            subtitle="No surprises. No lock-in. Cancel anytime."
            frequencies={PAYMENT_FREQUENCIES}
            tiers={TIERS}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-green-500/20 py-8 text-center font-mono text-xs text-gray-600">
        <p>// © 2025 CronGuard. Built for developers who care about uptime.</p>
      </footer>

    </div>
  )
}