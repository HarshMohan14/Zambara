'use client'

import { useEffect, useRef } from 'react'
import { createTimeline } from '@/lib/gsap'
import { Footer } from '@/components/Footer'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const layoutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!layoutRef.current) return

    // Create a timeline for the layout animation
    const tl = createTimeline()

    // Animate layout container
    tl.fromTo(
      layoutRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.out' }
    )

    return () => {
      tl.kill()
    }
  }, [])

  return (
    <div ref={layoutRef} className="min-h-screen relative z-10">
      <main className="relative z-10">{children}</main>
      <Footer />
    </div>
  )
}