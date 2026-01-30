import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const SITE_URL = 'https://www.zambaara.com'
  const currentDate = new Date().toISOString()

  return [
    {
      url: SITE_URL,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/how-to-play`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ]
}
