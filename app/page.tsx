import { Metadata } from 'next'
import { Hero } from '@/components/Hero'
import { CardSlider } from '@/components/CardSlider'
import { BattlePackSection } from '@/components/BattlePackSection'
import { CaveSection } from '@/components/CaveSection'
import { ImageSlider } from '@/components/ImageSlider'
import { Gallery } from '@/components/Gallery'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to Zambara - Master the Elements, Win the Bracelets, Become the Zampion',
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <section id="hero">
        <Hero />
      </section>
      <section id="cards">
        <CardSlider />
      </section>
      <section id="battle-pack">
        <BattlePackSection />
      </section>
      <section id="cave">
        <CaveSection />
      </section>
      <ImageSlider />
      <Gallery />
    </main>
  )
}
