import { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Zambaara Beat the Host Arena - Live Battles & Leaderboard',
  description: 'Step into the Zambaara Beat the Host arena! Watch live battles against the host, view the hall of fame leaderboard of the fastest winning players, and explore the matchmaking history.',
  url: '/beat-the-host',
  keywords: [
    'zambaara beat the host',
    'zambaara live matches',
    'card game tournament',
    'zambaara leaderboard',
    'fastest game winning time',
    'battle history zambaara'
  ],
})

export default function BeatTheHostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
