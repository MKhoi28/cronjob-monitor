import Link from 'next/link'

export const metadata = {
  title: 'Blog — CronWatch',
  description: 'Guides and tips on cron job monitoring, scheduled task management, and DevOps.',
}

const posts = [
  {
    slug: 'best-free-cron-job-monitoring-tools',
    title: 'Best Free Cron Job Monitoring Tools (2026)',
    date: 'April 8, 2026',
    description: 'Compare the top free cron job monitoring tools — Healthchecks.io, Cronitor, and CronWatch — and find the best fit for your project.',
    tag: 'Comparison',
  },

  {
  slug: 'healthchecks-io-alternative',
  title: 'Best Healthchecks.io Alternatives in 2025',
  date: 'April 8, 2026',
  description: 'Looking for a Healthchecks.io alternative? Compare the top cron job monitoring tools and find the best fit for your stack.',
  tag: 'Comparison',
},

{
  slug: 'how-to-monitor-cron-jobs',
  title: 'How to Monitor Cron Jobs and Get Alerts When They Fail',
  date: 'April 8, 2026',
  description: 'A step-by-step guide to adding cron job monitoring to any project in under 5 minutes using a ping URL.',
  tag: 'Tutorial',
},

]

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-orange-500 text-xs font-mono uppercase tracking-widest mb-3">
            CronWatch Blog
          </p>
          <h1 className="text-4xl font-bold text-white mb-4">
            Guides & Insights
          </h1>
          <p className="text-zinc-400 leading-relaxed">
            Practical guides on cron job monitoring, scheduled task management, and keeping your backend reliable.
          </p>
          <div className="mt-6 h-px bg-gradient-to-r from-orange-500/50 to-transparent" />
        </div>

        {/* Post list */}
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 hover:border-orange-500/50 hover:bg-zinc-800/60 transition-all duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-mono text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded">
                      {post.tag}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">{post.date}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors mb-2">
                    {post.title}
                  </h2>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {post.description}
                  </p>
                  <p className="text-orange-500 text-sm font-mono mt-4 group-hover:translate-x-1 transition-transform inline-block">
                    Read more →
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

      </div>
    </main>
  )
}