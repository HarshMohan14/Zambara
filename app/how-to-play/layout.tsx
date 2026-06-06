import { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Zambaara How to Play - Rules & Video Tutorial',
  description: 'Learn the official rules, card elemental cycle (Lava, Rain, Wind, Mountain), and strategic power plays of Zambaara. Watch the tutorial video and download the official rulebook PDF.',
  url: '/how-to-play',
  keywords: ['how to play zambaara', 'zambaara rules', 'zambaara card game rulebook', 'zambaara tutorial', 'elemental cycle lava rain wind mountain'],
})

export default function HowToPlayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
