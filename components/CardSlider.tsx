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
  const revealContainerRef = useRef<HTMLDivElement>(null)
  const cardRevealRefs = useRef<(HTMLDivElement | null)[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const revealContextRef = useRef<gsap.Context | null>(null)
  const shuffleSoundRef = useRef<HTMLAudioElement | null>(null)

  const cards: CardData[] = [
    { src: '/Cards Png/Lava.png', name: 'Lava', description: 'Pure force in motion. Lava advances without hesitation, reshaping the arena through pressure and heat.' },
    { src: '/Cards Png/Rain.png', name: 'Rain', description: 'Measured and deliberate. Rain cools excess, restoring control where chaos once ruled.' },
    { src: '/Cards Png/Wind.png', name: 'Wind', description: 'Swift and unseen. Wind alters the course of battle, carrying power where it is least expected.' },
    { src: '/Cards Png/Mountain.png', name: 'Mountain', description: 'Enduring and immovable. Mountain holds the ground, absorbing impact and standing against the flow.' },
    { src: '/Cards Png/METEOR.png', name: 'Meteor', description: 'An intrusion from beyond the Cycle. Meteor overwhelms the arena, answerable only to a force equally absolute.' },
    { src: '/Cards Png/Reverse.png', name: 'Reverse', description: 'A command over direction itself. Reverse turns the arena around, dissolving momentum and resetting order.' },
    { src: '/Cards Png/FREEZE.png', name: 'Freeze', description: 'A pause imposed upon time. Freeze halts a Seeker\'s advance, forcing stillness and reflection.' },
    { src: '/Cards Png/Lightning.png', name: 'Lightning', description: 'Instant and indiscriminate. Lightning fractures the moment, striking all others in a single flash.' },
  ]

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50
  const autoPlayInterval = 3000 // 3 seconds

  const handleReveal = () => {
    if (isAnimating) return
    setIsAnimating(true)

    // Play shuffle sound
    if (shuffleSoundRef.current) {
      shuffleSoundRef.current.currentTime = 0 // Reset to start
      shuffleSoundRef.current.play().catch((error) => {
        console.warn('Failed to play shuffle sound:', error)
      })
    }

    // Clean up any existing context
    if (revealContextRef.current) {
      revealContextRef.current.revert()
    }

    if (!backCardRef.current || !revealContainerRef.current) return

    const ctx = gsap.context(() => {
      const masterTl = createTimeline()

      // Step 1: Hide back card immediately (no animation)
      if (backCardRef.current) {
        masterTl.set(backCardRef.current, {
          opacity: 0,
          visibility: 'hidden',
        }, 0)
      }

      // Step 2: Cards appear from behind the back card (train animation)
      const cardElements = cardRevealRefs.current.filter(Boolean) as HTMLDivElement[]
      if (cardElements.length === 0) return

      // Find Meteor card index to center the animation on it (for continuity)
      const meteorIndex = cards.findIndex((card) => card.src.includes('METEOR'))
      const centerIndex = meteorIndex >= 0 ? meteorIndex : Math.floor(cards.length / 2)
      const initialSliderIndex = meteorIndex >= 0 ? meteorIndex : Math.floor(cards.length / 2)

      const cardWidth = 300
      const initialZ = -400 // Start behind the back card
      const containerWidth = revealContainerRef.current?.offsetWidth || window.innerWidth

      // Position all cards initially at center (stacked)
      cardElements.forEach((card, index) => {
        gsap.set(card, {
          left: '50%',
          top: '50%',
          x: -cardWidth / 2, // Center horizontally
          y: -219, // Half card height (center vertically)
          opacity: 0,
          scale: 1, // Start at normal size, hidden
          rotationY: 0,
          visibility: 'hidden', // Ensure completely hidden
        })
      })

      // Step 2: Reveal only Reverse, Lightning, Meteor, and Freeze sequentially
      // Start revealing immediately after back card is hidden
      const revealStartTime = 0.1 // Small delay to ensure back card is hidden
      
      // Find indices for Reverse, Lightning, Meteor, and Freeze
      const cardsToReveal = [
        cards.findIndex((card) => card.name === 'Reverse'),
        cards.findIndex((card) => card.name === 'Lightning'),
        cards.findIndex((card) => card.name === 'Meteor'),
        cards.findIndex((card) => card.name === 'Freeze'),
      ].filter(index => index >= 0) // Filter out any not found
      
      // Reveal only the specified cards one by one with the same duration and stagger
      cardsToReveal.forEach((cardIndex, revealIndex) => {
        const card = cardElements[cardIndex]
        if (card) {
          masterTl.to(
            card,
            {
              scale: 1,
              opacity: 1,
              visibility: 'visible',
              duration: 1, // Same duration for all cards
              ease: 'power2.out',
            },
            revealStartTime + (revealIndex * 0.3) // Same stagger between each card
          )
        }
      })
      
      // Show all other cards at once (but they won't be visible until spread)
      cardElements.forEach((card, index) => {
        if (!cardsToReveal.includes(index)) {
          masterTl.set(card, {
            opacity: 1,
            visibility: 'visible',
            scale: 1,
          }, revealStartTime + (cardsToReveal.length * 0.3) + 1.0) // After revealed cards finish
        }
      })

      // Step 3: Cards spread out slowly to form slider layout (ending on Meteor)
      const gap = 20
      const totalCardWidth = cardWidth + gap
      // Cards start spreading after the revealed cards finish
      const revealEndTime = revealStartTime + ((cardsToReveal.length - 1) * 0.3) + 1.0 // When last revealed card finishes
      const startTime = revealEndTime + 0.3 // Small pause before spreading

      cardElements.forEach((card, index) => {
        const distanceFromCenter = index - centerIndex
        const finalX = distanceFromCenter * totalCardWidth - cardWidth / 2

        // Meteor card (centerIndex) should be the last to settle into position
        const isMeteor = index === centerIndex
        const delayOffset = isMeteor ? 0.2 : 0 // Meteor settles last

        masterTl.to(
          card,
          {
            x: finalX,
            duration: 1.5,
            ease: 'power2.inOut',
          },
          startTime + index * 0.08 + delayOffset // Meteor ends last for focus
        )
      })

      // Step 4: Fade out reveal container and show slider
      const finalTime = startTime + cardElements.length * 0.1 + 1.5 // Updated for slower timing

      masterTl.to(
        revealContainerRef.current,
        {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.in',
          onComplete: () => {
            if (revealContextRef.current) {
              revealContextRef.current.revert()
              revealContextRef.current = null
            }
            // Set currentIndex to Meteor immediately
            setCurrentIndex(initialSliderIndex)
            setIsInitialMount(true)
            
            // Calculate translateX for Meteor position before revealing slider
            if (sliderRef.current) {
              const sliderWidth = sliderRef.current.offsetWidth
              const slideWidth = sliderWidth * 0.75
              const gap = sliderWidth * 0.05
              const totalSlideWidth = slideWidth + gap
              const meteorTranslateX = (sliderWidth / 2) - (slideWidth / 2) - (initialSliderIndex * totalSlideWidth)
              setTranslateX(meteorTranslateX)
            }
            
            // Use a small delay to ensure state is updated, then reveal slider with fade-in
            setTimeout(() => {
              setIsRevealed(true)
              setIsPaused(false)
              setIsAnimating(false)
              // Disable initial mount after slider is revealed so transitions work for future interactions
              requestAnimationFrame(() => {
                setIsInitialMount(false)
              })
            }, 50)
          },
        },
        finalTime
      )
    }, revealContainerRef)

    revealContextRef.current = ctx
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
    // Card click no longer opens details
  }

  const handleDetailsClick = (index: number) => {
    if (!isRevealed) return
    setSelectedCardIndex(index)
    setShowDetail(true)
    setIsPaused(true)
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
    setSelectedCardIndex(null)
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
  const [isInitialMount, setIsInitialMount] = useState(true)

  // Calculate translateX for slider positioning
  useEffect(() => {
    if (!isRevealed || !sliderRef.current || !containerRef.current) {
      setTranslateX(0)
      return
    }
    
    const sliderWidth = sliderRef.current.offsetWidth
    const slideWidth = sliderWidth * 0.75 // 75% width for each card
    const gap = sliderWidth * 0.05 // 5% gap between cards
    const totalSlideWidth = slideWidth + gap
    
    // On initial mount (after reveal), set translateX immediately without transition
    if (isInitialMount) {
      const newTranslateX = (sliderWidth / 2) - (slideWidth / 2) - (currentIndex * totalSlideWidth)
      setTranslateX(newTranslateX)
      // Re-enable transitions after a frame
      requestAnimationFrame(() => {
        setIsInitialMount(false)
      })
      return
    }
    
    // Center the current slide
    const newTranslateX = (sliderWidth / 2) - (slideWidth / 2) - (currentIndex * totalSlideWidth)
    setTranslateX(newTranslateX)
  }, [currentIndex, isRevealed, isInitialMount])

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

  // Animate slider entrance after reveal
  useEffect(() => {
    if (!isRevealed || !sliderRef.current) return

    const ctx = gsap.context(() => {
      // Reveal slider with smooth fade-in animation for continuity
      if (sliderRef.current) {
        gsap.fromTo(
          sliderRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1.0,
            ease: 'power2.out',
          }
        )
      }
    })

    return () => {
      ctx.revert()
    }
  }, [isRevealed])

  // Cleanup animation context on unmount
  useEffect(() => {
    return () => {
      if (revealContextRef.current) {
        revealContextRef.current.revert()
        revealContextRef.current = null
      }
    }
  }, [])

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
      className={`relative w-full bg-black py-16 md:py-24 ${!isRevealed ? 'overflow-visible' : 'overflow-hidden'}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Hidden audio element for shuffle sound */}
      <audio
        ref={shuffleSoundRef}
        src="/shuffle.mp3"
        preload="auto"
      />
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

        {/* Back Card and Reveal Animation Container */}
        {!isRevealed && (
          <div 
            ref={revealContainerRef}
            className="relative w-full min-h-[500px] flex justify-center items-center overflow-visible"
            style={{ perspective: '2000px', perspectiveOrigin: 'center center' }}
          >
            {/* Back Card - Shown initially */}
            <div
              ref={backCardRef}
              className="relative cursor-pointer transition-transform duration-300 hover:scale-105 z-50"
              onClick={handleReveal}
              style={{
                width: '300px',
                height: '438px',
                transformStyle: 'preserve-3d',
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
                  transformStyle: 'preserve-3d',
                }}
                priority
              />
            </div>
            
            {/* Click hint - Positioned below the back card */}
            <div className="absolute top-full mt-4 w-full flex flex-col items-center pointer-events-none">
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

            {/* Reveal Cards - Hidden initially, appear from behind back card */}
            <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
              {cards.map((card, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    cardRevealRefs.current[index] = el
                  }}
                  className="absolute"
                  style={{
                    width: '300px',
                    height: '438px',
                    opacity: 0,
                    visibility: 'hidden',
                    transformStyle: 'preserve-3d',
                    willChange: 'transform, opacity',
                  }}
                >
                  <Image
                    src={card.src}
                    alt={card.name}
                    width={300}
                    height={438}
                    className="w-full h-full object-contain"
                    style={{
                      filter: 'drop-shadow(0 10px 30px rgba(212, 175, 55, 0.5))',
                      transformStyle: 'preserve-3d',
                    }}
                  />
                </div>
              ))}
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
              className="flex h-full items-center transition-transform ease-in-out"
              style={{ 
                width: 'max-content',
                transform: `translateX(${translateX}px)`,
                transitionDuration: isInitialMount ? '0ms' : '300ms',
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {cards.map((card, index) => {
                const isActive = index === currentIndex
                return (
                  <div
                    key={index}
                    className="relative flex-shrink-0"
                    style={{ 
                      width: '300px',
                      height: '438px', // Maintain aspect ratio
                    }}
                  >
                    <div>
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
                    </div>
                    {/* Details button - Positioned below the card, separate from card */}
                    {isActive && (
                      <div className="absolute top-full mt-4 w-full flex flex-col items-center z-10">
                        <div className="w-24 border-t border-[#D4AF37] mb-4" style={{ opacity: 0.6 }}></div>
                        <button
                          onClick={() => handleDetailsClick(index)}
                          className="px-4 py-2 rounded-lg border-2 border-[#D4AF37] cursor-pointer transition-all duration-300 hover:scale-105"
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(4px)',
                            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4), inset 0 0 10px rgba(212, 175, 55, 0.1)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.2)'
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.6), inset 0 0 15px rgba(212, 175, 55, 0.2)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.4), inset 0 0 10px rgba(212, 175, 55, 0.1)'
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
                        </button>
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
