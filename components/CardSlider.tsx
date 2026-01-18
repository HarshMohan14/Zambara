'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap, createTimeline, ScrollTrigger } from '@/lib/gsap'

interface CardData {
  src: string
  name: string
  description: string
}

export function CardSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const backCardRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)

  const cards: CardData[] = [
    { src: '/Cards Png/Wind.png', name: 'Wind', description: 'Harness the power of the air element. Control the winds and guide your strategy with the swiftness of the breeze.' },
    { src: '/Cards Png/Reverse.png', name: 'Reverse', description: 'Turn the tides of battle. Reverse the flow of elements and catch your opponents off guard.' },
    { src: '/Cards Png/Rain.png', name: 'Rain', description: 'Summon the cleansing waters from above. Rain brings renewal and washes away obstacles in your path.' },
    { src: '/Cards Png/Mountain.png', name: 'Mountain', description: 'Stand firm like the earth itself. The Mountain card provides unwavering defense and unshakeable resolve.' },
    { src: '/Cards Png/METEOR.png', name: 'Meteor', description: 'Call upon the fury of the cosmos. The Meteor card delivers devastating power from the heavens above.' },
    { src: '/Cards Png/Lightning.png', name: 'Lightning', description: 'Strike with the speed of lightning. Channel raw electrical energy for swift and decisive action.' },
    { src: '/Cards Png/Lava.png', name: 'Lava', description: 'Unleash the molten power of the earth\'s core. Lava flows with unstoppable force and destructive heat.' },
    { src: '/Cards Png/FREEZE.png', name: 'Freeze', description: 'Lock your enemies in ice. The Freeze card immobilizes targets with the absolute cold of winter.' },
  ]

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50
  const autoPlayInterval = 3000 // 3 seconds

  const handleReveal = () => {
    setIsRevealed(true)
    setIsPaused(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isRevealed) return
    setIsPaused(true)
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isRevealed) return
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!isRevealed || !touchStart || !touchEnd) {
      if (!isRevealed && touchStart && touchEnd) {
        setTimeout(() => setIsPaused(false), autoPlayInterval)
      }
      return
    }

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % cards.length)
    }
    if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
    }

    // Resume auto-play after interaction
    setTimeout(() => setIsPaused(false), autoPlayInterval)
  }

  const goToSlide = (index: number) => {
    if (!isRevealed) return
    setIsPaused(true)
    setCurrentIndex(index)
    setTimeout(() => setIsPaused(false), autoPlayInterval)
  }

  const handleCardClick = (index: number) => {
    if (!isRevealed) return
    setSelectedCardIndex(index)
    setShowDetail(true)
    setIsPaused(true)
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
    setSelectedCardIndex(null)
    setTimeout(() => setIsPaused(false), autoPlayInterval)
  }

  const goToPrevious = () => {
    if (!isRevealed) return
    setIsPaused(true)
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
    setTimeout(() => setIsPaused(false), autoPlayInterval)
  }

  const goToNext = () => {
    if (!isRevealed) return
    setIsPaused(true)
    setCurrentIndex((prev) => (prev + 1) % cards.length)
    setTimeout(() => setIsPaused(false), autoPlayInterval)
  }

  const [translateX, setTranslateX] = useState(0)

  // Calculate translateX for simple CSS transition
  useEffect(() => {
    if (!isRevealed || !sliderRef.current) {
      setTranslateX(0)
      return
    }
    
    const sliderWidth = sliderRef.current.offsetWidth
    const slideWidth = sliderWidth * 0.75 // 75% width for each card
    const gap = sliderWidth * 0.05 // 5% gap between cards
    const totalSlideWidth = slideWidth + gap
    
    // Center the current slide
    const newTranslateX = (sliderWidth / 2) - (slideWidth / 2) - (currentIndex * totalSlideWidth)
    setTranslateX(newTranslateX)
  }, [currentIndex, isRevealed])

  // Set initial slide widths and gap on mount and resize
  useEffect(() => {
    if (!isRevealed || !containerRef.current || !sliderRef.current) return

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
      
      // Update translateX position on resize
      const totalSlideWidth = slideWidth + gap
      const newTranslateX = (sliderWidth / 2) - (slideWidth / 2) - (currentIndex * totalSlideWidth)
      setTranslateX(newTranslateX)
    }

    updateLayout()
    window.addEventListener('resize', updateLayout)

    return () => {
      window.removeEventListener('resize', updateLayout)
    }
  }, [isRevealed, currentIndex])

  // Auto-play functionality
  useEffect(() => {
    if (!isRevealed || isPaused) {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
        autoPlayTimerRef.current = null
      }
      return
    }

    autoPlayTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length)
    }, autoPlayInterval)

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
        autoPlayTimerRef.current = null
      }
    }
  }, [isPaused, isRevealed, cards.length, autoPlayInterval])

  // Animate reveal
  useEffect(() => {
    if (!isRevealed || !backCardRef.current || !sliderRef.current) return

    const ctx = gsap.context(() => {
      // Flip and fade out back card
      if (backCardRef.current) {
        gsap.to(backCardRef.current, {
          rotationY: 90,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.in',
        })
      }

      // Reveal slider
      if (sliderRef.current) {
        gsap.fromTo(
          sliderRef.current,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: 'back.out(1.7)',
            delay: 0.3,
          }
        )
      }
    })

    return () => {
      ctx.revert()
    }
  }, [isRevealed])

  // Animate detail view
  useEffect(() => {
    if (!showDetail || !detailRef.current) return

    const ctx = gsap.context(() => {
      const detail = detailRef.current
      if (!detail) return

      gsap.fromTo(
        detail,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'back.out(1.7)',
        }
      )
    })

    return () => {
      ctx.revert()
    }
  }, [showDetail])

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

      // Animate back card entrance
      if (backCardRef.current && !isRevealed) {
        tl.fromTo(
          backCardRef.current,
          { opacity: 0, scale: 0.8, rotationY: -20 },
          {
            opacity: 1,
            scale: 1,
            rotationY: 0,
            duration: 1,
            ease: 'back.out(1.7)',
          }
        )
      }
    }, sectionRef)

    return () => {
      ctx.revert()
    }
  }, [isRevealed])

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black py-16 md:py-24 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-center mb-12"
          style={{
            fontFamily: "'TheWalkyrDemo', serif",
            color: '#D4AF37',
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.3)',
          }}
        >
          Game Cards
        </h2>

        {/* Back Card - Shown initially */}
        {!isRevealed && (
          <div className="flex justify-center items-center min-h-[500px]">
            <div
              ref={backCardRef}
              className="relative cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={handleReveal}
              style={{
                width: '300px',
                height: '438px', // Maintain aspect ratio (762:1114)
                perspective: '1000px',
              }}
            >
              <Image
                src="/Cards Png/Back Card.png"
                alt="Card Back"
                width={300}
                height={438}
                className="w-full h-full object-contain"
                style={{
                  filter: 'drop-shadow(0 10px 30px rgba(212, 175, 55, 0.3))',
                }}
                priority
              />
              {/* Click hint */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pointer-events-none pb-8">
                <div className="w-24 border-t border-[#D4AF37] mb-4" style={{ opacity: 0.6 }}></div>
                <p 
                  className="text-lg md:text-xl uppercase tracking-wider font-semibold"
                  style={{
                    fontFamily: "'TheWalkyrDemo', serif",
                    color: '#D4AF37',
                    textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 15px rgba(212, 175, 55, 0.4)',
                    letterSpacing: '2px',
                  }}
                >
                  CLICK TO REVEAL
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Card Slider - Shown after reveal */}
        {isRevealed && (
          <div
            ref={sliderRef}
            className="relative w-full overflow-visible"
            style={{ minHeight: '500px' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Cards Container */}
            <div
              ref={containerRef}
              className="flex h-full items-center transition-transform duration-300 ease-in-out"
              style={{ 
                width: 'max-content',
                transform: `translateX(${translateX}px)`,
              }}
            >
              {cards.map((card, index) => {
                const isActive = index === currentIndex
                return (
                  <div
                    key={index}
                    className="relative flex-shrink-0 cursor-pointer"
                    onClick={() => handleCardClick(index)}
                    style={{ 
                      width: '300px',
                      height: '438px', // Maintain aspect ratio
                    }}
                  >
                    <Image
                      src={card.src}
                      alt={card.name}
                      width={300}
                      height={438}
                      className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                      style={{
                        filter: isActive 
                          ? 'drop-shadow(0 10px 30px rgba(212, 175, 55, 0.5))' 
                          : 'drop-shadow(0 5px 15px rgba(0, 0, 0, 0.3))',
                      }}
                    />
                    {/* Click hint overlay */}
                    {isActive && (
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10">
                        <div 
                          className="px-4 py-2 rounded-lg border-2 border-[#D4AF37]"
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(4px)',
                            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4), inset 0 0 10px rgba(212, 175, 55, 0.1)',
                          }}
                        >
                          <p 
                            className="text-sm md:text-base uppercase tracking-wider font-semibold" 
                            style={{ 
                              color: '#D4AF37',
                              fontFamily: "'TheWalkyrDemo', serif",
                              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 15px rgba(255, 215, 0, 0.3)',
                              letterSpacing: '1px',
                            }}
                          >
                            CLICK FOR DETAILS
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 md:opacity-100"
              aria-label="Previous card"
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
              aria-label="Next card"
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
        )}

        {/* Dots Indicator - Only shown when revealed */}
        {isRevealed && (
          <div className="flex justify-center gap-2 mt-8">
            {cards.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'bg-white w-8 h-2'
                    : 'bg-white/40 w-2 h-2 hover:bg-white/60'
                }`}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Detail View */}
      {showDetail && selectedCardIndex !== null && (
        <div
          ref={detailRef}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={handleCloseDetail}
        >
          <div
            className="relative bg-black border-2 border-[#D4AF37] rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 0 40px rgba(212, 175, 55, 0.5), inset 0 0 20px rgba(212, 175, 55, 0.1)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseDetail}
              className="absolute top-4 right-4 transition-all duration-300 rounded-full z-50"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '2px solid #D4AF37',
                color: '#D4AF37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4), inset 0 0 10px rgba(212, 175, 55, 0.1)',
                zIndex: 60,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#D4AF37'
                e.currentTarget.style.color = '#000000'
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
                e.currentTarget.style.color = '#D4AF37'
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.4), inset 0 0 10px rgba(212, 175, 55, 0.1)'
              }}
              aria-label="Close detail view"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Card Image */}
              <div className="flex-shrink-0">
                <Image
                  src={cards[selectedCardIndex].src}
                  alt={cards[selectedCardIndex].name}
                  width={300}
                  height={438}
                  className="w-full max-w-[300px] h-auto object-contain"
                  style={{
                    filter: 'drop-shadow(0 15px 40px rgba(212, 175, 55, 0.6))',
                  }}
                />
              </div>

              {/* Card Details */}
              <div className="flex-1 text-center md:text-left">
                <h3
                  className="text-4xl md:text-5xl font-bold uppercase mb-6"
                  style={{
                    fontFamily: "'TheWalkyrDemo', serif",
                    color: '#D4AF37',
                    textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.3)',
                  }}
                >
                  {cards[selectedCardIndex].name}
                </h3>

                <div className="w-full md:w-32 border-t border-[#D4AF37] mb-6 mx-auto md:mx-0"></div>

                <p
                  className="text-lg md:text-xl text-white/90 leading-relaxed"
                  style={{
                    fontFamily: "'BalginLightExpanded', sans-serif",
                    textShadow: '1px 1px 4px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  {cards[selectedCardIndex].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
