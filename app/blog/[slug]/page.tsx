import { notFound } from 'next/navigation'

const posts: Record<string, {
  title: string
  date: string
  content: React.ReactNode
}> = {
  'best-free-cron-job-monitoring-tools': {
    title: 'Best Free Cron Job Monitoring Tools (2025)',
    date: 'April 8, 2026',
    content: <p>Post content coming soon.</p>,
  },
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = posts[slug]
  if (!post) notFound()

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-muted-foreground mb-8">{post.date}</p>
      <article className="prose prose-invert max-w-none">
        {post.content}
      </article>
    </main>
  )
}