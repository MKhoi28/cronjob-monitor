import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="border-b px-8 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900">🟢 CronGuard</span>
        <div className="flex gap-3">
          <a href="/login">
            <Button variant="outline">Sign in</Button>
          </a>
          <a href="/signup">
            <Button>Get started free</Button>
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center py-24 px-8">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          Know instantly when your <br />
          <span className="text-green-600">cron job fails</span>
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
          CronGuard monitors your scheduled tasks 24/7. 
          Get alerted the moment something goes wrong — before your users notice.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <a href="/signup">
            <Button size="lg" className="text-lg px-8">
              Start monitoring free →
            </Button>
          </a>
        </div>
        <p className="mt-4 text-sm text-gray-400">
          Free for up to 3 monitors. No credit card required.
        </p>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-8 py-16 grid grid-cols-3 gap-8">
        {[
          {
            icon: '⚡',
            title: 'Instant alerts',
            desc: 'Get notified by email the moment your cron job misses a ping.'
          },
          {
            icon: '📊',
            title: 'Simple dashboard',
            desc: 'See all your monitors and their status at a glance.'
          },
          {
            icon: '🔗',
            title: 'Easy integration',
            desc: 'Add one curl command to your cron job and you\'re done.'
          },
        ].map((f) => (
          <div key={f.title} className="text-center p-6 rounded-xl border bg-gray-50">
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="font-semibold text-lg text-gray-900">{f.title}</h3>
            <p className="mt-2 text-gray-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="max-w-3xl mx-auto px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Simple pricing</h2>
        <p className="mt-3 text-gray-500">No surprises. Cancel anytime.</p>
        <div className="mt-10 grid grid-cols-2 gap-6">
          <div className="border rounded-xl p-8 text-left">
            <h3 className="font-bold text-xl">Free</h3>
            <p className="text-4xl font-bold mt-4">$0<span className="text-lg text-gray-400">/mo</span></p>
            <ul className="mt-6 space-y-2 text-sm text-gray-600">
              <li>✅ Up to 3 monitors</li>
              <li>✅ Email alerts</li>
              <li>✅ 30-day ping history</li>
            </ul>
            <a href="/signup">
              <Button variant="outline" className="w-full mt-8">Get started</Button>
            </a>
          </div>
          <div className="border-2 border-green-500 rounded-xl p-8 text-left bg-green-50">
            <h3 className="font-bold text-xl">Pro</h3>
            <p className="text-4xl font-bold mt-4">$7<span className="text-lg text-gray-400">/mo</span></p>
            <ul className="mt-6 space-y-2 text-sm text-gray-600">
              <li>✅ Unlimited monitors</li>
              <li>✅ Email alerts</li>
              <li>✅ 90-day ping history</li>
              <li>✅ Priority support</li>
            </ul>
            <a href="/signup">
              <Button className="w-full mt-8">Start free trial</Button>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-400">
        © 2025 CronGuard. Built with ❤️ for developers.
      </footer>

    </div>
  )
}