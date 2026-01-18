# Zambara - Next.js Animated Web App

A highly animated and SEO-optimized Next.js web application built with TypeScript, GSAP (GreenSock Animation Platform), and Tailwind CSS.

## Features

- ⚡ **Next.js 14** with App Router
- 🎬 **GSAP** with Timeline for powerful animations
- 🎯 **SEO Optimized** with metadata, Open Graph, and structured data
- 🎨 **Tailwind CSS** for styling
- 📱 **Responsive Design**
- ⚙️ **TypeScript** for type safety

## Getting Started

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with SEO metadata
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Layout.tsx         # Main layout component
│   └── animations/        # Animation components
│       ├── AnimatedSection.tsx
│       ├── FadeInUp.tsx
│       ├── TimelineAnimation.tsx
│       └── StaggerChildren.tsx
├── hooks/                 # React hooks
│   ├── useGSAP.ts        # GSAP context hook
│   └── useScrollAnimation.ts
├── lib/                   # Utility functions
│   ├── gsap.ts           # GSAP utilities and helpers
│   └── seo.ts            # SEO helper functions
└── public/               # Static assets
```

## SEO Configuration

The app includes comprehensive SEO setup:

- Dynamic metadata generation
- Open Graph tags
- Twitter Card support
- Structured data (JSON-LD)
- Canonical URLs
- Robots configuration

Use the `generateSEOMetadata` function from `lib/seo.ts` for pages that need custom SEO:

```typescript
import { generateSEOMetadata } from '@/lib/seo'

export const metadata = generateSEOMetadata({
  title: 'Page Title',
  description: 'Page description',
  url: '/page-url',
})
```

## Animations

The project uses **GSAP (GreenSock Animation Platform)** with Timeline for powerful, performant animations. The animation system includes:

### Animation Components

- `AnimatedSection` - Scroll-triggered animated section wrapper
- `FadeInUp` - Fade in and slide up animation with ScrollTrigger
- `TimelineAnimation` - Flexible timeline-based animation wrapper
- `StaggerChildren` - Animate children with stagger effects

### GSAP Utilities

- `lib/gsap.ts` - GSAP setup, timeline helpers, and animation presets
- `hooks/useGSAP.ts` - React hook for GSAP context management
- `hooks/useScrollAnimation.ts` - Hook for scroll-triggered animations

### Example: Using Timeline

```typescript
import { createTimeline } from '@/lib/gsap'
import { gsap } from '@/lib/gsap'

// Create a timeline
const tl = createTimeline({ delay: 0.5 })

// Add animations to timeline
tl.fromTo(element, { opacity: 0 }, { opacity: 1, duration: 0.5 })
  .fromTo(anotherElement, { y: 50 }, { y: 0, duration: 0.6 }, '-=0.2') // Overlap animations
```

### Example: Stagger Children

```typescript
import { StaggerChildren } from '@/components/animations/StaggerChildren'

<StaggerChildren stagger={0.1} animation={{ x: 50, opacity: 0 }}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</StaggerChildren>
```

## Environment Variables

Create a `.env.local` file for environment-specific variables:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [GSAP Documentation](https://greensock.com/docs/)
- [GSAP ScrollTrigger Plugin](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

MIT# Zambara
