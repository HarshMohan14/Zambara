import { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Zambaara Live Tournaments - Beach Battle & TagCon Arena',
  description: 'Explore live Zambaara elemental card game tournaments. Register for upcoming events, view live brackets, rosters, and discover reigning Zampions.',
  url: '/tournaments',
  keywords: ['zambaara tournaments', 'zambaara live events', 'beach battle zambaara', 'tagcon arena', 'zambaara champions', 'card game bracket'],
})

export default function TournamentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
