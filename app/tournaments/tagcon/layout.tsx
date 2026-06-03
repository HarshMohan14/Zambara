import { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'TagCon Arena - Zambaara Live Standings & Warrior Rosters',
  description: 'View the live roster, seat bookings, and champion listings for the Zambaara TagCon Arena. Follow your favorite elemental tribes: Lava, Rain, Mountain, and Wind.',
  url: '/tournaments/tagcon',
  keywords: ['tagcon arena', 'zambaara live standings', 'zambaara seat booking', 'lava tribe roster', 'rain tribe roster', 'mountain tribe roster', 'wind tribe roster'],
})

export default function TagconLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
