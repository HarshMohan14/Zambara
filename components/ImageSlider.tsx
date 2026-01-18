'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap, createTimeline, ScrollTrigger } from '@/lib/gsap'

export function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLHeadingElement>(null)
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)

  const images = ['/p1.png', '/p2.png', '/p3.png']

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50
  const autoPlayInterval = 3000 // 3 seconds

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true)
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      // Resume auto-play after a delay if no swipe occurred
      setTimeout(() => setIsPaused(false), autoPlayInterval)
      return
    }

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }
    if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    // Resume auto-play after interaction
    setTimeout(() => setIsPaused(false), autoPlayInterval)
  }

  const goToSlide = (index: number) => {
    setIsPaused(true)
    setCurrentIndex(index)
    setTimeout(() => setIsPaused(false), autoPlayInterval)
  }

  const goToPrevious = () => {
    setIsPaused(true)
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setTimeout(() => setIsPaused(false), autoPlayInterval)
  }

  const goToNext = () => {
    setIsPaused(true)
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setTimeout(() => setIsPaused(false), autoPlayInterval)
  }

  // Animate slide transitions
  useEffect(() => {
    if (!containerRef.current || !sliderRef.current) return

    const ctx = gsap.context(() => {
      const container = containerRef.current
      const slider = sliderRef.current
      if (!container || !slider) return

      // Calculate dimensions based on slider width
      const sliderWidth = slider.offsetWidth
      const slideWidth = sliderWidth * 0.75 // 75% width for each image
      const gap = sliderWidth * 0.05 // 5% gap between images
      const totalSlideWidth = slideWidth + gap

      // Center the current slide: position it so currentIndex is in the center
      const translateX = (sliderWidth / 2) - (slideWidth / 2) - (currentIndex * totalSlideWidth)

      gsap.to(container, {
        x: translateX,
        duration: 0.5,
        ease: 'power2.out',
      })
    })

    return () => {
      ctx.revert()
    }
  }, [currentIndex])

  // Set initial slide widths and gap on mount and resize
  useEffect(() => {
    if (!containerRef.current || !sliderRef.current) return

    const slider = sliderRef.current
    const container = containerRef.current
    
    const updateLayout = () => {
      const sliderWidth = slider.offsetWidth
      const slideWidth = sliderWidth * 0.75
      const gap = sliderWidth * 0.05

      // Set gap on container
      container.style.gap = `${gap}px`

      // Set width for each slide element
      const slides = container.children
      Array.from(slides).forEach((slide) => {
        if (slide instanceof HTMLElement) {
          slide.style.width = `${slideWidth}px`
        }
      })
    }

    updateLayout()
    window.addEventListener('resize', updateLayout)

    return () => {
      window.removeEventListener('resize', updateLayout)
    }
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (isPaused) {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
        autoPlayTimerRef.current = null
      }
      return
    }

    autoPlayTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, autoPlayInterval)

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
        autoPlayTimerRef.current = null
      }
    }
  }, [isPaused, images.length, autoPlayInterval])

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

      // Animate header
      if (headerRef.current) {
        tl.fromTo(
          headerRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
          }
        )
      }

      // Animate slider container
      tl.fromTo(
        sectionRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
        },
        '-=0.5'
      )
    }, sectionRef)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black py-12 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        {/* Header Text */}
        <h2
          ref={headerRef}
          className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-center mb-8 opacity-0"
          style={{
            fontFamily: "'TheWalkyrDemo', serif",
            color: '#D4AF37',
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.3)',
          }}
        >
          Hear From the Zampions
        </h2>

        {/* Slider Container */}
        <div
          ref={sliderRef}
          className="relative w-full overflow-visible"
          style={{ aspectRatio: '9/16', minHeight: '60vh' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Images Container */}
          <div
            ref={containerRef}
            className="flex h-full items-center"
            style={{ 
              width: 'max-content',
            }}
          >
            {images.map((src, index) => {
              const isActive = index === currentIndex
              return (
                <div
                  key={index}
                  className="relative flex-shrink-0 h-full transition-transform duration-300"
                  style={{ 
                    transform: isActive ? 'scale(1)' : 'scale(0.9)',
                    opacity: isActive ? 1 : 0.7,
                  }}
                >
                  <Image
                    src={src}
                    alt={`Slide ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, 75vw"
                  />
                </div>
              )
            })}
          </div>

          {/* Navigation Arrows (Optional for mobile - can be hidden) */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 md:opacity-100"
            aria-label="Previous slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 md:opacity-100"
            aria-label="Next slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'bg-white w-8 h-2'
                  : 'bg-white/40 w-2 h-2 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
