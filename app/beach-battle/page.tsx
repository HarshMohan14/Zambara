import { Metadata } from 'next'
import { generateBreadcrumbSchema } from '@/lib/seo'
import { BeachHero } from '@/components/beach-battle/BeachHero'
import { TribesSection } from '@/components/beach-battle/TribesSection'
import { BattleWorksSection } from '@/components/beach-battle/BattleWorksSection'
import { QRRegistrationSection } from '@/components/beach-battle/QRRegistrationSection'
import { BracketSection } from '@/components/beach-battle/BracketSection'
import { LiveBattleArena } from '@/components/beach-battle/LiveBattleArena'
import { TribeScorecardSection } from '@/components/beach-battle/TribeScorecardSection'
import { FinalCTASection } from '@/components/beach-battle/FinalCTASection'
import { BeachBattleFooter } from '@/components/beach-battle/BeachBattleFooter'
import { BeachBattleBackground } from '@/components/beach-battle/BeachBattleBackground'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zambaara.com'

export const metadata: Metadata = {
  title: 'Beach Battle - Where the Elements Clash by the Sea',
  description: 'Join the Zambaara Beach Battle — a mythic live tournament where four elemental tribes clash by the ocean. Battle for glory, win the Ocean Bracelet, and become the Zampion of the Tides. Pre-register now!',
  keywords: [
    'Zambaara Beach Battle',
    'beach card game tournament',
    'elemental tournament',
    'Zampion',
    'live card game event',
    'Lava tribe',
    'Rain tribe',
    'Wind tribe',
    'Mountain tribe',
    'ocean battle',
    'card game competition',
    'Zambaara event',
    'beach battle India',
  ],
  openGraph: {
    title: 'Zambaara Beach Battle - Where the Elements Clash by the Sea',
    description: 'A mythic live tournament where four elemental tribes clash by the ocean. Battle for glory and become the Zampion of the Tides.',
    url: `${SITE_URL}/beach-battle`,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Zambaara Beach Battle',
      },
    ],
  },
  alternates: {
    canonical: `${SITE_URL}/beach-battle`,
  },
}

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Beach Battle', url: '/beach-battle' },
]

// Event schema
const eventSchema = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'Zambaara Beach Battle',
  description: 'A mythic live tournament where four elemental tribes clash by the ocean. Battle for glory and become the Zampion of the Tides.',
  image: `${SITE_URL}/og-image.jpg`,
  organizer: {
    '@type': 'Organization',
    name: 'Zambaara',
    url: SITE_URL,
  },
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
    description: 'Free registration via QR code at the venue.',
  },
}

export default function BeachBattlePage() {
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs)

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />

      {/* Adds beach-battle-bg class to <body> — swaps default bg for ocean-war-bg.jpg.
          The image is fixed to the viewport via CSS in globals.css;
          all content below scrolls over it. Cleaned up on unmount. */}
      <BeachBattleBackground />

      <div className="min-h-screen overflow-x-hidden relative z-[1]">
        {/* Section 1: Cinematic Hero with video */}
        <BeachHero />

        {/* Remaining sections — all transparent, bg shows through */}
        <TribesSection />
        <BattleWorksSection />

        {/* LIVE: Full battle arena with tribe fights, matchups, Zampion round
            — auto-hides when no games exist; auto-refreshes every 8s */}
        <LiveBattleArena />

        <QRRegistrationSection />
        <BracketSection />
        <TribeScorecardSection />
        <FinalCTASection />
        <BeachBattleFooter />
      </div>
    </>
  )
}
