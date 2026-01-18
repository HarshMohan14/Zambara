import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Layout } from '@/components/Layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Zambara',
    template: '%s | Zambara',
  },
  description: 'A highly animated and SEO-optimized Next.js web application',
  keywords: ['Next.js', 'React', 'Animation', 'SEO'],
  authors: [{ name: 'Zambara Team' }],
  creator: 'Zambara',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Zambara',
    title: 'Zambara',
    description: 'A highly animated and SEO-optimized Next.js web application',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Zambara',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zambara',
    description: 'A highly animated and SEO-optimized Next.js web application',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  )
}