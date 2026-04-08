import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://crwatch.vercel.app',
      lastModified: new Date(),
    },
  ]
}