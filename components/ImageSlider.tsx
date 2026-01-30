'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { gsap, createTimeline } from '@/lib/gsap'

interface Testimonial {
  id: number
  videoSrc: string
  thumbnail: string
  name: string
  title: string
}

export function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [activeVideo, setActiveVideo] = useState<Testimonial | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLHeadingElement>(null)
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const testimonials: Testimonial[] = [
    {
      id: 1,
      videoSrc: '/TESTIMONIAL_01.mp4',
      thumbnail: '/p1.png',
      name: 'Zampion Champion',
      title: 'Battle Master',
    },
    {
      id: 2,
      videoSrc: '/TESTIMONIAL_02.mp4',
      thumbnail: '/p2.png',
      name: 'Elite Player',
      title: 'Element Wielder',
    },
  ]

  const minSwipeDistance = 50
  const autoPlayInterval = 4000

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
      setTimeout(() => setIsPaused(false), autoPlayInterval)
      return
    }

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }
    if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }

    setTimeout(() => setIsPaused(false), autoPlayInterval)
  }

  const goToSlide = (index: number) => {
    setIsPaused(true)
    setCurrentIndex(index)
    setTimeout(() => setIsPaused(false), autoPlayInterval)
  }

  const goToPrevious = () => {
    setIsPaused(true)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setTimeout(() => setIsPaused(false), autoPlayInterval)
  }

  const goToNext = () => {
    setIsPaused(true)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    setTimeout(() => setIsPaused(false), autoPlayInterval)
  }

  const openVideo = (testimonial: Testimonial) => {
    setIsPaused(true)
    setActiveVideo(testimonial)
    document.body.style.overflow = 'hidden'
  }

  const closeVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setActiveVideo(null)
    document.body.style.overflow = ''
    setTimeout(() => setIsPaused(false), autoPlayInterval)
  }, [autoPlayInterval])

  // Handle escape key to close video
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeVideo) {
        closeVideo()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [activeVideo, closeVideo])

  // Animate slide transitions
  useEffect(() => {
    if (!containerRef.current || !sliderRef.current) return

    const ctx = gsap.context(() => {
      const container = containerRef.current
      const slider = sliderRef.current
      if (!container || !slider) return

      const sliderWidth = slider.offsetWidth
      const slideWidth = sliderWidth * 0.75
      const gap = sliderWidth * 0.05
      const totalSlideWidth = slideWidth + gap

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

      container.style.gap = `${gap}px`

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
    if (isPaused || activeVideo) {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
        autoPlayTimerRef.current = null
      }
      return
    }

    autoPlayTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, autoPlayInterval)

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
        autoPlayTimerRef.current = null
      }
    }
  }, [isPaused, activeVideo, testimonials.length])

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
    <>
      <section
        ref={sectionRef}
        className="relative w-full bg-black py-6 overflow-hidden"
      >
        <div className="container mx-auto px-4">
          {/* Header Text */}
          <h2
            ref={headerRef}
            className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-center mb-8 opacity-0"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#d1a058',
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(209, 160, 88, 0.2)',
            }}
          >
            Hear From the Zampions
          </h2>

          {/* Slider Container */}
          <div
            ref={sliderRef}
            className="relative w-full overflow-visible"
            style={{ height: '45vh', maxHeight: '500px' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Images Container */}
            <div
              ref={containerRef}
              className="flex h-full items-center"
              style={{ width: 'max-content' }}
            >
              {testimonials.map((testimonial, index) => {
                const isActive = index === currentIndex
                return (
                  <div
                    key={testimonial.id}
                    className="relative flex-shrink-0 h-full transition-transform duration-300 cursor-pointer group"
                    style={{ 
                      transform: isActive ? 'scale(1)' : 'scale(0.9)',
                      opacity: isActive ? 1 : 0.7,
                    }}
                    onClick={() => openVideo(testimonial)}
                  >
                    {/* Thumbnail Image */}
                    <Image
                      src={testimonial.thumbnail}
                      alt={`${testimonial.name} testimonial`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, 75vw"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300 rounded-lg" />
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{
                          background: 'linear-gradient(135deg, rgba(209, 160, 88, 0.9) 0%, rgba(209, 160, 88, 0.7) 100%)',
                          boxShadow: '0 0 30px rgba(209, 160, 88, 0.5), 0 0 60px rgba(209, 160, 88, 0.3)',
                        }}
                      >
                        <svg 
                          className="w-8 h-8 md:w-10 md:h-10 text-black ml-1" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>

                    {/* Name Badge */}
                    <div 
                      className="absolute bottom-4 left-4 right-4 p-3 rounded-lg backdrop-blur-sm"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 100%)',
                        border: '1px solid rgba(209, 160, 88, 0.3)',
                      }}
                    >
                      <p 
                        className="text-sm md:text-base font-semibold"
                        style={{ 
                          fontFamily: "'BlinkerSemiBold', sans-serif",
                          color: '#d1a058',
                        }}
                      >
                        {testimonial.name}
                      </p>
                      <p 
                        className="text-xs md:text-sm text-white/70"
                        style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
                      >
                        {testimonial.title}
                      </p>
                    </div>

                    {/* Border Glow on Hover */}
                    <div 
                      className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-[#d1a058] transition-all duration-300"
                      style={{
                        boxShadow: isActive ? '0 0 20px rgba(209, 160, 88, 0.3)' : 'none',
                      }}
                    />
                  </div>
                )
              })}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 md:opacity-100"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 md:opacity-100"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'bg-[#d1a058] w-8 h-2'
                    : 'bg-white/40 w-2 h-2 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {activeVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.95)' }}
          onClick={closeVideo}
        >
          {/* Close Button */}
          <button
            onClick={closeVideo}
            className="absolute top-4 right-4 z-50 p-2 rounded-full transition-all hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, rgba(209, 160, 88, 0.9) 0%, rgba(209, 160, 88, 0.7) 100%)',
            }}
            aria-label="Close video"
          >
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Video Container */}
          <div 
            className="relative w-full max-w-4xl aspect-video rounded-lg overflow-hidden"
            style={{
              boxShadow: '0 0 60px rgba(209, 160, 88, 0.3)',
              border: '2px solid rgba(209, 160, 88, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              src={activeVideo.videoSrc}
              className="w-full h-full object-contain bg-black"
              controls
              autoPlay
              playsInline
            />
          </div>

          {/* Video Info */}
          <div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p 
              className="text-lg md:text-xl font-semibold"
              style={{ 
                fontFamily: "'BlinkerSemiBold', sans-serif",
                color: '#d1a058',
              }}
            >
              {activeVideo.name}
            </p>
            <p 
              className="text-sm text-white/70"
              style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
            >
              {activeVideo.title}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
