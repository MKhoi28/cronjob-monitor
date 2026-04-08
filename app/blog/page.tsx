import Link from 'next/link'

export const metadata = {
  title: 'Blog — CronWatch',
  description: 'Guides and tips on cron job monitoring, scheduled task management, and DevOps.',
}

const posts = [
  {
    slug: 'best-free-cron-job-monitoring-tools',
    title: 'Best Free Cron Job Monitoring Tools (2025)',
    date: 'April 8, 2026',
    description: 'Compare the top free cron job monitoring tools and find the best fit for your project.',
  },
]

export default function BlogPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <ul className="space-y-8">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`}>
              <h2 className="text-xl font-semibold hover:underline">{post.title}</h2>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">{post.date}</p>
            <p className="mt-2 text-muted-foreground">{post.description}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}