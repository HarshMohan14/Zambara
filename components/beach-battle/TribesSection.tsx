'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap, createTimeline } from '@/lib/gsap'
import Image from 'next/image'

interface TribeData {
  name: string
  icon: string
  title: string
  color: string
  glowColor: string
  bgGradient: string
  borderColor: string
  description: string
  element: string
  cardImage: string
  particleColor: string
}

const tribes: TribeData[] = [
  {
    name: 'Lava',
    icon: '\uD83D\uDD25',
    title: 'Bearer of the Flame',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    bgGradient: 'linear-gradient(145deg, rgba(127, 29, 29, 0.7) 0%, rgba(239, 68, 68, 0.15) 40%, rgba(0,0,0,0.95) 100%)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    description: 'From the depths of volcanic fury, the Lava tribe channels raw destructive force. Their fire consumes all that stands before them.',
    element: 'fire',
    cardImage: '/Cards Png/Lava.png',
    particleColor: '#ef4444',
  },
  {
    name: 'Rain',
    icon: '\uD83C\uDF27\uFE0F',
    title: 'Child of the Storm',
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.6)',
    bgGradient: 'linear-gradient(145deg, rgba(30, 58, 138, 0.7) 0%, rgba(59, 130, 246, 0.15) 40%, rgba(0,0,0,0.95) 100%)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
    description: 'Born from the tempest above the ocean, Rain warriors command the downpour. They douse flames and erode mountains.',
    element: 'water',
    cardImage: '/Cards Png/Rain.png',
    particleColor: '#3b82f6',
  },
  {
    name: 'Wind',
    icon: '\uD83C\uDF2C\uFE0F',
    title: 'Walker of the Sky',
    color: '#f0f0f0',
    glowColor: 'rgba(240, 240, 240, 0.45)',
    bgGradient: 'linear-gradient(145deg, rgba(160, 160, 160, 0.25) 0%, rgba(240, 240, 240, 0.08) 40%, rgba(0,0,0,0.95) 100%)',
    borderColor: 'rgba(240, 240, 240, 0.3)',
    description: 'Unseen and untouchable, the Wind tribe bends the battlefield itself. Their gusts redirect fate and scatter strategy.',
    element: 'air',
    cardImage: '/Cards Png/Wind.png',
    particleColor: '#e0e0e0',
  },
  {
    name: 'Mountain',
    icon: '\uD83C\uDFD4\uFE0F',
    title: 'Keeper of Stone',
    color: '#1a1a1a',
    glowColor: 'rgba(60, 60, 60, 0.6)',
    bgGradient: 'linear-gradient(145deg, rgba(20, 20, 20, 0.9) 0%, rgba(50, 50, 50, 0.15) 40%, rgba(0,0,0,0.95) 100%)',
    borderColor: 'rgba(80, 80, 80, 0.4)',
    description: 'Immovable and ancient, the Mountain tribe endures all. They are the shield against chaos, the wall that never breaks.',
    element: 'earth',
    cardImage: '/Cards Png/Mountain.png',
    particleColor: '#555555',
  },
]

export function TribesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const backCardRef = useRef<HTMLDivElement>(null)
  const revealContainerRef = useRef<HTMLDivElement>(null)
  const cardRevealRefs = useRef<(HTMLDivElement | null)[]>([])
  const [phase, setPhase] = useState<'back' | 'revealing' | 'slider'>('back')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const revealContextRef = useRef<gsap.Context | null>(null)

  // Scroll trigger for section entrance
  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 40, filter: 'blur(6px)' },
          {
            opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: titleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      }
      if (backCardRef.current && phase === 'back') {
        gsap.fromTo(backCardRef.current,
          { opacity: 0, scale: 0.2, rotationY: -45, y: 120 },
          {
            opacity: 1, scale: 1, rotationY: 0, y: 0,
            duration: 1.4, ease: 'elastic.out(1, 0.5)',
            scrollTrigger: { trigger: backCardRef.current, start: 'top 85%', toggleActions: 'play none none none' },
          }
        )
      }
    }, sectionRef)
    return () => { ctx.revert() }
  }, [phase])

  const handleReveal = useCallback(() => {
    if (phase !== 'back') return
    setPhase('revealing')

    if (revealContextRef.current) revealContextRef.current.revert()
    if (!backCardRef.current || !revealContainerRef.current) return

    const ctx = gsap.context(() => {
      const tl = createTimeline()
      const cardEls = cardRevealRefs.current.filter(Boolean) as HTMLDivElement[]
      if (cardEls.length === 0) return

      // Step 1: Flip & hide back card
      if (backCardRef.current) {
        tl.to(backCardRef.current, {
          rotationY: 90, opacity: 0, scale: 0.7,
          duration: 0.5, ease: 'power3.in',
          onComplete: () => {
            if (backCardRef.current) {
              gsap.set(backCardRef.current, { visibility: 'hidden', pointerEvents: 'none' })
            }
          },
        }, 0)
      }

      // Step 2: Set cards to center, hidden
      cardEls.forEach((card) => {
        gsap.set(card, {
          opacity: 0, scale: 0.5, rotationY: -120,
          visibility: 'hidden', y: 0,
        })
      })

      // Step 3: Reveal each tribe card one by one with dramatic flip + color explosion
      tribes.forEach((tribe, i) => {
        const card = cardEls[i]
        if (!card) return
        const startAt = 0.5 + i * 0.3

        tl.to(card, {
          visibility: 'visible', opacity: 1, scale: 1, rotationY: 0,
          duration: 0.7, ease: 'back.out(1.6)',
        }, startAt)

        // Color burst glow
        tl.fromTo(card,
          { boxShadow: `0 0 0px ${tribe.glowColor}` },
          {
            boxShadow: `0 0 80px ${tribe.glowColor}, 0 0 150px ${tribe.glowColor}`,
            duration: 0.35, ease: 'power2.out',
          }, startAt + 0.2
        )
        tl.to(card, {
          boxShadow: `0 0 25px ${tribe.glowColor.replace('0.6', '0.15')}`,
          duration: 0.5, ease: 'power2.out',
        }, startAt + 0.55)
      })

      // Step 4: After all cards revealed, transition to slider
      const revealEnd = 0.5 + tribes.length * 0.3 + 0.7
      tl.call(() => {
        setPhase('slider')
        setCurrentIndex(0)
        setExpandedCard(null)
      }, [], revealEnd + 0.4)

    }, revealContainerRef)
    revealContextRef.current = ctx
  }, [phase])

  // Touch handlers for mobile swipe on slider
  const handleTouchStart = (e: React.TouchEvent) => {
    if (phase !== 'slider') return
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (phase !== 'slider') return
    setTouchEnd(e.targetTouches[0].clientX)
  }
  const handleTouchEnd = () => {
    if (phase !== 'slider' || !touchStart || !touchEnd) return
    const dist = touchStart - touchEnd
    if (Math.abs(dist) > 50) {
      if (dist > 0) setCurrentIndex(p => Math.min(p + 1, tribes.length - 1))
      else setCurrentIndex(p => Math.max(p - 1, 0))
    }
    setExpandedCard(null)
  }

  const handleCardTap = (index: number) => {
    if (phase !== 'slider') return
    if (currentIndex !== index) {
      setCurrentIndex(index)
      setExpandedCard(null)
    } else {
      setExpandedCard(expandedCard === index ? null : index)
    }
  }

  // Get text colors that work for Mountain's black theme
  const getTextColor = (tribe: TribeData, variant: 'name' | 'title' | 'glow') => {
    if (tribe.name === 'Mountain') {
      if (variant === 'name') return '#c8c8c8'
      if (variant === 'title') return 'rgba(180, 180, 180, 0.7)'
      return 'rgba(150, 150, 150, 0.5)'
    }
    if (tribe.name === 'Wind') {
      if (variant === 'name') return '#e8e8e8'
      if (variant === 'title') return 'rgba(220, 220, 220, 0.7)'
      return 'rgba(240, 240, 240, 0.3)'
    }
    if (variant === 'name') return tribe.color
    if (variant === 'title') return `${tribe.color}bb`
    return tribe.glowColor
  }

  return (
    <section
      ref={sectionRef}
      id="tribes"
      aria-label="The Four Tribes"
      className="relative w-full py-14 sm:py-20 md:py-28 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #000 0%, #050a14 30%, #0a1222 50%, #050a14 70%, #000 100%)',
      }}
    >
      {/* Tribe-colored ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-60 h-60 sm:w-80 sm:h-80 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #ef4444, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/3 -right-20 w-60 h-60 sm:w-80 sm:h-80 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-60 h-60 sm:w-80 sm:h-80 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #e0e0e0, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 sm:w-80 sm:h-80 rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #555, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] mb-3"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6, 182, 212, 0.7)' }}>
            Choose Your Allegiance
          </p>
          <h2 ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase mb-3 opacity-0"
            style={{
              fontFamily: "'TheWalkyrDemo', serif", color: '#e2e8f0',
              textShadow: '0 0 40px rgba(6, 182, 212, 0.2), 2px 4px 8px rgba(0,0,0,0.6)',
            }}>
            The Four Tribes
          </h2>
          <p className="text-xs sm:text-sm text-white/35 max-w-xs sm:max-w-md mx-auto"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            {phase === 'back' ? 'Tap the card to unleash the elemental tribes' : 'Swipe to explore each tribe'}
          </p>
          <div className="flex justify-center mt-4">
            <div className="w-16 sm:w-20 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent)' }} />
          </div>
        </div>

        {/* Phase 1: Back Card (click to reveal) */}
        {phase !== 'slider' && (
          <div ref={revealContainerRef}
            className="relative w-full flex flex-col items-center justify-center"
            style={{ minHeight: '450px', perspective: '2000px' }}>

            {/* Back Card */}
            <div ref={backCardRef}
              className="relative cursor-pointer z-50"
              onClick={handleReveal}
              style={{
                width: '200px', height: '292px',
                transformStyle: 'preserve-3d',
                animation: phase === 'back' ? 'tribeFloat 2.5s ease-in-out infinite' : 'none',
              }}>
              {/* Use actual Back Card image */}
              <Image
                src="/Cards Png/Back Card.png"
                alt="Tap to reveal tribes"
                width={200}
                height={292}
                className="w-full h-full object-contain"
                style={{
                  filter: 'drop-shadow(0 10px 30px rgba(6, 182, 212, 0.15))',
                }}
                priority
              />
            </div>

            {/* Tap hint */}
            {phase === 'back' && (
              <div className="mt-6 sm:mt-8 flex flex-col items-center">
                <div className="w-20 sm:w-24 h-px mb-4" style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent)' }} />
                <div className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(0,0,0,0.7) 100%)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    animation: 'tribePulse 2.5s ease-in-out infinite',
                  }}>
                  <p className="text-xs sm:text-sm uppercase tracking-[0.2em]"
                    style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6, 182, 212, 0.8)', textShadow: '0 0 15px rgba(6, 182, 212, 0.3)' }}>
                    Tap to Reveal the Tribes
                  </p>
                </div>
                <div className="w-20 sm:w-24 h-px mt-4" style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent)' }} />
              </div>
            )}

            {/* Hidden tribe cards for reveal animation */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible"
              style={{ perspective: '1500px' }}>
              {tribes.map((tribe, index) => (
                <div key={tribe.name}
                  ref={(el) => { cardRevealRefs.current[index] = el }}
                  className="absolute rounded-2xl overflow-hidden"
                  style={{
                    width: '200px', height: '292px',
                    opacity: 0, visibility: 'hidden',
                    transformStyle: 'preserve-3d',
                    background: tribe.bgGradient,
                    border: `2px solid ${tribe.borderColor}`,
                  }}>
                  <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    <div className="text-5xl mb-2" style={{ filter: `drop-shadow(0 0 15px ${tribe.glowColor})` }}>{tribe.icon}</div>
                    <h3 className="text-xl uppercase font-bold mb-1"
                      style={{ fontFamily: "'TheWalkyrDemo', serif", color: getTextColor(tribe, 'name'), textShadow: `0 0 20px ${tribe.glowColor}` }}>
                      {tribe.name}
                    </h3>
                    <p className="text-[10px] uppercase tracking-[0.15em] italic"
                      style={{ fontFamily: "'BlinkerRegular', sans-serif", color: getTextColor(tribe, 'title') }}>
                      {tribe.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phase 2: Interactive Tribe Cards Slider */}
        {phase === 'slider' && (
          <div className="relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}>

            {/* Cards container */}
            <div className="relative overflow-hidden" style={{ minHeight: '520px' }}>
              <div className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(calc(-${currentIndex * 100}%))` }}>
                {tribes.map((tribe, index) => {
                  const isExpanded = expandedCard === index
                  const isCurrent = currentIndex === index
                  return (
                    <div key={tribe.name}
                      className="w-full flex-shrink-0 px-3 sm:px-4">
                      <div
                        className="relative mx-auto rounded-2xl overflow-hidden cursor-pointer transition-all duration-500"
                        onClick={() => handleCardTap(index)}
                        style={{
                          maxWidth: '340px',
                          background: tribe.bgGradient,
                          border: `2px solid ${isExpanded ? tribe.color : tribe.borderColor}`,
                          boxShadow: isExpanded
                            ? `0 0 60px ${tribe.glowColor}, 0 20px 60px rgba(0,0,0,0.5), inset 0 0 50px ${tribe.glowColor.replace('0.6', '0.06')}`
                            : isCurrent
                            ? `0 0 30px ${tribe.glowColor.replace('0.6', '0.2')}, 0 10px 40px rgba(0,0,0,0.4)`
                            : '0 4px 20px rgba(0,0,0,0.4)',
                          transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
                        }}>

                        {/* Card top section */}
                        <div className="relative p-5 sm:p-7 text-center">
                          {/* Ambient card glow */}
                          <div className="absolute inset-0 opacity-20 pointer-events-none"
                            style={{ background: `radial-gradient(ellipse at 50% 30%, ${tribe.glowColor}, transparent 70%)` }} />

                          {/* Card image preview */}
                          <div className="relative w-28 h-40 sm:w-32 sm:h-44 mx-auto mb-4 transition-all duration-500"
                            style={{
                              filter: isExpanded
                                ? `drop-shadow(0 0 20px ${tribe.glowColor})`
                                : `drop-shadow(0 0 8px ${tribe.glowColor.replace('0.6', '0.15')})`,
                              transform: isExpanded ? 'scale(1.1)' : 'scale(1)',
                            }}>
                            <Image
                              src={tribe.cardImage}
                              alt={`${tribe.name} card`}
                              fill
                              className="object-contain"
                              sizes="130px"
                            />
                          </div>

                          {/* Tribe name */}
                          <h3 className="text-2xl sm:text-3xl uppercase font-bold mb-1 relative z-10 transition-all duration-500"
                            style={{
                              fontFamily: "'TheWalkyrDemo', serif",
                              color: getTextColor(tribe, 'name'),
                              textShadow: isExpanded ? `0 0 30px ${getTextColor(tribe, 'glow')}` : '0 2px 8px rgba(0,0,0,0.6)',
                            }}>
                            {tribe.name}
                          </h3>

                          {/* Title */}
                          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] italic mb-3 relative z-10 transition-all duration-500"
                            style={{
                              fontFamily: "'BlinkerRegular', sans-serif",
                              color: getTextColor(tribe, 'title'),
                            }}>
                            {tribe.title}
                          </p>

                          {/* Element indicator dots */}
                          <div className="flex justify-center gap-1 mb-3">
                            {[0,1,2].map((dot) => (
                              <div key={dot} className="w-1 h-1 rounded-full transition-all duration-500"
                                style={{
                                  background: isExpanded
                                    ? (tribe.name === 'Mountain' ? '#888' : tribe.color)
                                    : 'rgba(255,255,255,0.15)',
                                  boxShadow: isExpanded ? `0 0 6px ${tribe.glowColor.replace('0.6', '0.4')}` : 'none',
                                }} />
                            ))}
                          </div>

                          {/* Description - expands on tap */}
                          <div className="overflow-hidden transition-all duration-500 relative z-10"
                            style={{ maxHeight: isExpanded ? '200px' : '0px', opacity: isExpanded ? 1 : 0 }}>
                            <div className="w-12 h-px mx-auto mb-3 transition-all duration-500"
                              style={{
                                background: `linear-gradient(90deg, transparent, ${tribe.name === 'Mountain' ? 'rgba(150,150,150,0.5)' : tribe.color}, transparent)`,
                              }} />
                            <p className="text-xs sm:text-sm leading-relaxed pb-2"
                              style={{
                                fontFamily: "'BlinkerRegular', sans-serif",
                                color: 'rgba(255,255,255,0.65)',
                              }}>
                              {tribe.description}
                            </p>
                          </div>

                          {/* Tap hint when not expanded */}
                          {!isExpanded && isCurrent && (
                            <p className="text-[9px] uppercase tracking-[0.15em] mt-1"
                              style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.2)', animation: 'tribePulse 2s ease-in-out infinite' }}>
                              Tap to learn more
                            </p>
                          )}
                        </div>

                        {/* Bottom glow bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-700"
                          style={{
                            background: isExpanded
                              ? `linear-gradient(90deg, transparent, ${tribe.name === 'Mountain' ? '#888' : tribe.color}, transparent)`
                              : 'transparent',
                            boxShadow: isExpanded ? `0 0 20px ${tribe.glowColor}` : 'none',
                          }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Navigation dots - tribe-colored */}
            <div className="flex justify-center gap-3 mt-5">
              {tribes.map((tribe, index) => (
                <button key={tribe.name}
                  onClick={() => { setCurrentIndex(index); setExpandedCard(null) }}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: currentIndex === index ? '28px' : '10px',
                    height: '10px',
                    background: currentIndex === index
                      ? (tribe.name === 'Mountain' ? '#888' : (tribe.name === 'Wind' ? '#ccc' : tribe.color))
                      : 'rgba(255,255,255,0.15)',
                    boxShadow: currentIndex === index ? `0 0 12px ${tribe.glowColor}` : 'none',
                  }}
                  aria-label={`Go to ${tribe.name} tribe`} />
              ))}
            </div>

            {/* Desktop arrow buttons */}
            <button onClick={() => { setCurrentIndex(p => Math.max(p - 1, 0)); setExpandedCard(null) }}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-black/60 border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition-all"
              disabled={currentIndex === 0} aria-label="Previous tribe">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => { setCurrentIndex(p => Math.min(p + 1, tribes.length - 1)); setExpandedCard(null) }}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-black/60 border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition-all"
              disabled={currentIndex === tribes.length - 1} aria-label="Next tribe">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>

            {/* Swipe hint mobile */}
            <p className="text-center mt-3 text-[10px] uppercase tracking-wider md:hidden"
              style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(6, 182, 212, 0.3)' }}>
              \u2190 Swipe to explore \u2192
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes tribeFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(0.5deg); }
        }
        @keyframes tribePulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </section>
  )
}
