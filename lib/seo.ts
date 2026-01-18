import { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  noindex?: boolean
  keywords?: string[]
}

export function generateSEOMetadata({
  title,
  description,
  image = '/og-image.jpg',
  url,
  type = 'website',
  noindex = false,
  keywords = [],
}: SEOProps): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`

  return {
    title: title ? `${title} | Zambara` : 'Zambara',
    description: description || 'A highly animated and SEO-optimized Next.js web application',
    keywords: keywords.length > 0 ? keywords : ['Next.js', 'React', 'Animation', 'SEO'],
    openGraph: {
      type,
      url: fullUrl,
      title: title || 'Zambara',
      description: description || 'A highly animated and SEO-optimized Next.js web application',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title || 'Zambara',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title || 'Zambara',
      description: description || 'A highly animated and SEO-optimized Next.js web application',
      images: [fullImageUrl],
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: fullUrl,
    },
  }
}

export function generateStructuredData(type: 'WebSite' | 'Article' | 'Product', data: Record<string, any>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': type,
  }

  switch (type) {
    case 'WebSite':
      return {
        ...baseStructuredData,
        name: data.name || 'Zambara',
        url: data.url || siteUrl,
        description: data.description,
        publisher: {
          '@type': 'Organization',
          name: 'Zambara',
        },
      }
    case 'Article':
      return {
        ...baseStructuredData,
        headline: data.headline,
        image: data.image ? (data.image.startsWith('http') ? data.image : `${siteUrl}${data.image}`) : undefined,
        datePublished: data.datePublished,
        dateModified: data.dateModified || data.datePublished,
        author: {
          '@type': 'Person',
          name: data.author || 'Zambara Team',
        },
      }
    case 'Product':
      return {
        ...baseStructuredData,
        name: data.name,
        image: data.image ? (data.image.startsWith('http') ? data.image : `${siteUrl}${data.image}`) : undefined,
        description: data.description,
        offers: data.offers,
      }
    default:
      return baseStructuredData
  }
}