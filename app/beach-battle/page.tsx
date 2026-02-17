import { Metadata } from 'next'
import { generateBreadcrumbSchema } from '@/lib/seo'
import { BeachHero } from '@/components/beach-battle/BeachHero'
import { TribesSection } from '@/components/beach-battle/TribesSection'
import { BattleWorksSection } from '@/components/beach-battle/BattleWorksSection'
import { QRRegistrationSection } from '@/components/beach-battle/QRRegistrationSection'
import { BracketSection } from '@/components/beach-battle/BracketSection'
import { FinalCTASection } from '@/components/beach-battle/FinalCTASection'
import { BeachBattleFooter } from '@/components/beach-battle/BeachBattleFooter'

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

      {/*
        Unified ocean-war background approach:
        - Background image applied on a wrapper <div> (Layout already renders <main>)
        - No background-attachment:fixed (broken on iOS/mobile)
        - backgroundSize: cover ensures the image fills the viewport width
        - Overlay div below content for darkening + teal glow
        - All sections use transparent overlays so the image shows through
      */}
      <div
        className="min-h-screen overflow-x-hidden relative"
        style={{
          backgroundColor: '#000',
          backgroundImage: 'url(/ocean-war-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay for text readability */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,5,15,0.5) 20%, rgba(0,8,20,0.45) 50%, rgba(0,5,15,0.5) 80%, rgba(0,0,0,0.6) 100%)',
            }}
          />
          {/* Bioluminescent teal ambient glow */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 50% 40%, rgba(6, 182, 212, 0.06) 0%, transparent 55%)',
            }}
          />
        </div>

        {/* Section 1: Cinematic Hero with 3D water-droplet video */}
        <div className="relative z-[1]">
          <BeachHero />
        </div>

        {/* All post-hero sections sit above the overlay */}
        <div className="relative z-[1]">
          <TribesSection />
          <BattleWorksSection />
          <QRRegistrationSection />
          <BracketSection />
          <FinalCTASection />
          <BeachBattleFooter />
        </div>
      </div>
    </>
  )
}
