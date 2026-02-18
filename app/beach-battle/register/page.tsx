import { Metadata } from 'next'
import { BeachBattleRegisterForm } from '@/components/beach-battle/BeachBattleRegisterForm'
import { BeachBattleBackground } from '@/components/beach-battle/BeachBattleBackground'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zambaara.com'

export const metadata: Metadata = {
  title: 'Register - Beach Battle',
  description:
    'Register for the Zambaara Beach Battle. Enter your name, email, and phone to join the mythic tournament where four elemental tribes clash by the ocean.',
  openGraph: {
    title: 'Register for Zambaara Beach Battle',
    description:
      'Join the mythic live tournament. Register now to claim your tribe and enter the arena.',
    url: `${SITE_URL}/beach-battle/register`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Zambaara Beach Battle' }],
  },
  alternates: { canonical: `${SITE_URL}/beach-battle/register` },
}

export default function RegisterPage() {
  return (
    <>
      <BeachBattleBackground />
      <BeachBattleRegisterForm />
    </>
  )
}
