import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/monitors', '/accounts', '/upgrade'],
    },
    sitemap: 'https://crwatch.vercel.app/sitemap.xml',
  }
}