'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import Image from 'next/image'
import { gsap, createTimeline, ScrollTrigger } from '@/lib/gsap'

export function Gallery() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const images = useMemo(() => [
    // Row 1: Full width image
    { src: '/p7.jpeg', mdColSpan: 6, mdRowSpan: 1, title: 'The Gathering', direction: 'bottom' as const },
    // Row 2: Two equal width images
    { src: '/p5.jpg', mdColSpan: 3, mdRowSpan: 1, title: 'Champion Victory', direction: 'bottom' as const },
    { src: '/p6.jpg', mdColSpan: 3, mdRowSpan: 1, title: 'Strategic Play', direction: 'left' as const },
    // Row 3: Full width image
    { src: '/p8.jpeg', mdColSpan: 6, mdRowSpan: 1, title: 'Battle Arena', direction: 'right' as const },
    // Row 4: Two equal width images
    { src: '/p1.png', mdColSpan: 3, mdRowSpan: 1, title: 'Epic Showdown', direction: 'right' as const },
    { src: '/p2.png', mdColSpan: 3, mdRowSpan: 1, title: 'Mystical Powers', direction: 'left' as const },
    // Row 5: Full width image
    { src: '/p4.jpg', mdColSpan: 6, mdRowSpan: 1, title: 'Elemental Mastery', direction: 'left' as const },
    // Row 6: Two equal width images
    { src: '/p3.png', mdColSpan: 3, mdRowSpan: 1, title: 'Heroic Journey', direction: 'top' as const },
    { src: '/p5.jpg', mdColSpan: 3, mdRowSpan: 1, title: 'Battle Ready', direction: 'bottom' as const },
  ], [])

  // Scroll-triggered animation for section header
  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      const tl = createTimeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })

      // Animate badge
      if (badgeRef.current) {
        tl.fromTo(
          badgeRef.current,
          { opacity: 0, scale: 0.8, y: -20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: 'back.out(1.7)',
          }
        )
      }

      // Animate title
      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
          },
          '-=0.4'
        )
      }
    }, sectionRef)

    return () => {
      ctx.revert()
    }
  }, [])

  // Individual scroll-triggered animations for each gallery item
  useEffect(() => {
    if (!galleryRef.current) return

    const ctx = gsap.context(() => {
      const items = Array.from(galleryRef.current.children) as HTMLElement[]

      items.forEach((item, index) => {
        const imageData = images[index]
        if (!imageData) return

        // Determine animation direction - optimized with map
        const directionMap: Record<string, { x: number; y: number }> = {
          left: { x: -80, y: 0 },
          right: { x: 80, y: 0 },
          top: { x: 0, y: -80 },
          bottom: { x: 0, y: 80 },
        }
        const { x: fromX, y: fromY } = directionMap[imageData.direction] || { x: 0, y: 0 }

        // Set initial state
        gsap.set(item, {
          opacity: 0,
          x: fromX,
          y: fromY,
          scale: 0.85,
          filter: 'blur(12px)',
        })

        // Create scroll-triggered animation
        gsap.to(item, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            end: 'top 50%',
            toggleActions: 'play none none none',
          },
          delay: index * 0.1, // Stagger effect
        })

        // Parallax effect on scroll
        ScrollTrigger.create({
          trigger: item,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
          onUpdate: (self) => {
            const progress = self.progress
            const parallaxY = (progress - 0.5) * 30 // Subtle parallax
            gsap.set(item, {
              y: parallaxY,
            })
          },
        })
      })
    }, galleryRef)

    return () => {
      ctx.revert()
    }
  }, [images])


  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black py-12 md:py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(10, 5, 0, 0.98) 100%)',
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#d1a058] rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#d1a058] rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Trending Badge */}
        <div ref={badgeRef} className="flex justify-center mb-6 opacity-0">
          <div
            className="px-6 py-2 rounded-full border-2 border-[#d1a058] inline-block relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(209, 160, 88, 0.1) 0%, rgba(209, 160, 88, 0.05) 100%)',
              boxShadow: '0 0 20px rgba(209, 160, 88, 0.2), inset 0 0 10px rgba(209, 160, 88, 0.1)',
            }}
          >
            <span
              className="text-sm md:text-base uppercase tracking-widest relative z-10"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
                color: '#d1a058',
                letterSpacing: '3px',
              }}
            >
              ⚡ TRENDING GALLERY ⚡
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d1a058]/20 to-transparent animate-pulse"></div>
          </div>
        </div>

        {/* Section Title */}
        <h2
          ref={titleRef}
          className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-center mb-4 opacity-0"
          style={{
            fontFamily: "'TheWalkyrDemo', serif",
            color: '#d1a058',
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(209, 160, 88, 0.2)',
          }}
        >
          Gallery
        </h2>

        {/* Subtitle - Mobile Optimized */}
        <p
          className="text-center mb-10 md:mb-16 text-white/60"
          style={{
            fontFamily: "'BlinkerRegular', sans-serif",
            fontSize: '12px',
            letterSpacing: '1.5px',
          }}
        >
          WITNESS THE ELEMENTS IN ACTION
        </p>

        {/* Gallery Grid - Same Layout for Mobile and Desktop */}
        <div
          ref={galleryRef}
          className="grid grid-cols-6 gap-3 md:gap-6"
          style={{ 
            gridAutoRows: 'minmax(280px, auto)',
          }}
        >
          {images.map((image, index) => {
            // Use same colSpan for both mobile and desktop
            const colSpan = Math.min(Math.max(image.mdColSpan, 1), 6)
            const rowSpan = image.mdRowSpan
            const minHeight = 240 * image.mdRowSpan
            
            return (
            <div
              key={index}
              className="group relative overflow-hidden cursor-pointer rounded-lg"
              style={{
                gridColumn: `span ${colSpan}`,
                gridRow: `span ${rowSpan}`,
                minHeight: `${minHeight}px`,
                opacity: 0,
                willChange: 'transform, opacity',
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Image Container */}
              <div className="relative w-full h-full">
                <Image
                  src={image.src}
                  alt={image.title}
                  fill
                  className="object-cover transition-all duration-700"
                  style={{
                    transform: hoveredIndex === index ? 'scale(1.1)' : 'scale(1)',
                    filter: hoveredIndex === index 
                      ? 'brightness(1.15) contrast(1.1) saturate(1.1)' 
                      : 'brightness(0.9) contrast(1)',
                  }}
                  sizes={image.mdColSpan === 6 ? "(max-width: 768px) 100vw, 100vw" : "(max-width: 768px) 100vw, 50vw"}
                  priority={index < 2}
                  loading={index < 2 ? "eager" : "lazy"}
                />
              </div>

              {/* Gradient Overlay */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent transition-opacity duration-500"
                style={{
                  opacity: hoveredIndex === index ? 0.9 : 0.6,
                }}
              />

              {/* Animated Border Glow */}
              <div 
                className="absolute inset-0 rounded-lg border-2 transition-all duration-500"
                style={{
                  borderColor: hoveredIndex === index ? '#d1a058' : 'rgba(209, 160, 88, 0.2)',
                  boxShadow: hoveredIndex === index 
                    ? '0 0 40px rgba(209, 160, 88, 0.8), inset 0 0 40px rgba(209, 160, 88, 0.2)' 
                    : '0 0 20px rgba(209, 160, 88, 0.2)',
                }}
              />

              {/* Title Overlay - Mobile Optimized */}
              <div
                className="absolute bottom-0 left-0 right-0 p-4 md:p-7 transition-all duration-500"
                style={{
                  transform: hoveredIndex === index ? 'translateY(0)' : 'translateY(15px)',
                  opacity: hoveredIndex === index ? 1 : 0.85,
                }}
              >
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div 
                    className="w-1 h-6 md:h-8 bg-[#d1a058] transition-all duration-500"
                    style={{ 
                      boxShadow: '0 0 10px rgba(209, 160, 88, 0.5)',
                      transform: hoveredIndex === index ? 'scaleY(1.2)' : 'scaleY(1)',
                    }}
                  ></div>
                  <h3
                    className="text-lg md:text-2xl lg:text-3xl font-bold uppercase"
                    style={{
                      fontFamily: "'TheWalkyrDemo', serif",
                      color: '#d1a058',
                      textShadow: '2px 2px 8px rgba(0, 0, 0, 0.9), 0 0 20px rgba(209, 160, 88, 0.4)',
                      lineHeight: '1.2',
                    }}
                  >
                    {image.title}
                  </h3>
                </div>
                <div 
                  className="h-px bg-gradient-to-r from-[#d1a058] via-[#f4d03f] to-transparent transition-all duration-500"
                  style={{ 
                    width: hoveredIndex === index ? '100%' : '60px',
                    boxShadow: '0 0 5px rgba(209, 160, 88, 0.5)',
                  }}
                ></div>
              </div>

              {/* Shimmer Effect on Hover */}
              {hoveredIndex === index && (
                <div
                  className="absolute inset-0 pointer-events-none rounded-lg"
                  style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(209, 160, 88, 0.2) 50%, transparent 70%)',
                    backgroundSize: '200% 200%',
                    animation: 'shimmer 2s infinite',
                  }}
                />
              )}

              {/* Corner Accents */}
              <div 
                className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#d1a058] rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: '0 0 15px rgba(209, 160, 88, 0.5)' }}
              ></div>
              <div 
                className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#d1a058] rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: '0 0 15px rgba(209, 160, 88, 0.5)' }}
              ></div>
              <div 
                className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-[#d1a058] rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: '0 0 15px rgba(209, 160, 88, 0.5)' }}
              ></div>
              <div 
                className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#d1a058] rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: '0 0 15px rgba(209, 160, 88, 0.5)' }}
              ></div>

              {/* Trending Badge - Mobile Optimized */}
              <div
                className="absolute top-3 left-3 md:top-4 md:left-4 px-2 py-1 md:px-3 md:py-1 rounded-full bg-black/70 border border-[#d1a058] backdrop-blur-sm transition-all duration-500"
                style={{
                  opacity: hoveredIndex === index ? 1 : 0.7,
                  boxShadow: '0 0 15px rgba(209, 160, 88, 0.3)',
                  transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <span
                  className="text-[10px] md:text-xs uppercase tracking-wider"
                  style={{
                    fontFamily: "'BlinkerSemiBold', sans-serif",
                    color: '#d1a058',
                    letterSpacing: '0.5px',
                  }}
                >
                  TRENDING
                </span>
              </div>
            </div>
          )})}
        </div>

        {/* View More Button - Mobile Optimized */}
        <div className="flex justify-center mt-10 md:mt-16">
          <button
            className="px-8 py-3 md:px-14 md:py-5 font-semibold uppercase tracking-wide rounded-lg transition-all duration-300 relative overflow-hidden group text-sm md:text-base"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              background: 'linear-gradient(135deg, rgba(209, 160, 88, 0.2) 0%, rgba(209, 160, 88, 0.1) 100%)',
              color: '#d1a058',
              border: '2px solid #d1a058',
              boxShadow: '0 4px 15px rgba(209, 160, 88, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(209, 160, 88, 0.3) 0%, rgba(209, 160, 88, 0.2) 100%)'
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(209, 160, 88, 0.4)'
              e.currentTarget.style.borderColor = '#f4d03f'
              e.currentTarget.style.color = '#f4d03f'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)'
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(209, 160, 88, 0.2) 0%, rgba(209, 160, 88, 0.1) 100%)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(209, 160, 88, 0.2)'
              e.currentTarget.style.borderColor = '#d1a058'
              e.currentTarget.style.color = '#d1a058'
            }}
          >
            <span className="relative z-10">VIEW MORE GALLERY</span>
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d1a058]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                transform: 'translateX(-100%)',
                transition: 'transform 0.6s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(100%)'
              }}
            ></div>
          </button>
        </div>
      </div>

      {/* Shimmer Animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </section>
  )
}