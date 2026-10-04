import { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Zambaara Live Tables - Tournament Rounds, Winners & Zampion',
  description: 'Follow the Zambaara tournament live: every table, every player and their elemental tribe, table winners, the final round and the crowned Zampion.',
  url: '/tournaments/zambaara/live',
  keywords: ['zambaara live', 'zambaara tables', 'zambaara final round', 'zambaara zampion', 'zambaara tournament results'],
})

export default function ZambaaraLiveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
