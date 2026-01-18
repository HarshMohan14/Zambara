'use client'

import { useEffect, useRef } from 'react'
import { gsap, createTimeline, ScrollTrigger } from '@/lib/gsap'

export function Gallery() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)

  const images = [
    { src: '/p4.jpg', colSpan: 1, rowSpan: 2, aspect: 'portrait' }, // Large portrait - spans 2 rows (left column)
    { src: '/p8.jpeg', colSpan: 2, rowSpan: 1, aspect: 'landscape' }, // Large landscape - spans 2 cols (top right)
    { src: '/p5.jpg', colSpan: 1, rowSpan: 1, aspect: 'square' }, // Fills row 2, col 2
    { src: '/p6.jpg', colSpan: 1, rowSpan: 1, aspect: 'square' }, // Fills row 2, col 3
    { src: '/p7.jpeg', colSpan: 3, rowSpan: 1, aspect: 'landscape' }, // Fills entire row 3
  ]

  // Scroll-triggered animation for section entrance
  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      const tl = createTimeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      })

      // Animate title
      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
          }
        )
      }

      // Animate gallery items with stagger
      if (galleryRef.current) {
        const items = galleryRef.current.children
        tl.fromTo(
          Array.from(items),
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.15,
          },
          '-=0.4'
        )
      }
    }, sectionRef)

    return () => {
      ctx.revert()
    }
  }, [])

  const getAspectRatio = (aspect: string, rowSpan: number) => {
    // Calculate height based on row span to fill perfectly
    const baseHeight = 200
    return { minHeight: `${baseHeight * rowSpan}px` }
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black py-16 md:py-24 overflow-hidden"
    >
      <div className="w-full">
        {/* Section Title */}
        <h2
          ref={titleRef}
          className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase text-center mb-8 opacity-0"
          style={{
            fontFamily: "'TheWalkyrDemo', serif",
            color: '#D4AF37',
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.3)',
          }}
        >
          Gallery
        </h2>

        {/* Gallery Grid - No gaps, edge-to-edge - Same structure on mobile and desktop */}
        <div
          ref={galleryRef}
          className="grid grid-cols-3"
          style={{ gridAutoRows: 'minmax(200px, auto)' }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden cursor-pointer"
              style={{
                gridColumn: `span ${image.colSpan}`,
                gridRow: `span ${image.rowSpan}`,
                ...getAspectRatio(image.aspect, image.rowSpan),
              }}
            >
              <img
                src={image.src}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Gold border on hover */}
              <div className="absolute inset-0 border-4 border-transparent group-hover:border-[#D4AF37] transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
