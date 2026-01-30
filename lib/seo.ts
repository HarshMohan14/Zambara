import { Metadata } from 'next'

const SITE_NAME = 'Zambaara'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zambaara.com'
const DEFAULT_DESCRIPTION = 'Zambaara - The ultimate elemental card game. Master the Elements, Win the Bracelets, Become the Zampion. Experience strategic gameplay with Lava, Rain, Wind, Mountain, and special power cards.'
const DEFAULT_KEYWORDS = [
  'Zambaara',
  'card game',
  'elemental card game',
  'strategy game',
  'board game',
  'Zampion',
  'battle cards',
  'multiplayer game',
  'family game',
  'party game',
  'Indian card game',
  'elemental powers',
  'Lava card',
  'Meteor card',
  'Lightning card',
  'Freeze card',
]

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  noindex?: boolean
  keywords?: string[]
  publishedTime?: string
  modifiedTime?: string
}

export function generateSEOMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  image = '/og-image.jpg',
  url = '/',
  type = 'website',
  noindex = false,
  keywords = [],
  publishedTime,
  modifiedTime,
}: SEOProps): Metadata {
  const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`
  const fullImageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`
  const allKeywords = [...new Set([...DEFAULT_KEYWORDS, ...keywords])]
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: [{ name: 'Zambaara Team', url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      type: type,
      url: fullUrl,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      locale: 'en_IN',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title || SITE_NAME,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      site: '@zambaara',
      creator: '@zambaara',
      title: fullTitle,
      description,
      images: {
        url: fullImageUrl,
        alt: title || SITE_NAME,
      },
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      nocache: false,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: fullUrl,
      languages: {
        'en-IN': fullUrl,
        'en-US': fullUrl,
      },
    },
    category: 'Games',
  }
}

// JSON-LD Structured Data Generators
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: ['Zambaara Card Game', 'Zambaara Game'],
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/Zambaara.png`,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateGameSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: SITE_NAME,
    alternateName: 'Zambaara Card Game',
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    image: `${SITE_URL}/og-image.jpg`,
    genre: ['Card Game', 'Strategy Game', 'Party Game'],
    numberOfPlayers: {
      '@type': 'QuantitativeValue',
      minValue: 2,
      maxValue: 8,
    },
    gameItem: [
      { '@type': 'Thing', name: 'Lava Card' },
      { '@type': 'Thing', name: 'Rain Card' },
      { '@type': 'Thing', name: 'Wind Card' },
      { '@type': 'Thing', name: 'Mountain Card' },
      { '@type': 'Thing', name: 'Meteor Card' },
      { '@type': 'Thing', name: 'Lightning Card' },
      { '@type': 'Thing', name: 'Freeze Card' },
      { '@type': 'Thing', name: 'Reverse Card' },
    ],
    offers: [
      {
        '@type': 'Offer',
        name: '2-4 Players Pack',
        price: '799',
        priceCurrency: 'INR',
        availability: 'https://schema.org/PreOrder',
      },
      {
        '@type': 'Offer',
        name: '5-8 Players Pack',
        price: '899',
        priceCurrency: 'INR',
        availability: 'https://schema.org/PreOrder',
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
  }
}

export function generateProductSchema(product: {
  name: string
  description: string
  price: number
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image || `${SITE_URL}/og-image.jpg`,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/PreOrder',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/Zambaara.png`,
    description: DEFAULT_DESCRIPTION,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [
      'https://www.facebook.com/zambaara',
      'https://www.instagram.com/zambaara',
      'https://twitter.com/zambaara',
    ],
  }
}
