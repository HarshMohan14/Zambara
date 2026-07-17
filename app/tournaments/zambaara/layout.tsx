import { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Zambaara Tournament Arena - Live Standings & Rosters',
  description: 'View the live roster, seat bookings, and champion listings for the Zambaara Tournament Arena. Follow your favorite elemental tribes: Lava, Rain, Mountain, and Wind.',
  url: '/tournaments/zambaara',
  keywords: ['zambaara tournament', 'zambaara live standings', 'zambaara seat booking', 'lava tribe roster', 'rain tribe roster', 'mountain tribe roster', 'wind tribe roster'],
})

export default function ZambaaraLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
