import { Metadata } from 'next'
import { Hero } from '@/components/Hero'
import { CardSlider } from '@/components/CardSlider'
import { RankingsSlider } from '@/components/RankingsSlider'
import { BattlePackSection } from '@/components/BattlePackSection'
import { CaveSection } from '@/components/CaveSection'
import { ImageSlider } from '@/components/ImageSlider'
import { Gallery } from '@/components/Gallery'
import { ContactForm } from '@/components/ContactForm'
import { Newsletter } from '@/components/Newsletter'
import { generateFAQSchema, generateProductSchema } from '@/lib/seo'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zambaara.com'

export const metadata: Metadata = {
  title: 'Home - Master the Elements, Become the Zampion',
  description: 'Welcome to Zambaara - The ultimate elemental card game. Master Lava, Rain, Wind, Mountain and special power cards. Strategic gameplay for 2-8 players. Pre-book now starting at ₹799!',
  keywords: [
    'Zambaara home',
    'elemental card game',
    'buy card game online',
    'strategy card game India',
    'multiplayer card game',
    'family game night',
    'Zampion',
    'pre-book game',
  ],
  openGraph: {
    title: 'Zambaara - Master the Elements, Become the Zampion',
    description: 'The ultimate elemental card game. Strategic gameplay for 2-8 players. Pre-book now!',
    url: SITE_URL,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Zambaara - Elemental Card Game',
      },
    ],
  },
  alternates: {
    canonical: SITE_URL,
  },
}

// FAQ data for structured data
const faqs = [
  {
    question: 'What is Zambaara?',
    answer: 'Zambaara is an exciting elemental card game where players master the elements - Lava, Rain, Wind, and Mountain - to become the ultimate Zampion. It features strategic gameplay with special power cards like Meteor, Lightning, Freeze, and Reverse.',
  },
  {
    question: 'How many players can play Zambaara?',
    answer: 'Zambaara supports 2 to 8 players. We offer two packs: a 2-4 player pack for ₹799 and a 5-8 player pack for ₹899.',
  },
  {
    question: 'How do I learn to play Zambaara?',
    answer: 'You can learn to play Zambaara by watching our video tutorial or reading the PDF rulebook on our How to Play page. The game is easy to learn but offers deep strategic gameplay.',
  },
  {
    question: 'Where can I buy Zambaara?',
    answer: 'Zambaara is currently available for pre-booking on our website. Fill out the pre-booking form and we will contact you when the game is ready to ship.',
  },
  {
    question: 'What are the special cards in Zambaara?',
    answer: 'Zambaara features 8 unique cards: Lava, Rain, Wind, Mountain (elemental cards), and Meteor, Lightning, Freeze, Reverse (special power cards). Each card has unique abilities that can turn the tide of battle.',
  },
]

// Product data for structured data
const products = [
  {
    name: 'Zambaara 2-4 Players Pack',
    description: 'Perfect for intimate gaming sessions. Experience the thrill of elemental mastery with a smaller group of players.',
    price: 799,
    image: '/og-image.jpg',
  },
  {
    name: 'Zambaara 5-8 Players Pack',
    description: 'Ideal for larger gatherings. Battle with more players and unlock the full potential of the Zambaara experience.',
    price: 899,
    image: '/og-image.jpg',
  },
]

export default function Home() {
  const faqSchema = generateFAQSchema(faqs)
  const productSchemas = products.map(generateProductSchema)

  return (
    <>
      {/* Structured Data for FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Structured Data for Products */}
      {productSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      
      <main className="min-h-screen">
        <section id="hero" aria-label="Hero Section">
          <Hero />
        </section>
        <section id="cards" aria-label="Game Cards">
          <CardSlider />
        </section>
        <section id="battle-pack" aria-label="Battle Pack">
          <BattlePackSection />
        </section>
        <section id="cave" aria-label="Pricing and Pre-booking">
          <CaveSection />
        </section>
        <section aria-label="Testimonials">
          <ImageSlider />
        </section>
        <section aria-label="Gallery">
          <Gallery />
        </section>
        <section aria-label="Newsletter Signup">
          <Newsletter />
        </section>
        <section aria-label="Rankings">
          <RankingsSlider />
        </section>
        <section id="contact" aria-label="Contact Form">
          <ContactForm />
        </section>
      </main>
    </>
  )
}
