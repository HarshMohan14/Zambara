import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConditionalLayout } from '@/components/ConditionalLayout'
import { generateWebsiteSchema, generateOrganizationSchema, generateGameSchema } from '@/lib/seo'

const inter = Inter({ subsets: ['latin'] })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zambaara.com'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#d1a058' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Zambaara - Master the Elements, Become the Zampion',
    template: '%s | Zambaara',
  },
  description: 'Zambaara - The ultimate elemental card game. Master the Elements, Win the Bracelets, Become the Zampion. Strategic gameplay for 2-8 players with Lava, Rain, Wind, Mountain, and special power cards.',
  keywords: [
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
    'game night',
    'tabletop game',
  ],
  authors: [{ name: 'Zambaara Team', url: SITE_URL }],
  creator: 'Zambaara',
  publisher: 'Zambaara',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'Zambaara',
    title: 'Zambaara - Master the Elements, Become the Zampion',
    description: 'The ultimate elemental card game. Master the Elements, Win the Bracelets, Become the Zampion. Strategic gameplay for 2-8 players.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Zambaara - Elemental Card Game',
        type: 'image/jpeg',
      },
      {
        url: '/Zambaara.png',
        width: 800,
        height: 600,
        alt: 'Zambaara Logo',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@zambaara',
    creator: '@zambaara',
    title: 'Zambaara - Master the Elements, Become the Zampion',
    description: 'The ultimate elemental card game. Strategic gameplay for 2-8 players.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/Zambaara.png', type: 'image/png' },
    ],
    apple: [
      { url: '/Zambaara.png', type: 'image/png' },
    ],
    shortcut: '/Zambaara.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: SITE_URL,
    languages: {
      'en-IN': SITE_URL,
      'en-US': SITE_URL,
    },
  },
  category: 'Games',
  classification: 'Card Game, Strategy Game, Party Game',
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  other: {
    'msapplication-TileColor': '#d1a058',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Zambaara',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const websiteSchema = generateWebsiteSchema()
  const organizationSchema = generateOrganizationSchema()
  const gameSchema = generateGameSchema()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(gameSchema) }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  )
}
