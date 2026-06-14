import { Metadata } from 'next'
import { BeatTheHostArena } from '@/components/beat-the-host/BeatTheHostArena'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zambaara.com'

export const metadata: Metadata = {
  title: { absolute: 'Beat The Host — Zambaara Tournament Arena' },
  description: 'Step into the arena, defeat the host, and claim your place in the Hall of Champions. Watch live battles and track the fastest players.',
  keywords: ['Zambaara', 'Beat The Host', 'tournament', 'live battle', 'card game', 'arena'],
  openGraph: {
    title: 'Beat The Host — Zambaara Arena',
    description: 'Live tournament arena. Watch battles unfold and see who becomes the fastest champion.',
    url: `${SITE_URL}/beat-the-host`,
  },
  alternates: { canonical: `${SITE_URL}/beat-the-host` },
}

export default function BeatTheHostPage() {
  return <BeatTheHostArena />
}
