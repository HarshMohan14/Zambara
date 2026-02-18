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
  sealIcon: string
  sealColor: string
}

const tribes: TribeData[] = [
  {
    name: 'Lava',
    icon: '🔥',
    title: 'Bearer of the Flame',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    bgGradient: 'linear-gradient(145deg, rgba(127, 29, 29, 0.85) 0%, rgba(239, 68, 68, 0.2) 40%, rgba(0,0,0,0.95) 100%)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
    description: 'From the depths of volcanic fury, the Lava tribe channels raw destructive force. Their fire consumes all that stands before them.',
    element: 'fire',
    cardImage: '/Cards Png/Lava.png',
    sealIcon: '🌋',
    sealColor: '#dc2626',
  },
  {
    name: 'Rain',
    icon: '🌧️',
    title: 'Child of the Storm',
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.6)',
    bgGradient: 'linear-gradient(145deg, rgba(30, 58, 138, 0.85) 0%, rgba(59, 130, 246, 0.2) 40%, rgba(0,0,0,0.95) 100%)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
    description: 'Born from the tempest above the ocean, Rain warriors command the downpour. They douse flames and erode mountains.',
    element: 'water',
    cardImage: '/Cards Png/Rain.png',
    sealIcon: '⚡',
    sealColor: '#2563eb',
  },
  {
    name: 'Wind',
    icon: '🌬️',
    title: 'Walker of the Sky',
    color: '#f0f0f0',
    glowColor: 'rgba(240, 240, 240, 0.45)',
    bgGradient: 'linear-gradient(145deg, rgba(160, 160, 160, 0.35) 0%, rgba(240, 240, 240, 0.1) 40%, rgba(0,0,0,0.95) 100%)',
    borderColor: 'rgba(240, 240, 240, 0.35)',
    description: 'Unseen and untouchable, the Wind tribe bends the battlefield itself. Their gusts redirect fate and scatter strategy.',
    element: 'air',
    cardImage: '/Cards Png/Wind.png',
    sealIcon: '🌀',
    sealColor: '#d4d4d4',
  },
  {
    name: 'Mountain',
    icon: '🏔️',
    title: 'Keeper of Stone',
    color: '#1a1a1a',
    glowColor: 'rgba(80, 80, 80, 0.6)',
    bgGradient: 'linear-gradient(145deg, rgba(20, 20, 20, 0.95) 0%, rgba(60, 60, 60, 0.2) 40%, rgba(0,0,0,0.95) 100%)',
    borderColor: 'rgba(100, 100, 100, 0.4)',
    description: 'Immovable and ancient, the Mountain tribe endures all. They are the shield against chaos, the wall that never breaks.',
    element: 'earth',
    cardImage: '/Cards Png/Mountain.png',
    sealIcon: '⛰️',
    sealColor: '#525252',
  },
]

export function TribesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const sealRefs = useRef<(HTMLDivElement | null)[]>([])
  const cardFaceRefs = useRef<(HTMLDivElement | null)[]>([])
  const particleRefs = useRef<(HTMLDivElement | null)[]>([])
  const [revealedCards, setRevealedCards] = useState<boolean[]>([false, false, false, false])
  const [allRevealed, setAllRevealed] = useState(false)
  const revealingRef = useRef<boolean[]>([false, false, false, false])

  // Scroll entrance animations
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

      // Stagger the sealed cards into view
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll('.tribe-card-wrapper')
        gsap.fromTo(cards,
          { opacity: 0, y: 50, scale: 0.85 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.8, stagger: 0.15, ease: 'back.out(1.3)',
            scrollTrigger: { trigger: gridRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
          }
        )
      }
    }, sectionRef)
    return () => { ctx.revert() }
  }, [])

  // Floating seal animation
  useEffect(() => {
    sealRefs.current.forEach((seal, i) => {
      if (!seal || revealedCards[i]) return
      gsap.to(seal, {
        y: -4, rotation: 2,
        duration: 2 + i * 0.3,
        repeat: -1, yoyo: true,
        ease: 'sine.inOut',
      })
    })
  }, [revealedCards])

  // Water-droplet wipe reveal animation for individual card
  const revealCard = useCallback((index: number) => {
    if (revealedCards[index] || revealingRef.current[index]) return
    revealingRef.current[index] = true

    const seal = sealRefs.current[index]
    const cardFace = cardFaceRefs.current[index]
    const particleContainer = particleRefs.current[index]
    const tribe = tribes[index]

    if (!seal || !cardFace || !particleContainer) return

    const tl = createTimeline({
      onComplete: () => {
        setRevealedCards(prev => {
          const next = [...prev]
          next[index] = true
          // Check if all revealed
          if (next.every(Boolean)) setAllRevealed(true)
          return next
        })
        revealingRef.current[index] = false
      }
    })

    // Step 1: Seal crack & vibrate
    tl.to(seal, {
      scale: 1.1, duration: 0.15, ease: 'power2.out',
    })
    tl.to(seal, {
      x: 3, duration: 0.04, repeat: 6, yoyo: true, ease: 'none',
    })

    // Step 2: Spawn water-droplet burst particles
    tl.call(() => {
      const count = 18
      for (let i = 0; i < count; i++) {
        const drop = document.createElement('div')
        const size = Math.random() * 8 + 3
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5
        const dist = Math.random() * 80 + 40
        drop.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size * 1.3}px;
          background: radial-gradient(ellipse at 35% 25%,
            ${tribe.color}cc,
            ${tribe.color}60,
            transparent 80%);
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 50;
          box-shadow: 0 0 ${size * 2}px ${tribe.glowColor};
        `
        particleContainer.appendChild(drop)

        gsap.to(drop, {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          opacity: 0,
          scale: 0.3,
          duration: 0.7 + Math.random() * 0.4,
          ease: 'power2.out',
          onComplete: () => drop.remove(),
        })
      }
    }, [], '-=0.15')

    // Step 3: Seal shatter & dissolve
    tl.to(seal, {
      scale: 1.8, opacity: 0, filter: 'blur(10px)',
      duration: 0.45, ease: 'power3.out',
    }, '-=0.5')

    // Step 4: Card face reveal - water-droplet wipe effect
    tl.fromTo(cardFace,
      {
        clipPath: 'circle(0% at 50% 50%)',
        opacity: 0,
        scale: 0.95,
      },
      {
        clipPath: 'circle(75% at 50% 50%)',
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: 'power3.out',
      },
      '-=0.3'
    )

    // Step 5: Color burst glow on the card
    tl.fromTo(cardFace,
      { boxShadow: `0 0 0px ${tribe.glowColor}` },
      {
        boxShadow: `0 0 60px ${tribe.glowColor}, 0 0 120px ${tribe.glowColor}`,
        duration: 0.3, ease: 'power2.out',
      },
      '-=0.4'
    )
    tl.to(cardFace, {
      boxShadow: `0 0 20px ${tribe.glowColor.replace('0.6', '0.15')}`,
      duration: 0.6, ease: 'power2.inOut',
    })

  }, [revealedCards])

  // Reveal all tribes at once
  const revealAll = useCallback(() => {
    tribes.forEach((_, i) => {
      setTimeout(() => revealCard(i), i * 250)
    })
  }, [revealCard])

  // Text color helpers for dark tribes
  const getTextColor = (tribe: TribeData, variant: 'name' | 'title' | 'desc') => {
    if (tribe.name === 'Mountain') {
      return variant === 'name' ? '#c8c8c8' : variant === 'title' ? 'rgba(180,180,180,0.7)' : 'rgba(200,200,200,0.55)'
    }
    if (tribe.name === 'Wind') {
      return variant === 'name' ? '#e8e8e8' : variant === 'title' ? 'rgba(220,220,220,0.7)' : 'rgba(230,230,230,0.55)'
    }
    return variant === 'name' ? tribe.color : variant === 'title' ? `${tribe.color}bb` : 'rgba(255,255,255,0.6)'
  }

  return (
    <section
      ref={sectionRef}
      id="tribes"
      aria-label="The Four Tribes"
      className="relative w-full py-14 sm:py-20 md:py-28 overflow-hidden"
    >
      {/* Subtle section overlay for depth separation — no opaque background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.45]"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.6) 100%)' }} />
        {/* Tribe-colored ambient glows */}
        <div className="absolute top-1/4 -left-20 w-52 h-52 sm:w-72 sm:h-72 rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #ef4444, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/4 -right-20 w-52 h-52 sm:w-72 sm:h-72 rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 -left-20 w-52 h-52 sm:w-72 sm:h-72 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #e0e0e0, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 -right-20 w-52 h-52 sm:w-72 sm:h-72 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #555, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <p className="text-sm sm:text-base uppercase tracking-[0.35em] mb-3"
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
          <p className="text-base sm:text-lg text-white/50 max-w-xs sm:max-w-md mx-auto"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            Each seal hides a tribe. Tap to break the seal and reveal your warriors.
          </p>
          <div className="flex justify-center mt-4">
            <div className="w-16 sm:w-20 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent)' }} />
          </div>
        </div>

        {/* 2x2 Grid of Sealed Cards */}
        <div ref={gridRef} className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 max-w-sm sm:max-w-lg md:max-w-2xl mx-auto mb-8 sm:mb-10">
          {tribes.map((tribe, index) => {
            const isRevealed = revealedCards[index]
            return (
              <div key={tribe.name}
                className="tribe-card-wrapper relative"
                style={{ perspective: '1200px', opacity: 0 }}>
                <div
                  className="relative w-full rounded-2xl overflow-hidden cursor-pointer group"
                  onClick={() => revealCard(index)}
                  style={{
                    aspectRatio: '3 / 4',
                    minHeight: '180px',
                    transformStyle: 'preserve-3d',
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={isRevealed ? `${tribe.name} tribe revealed` : `Tap to reveal ${tribe.name} tribe`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') revealCard(index) }}
                >
                  {/* Particle container for burst effect */}
                  <div ref={(el) => { particleRefs.current[index] = el }}
                    className="absolute inset-0 z-50 pointer-events-none overflow-visible" />

                  {/* SEALED STATE: Back card with wax seal */}
                  <div ref={(el) => { sealRefs.current[index] = el }}
                    className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-2xl transition-all duration-300"
                    style={{
                      background: 'linear-gradient(145deg, #0c1a2e 0%, #06101c 50%, #0a0a14 100%)',
                      border: `1.5px solid rgba(6, 182, 212, 0.12)`,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
                      opacity: isRevealed ? 0 : 1,
                      pointerEvents: isRevealed ? 'none' : 'auto',
                    }}>
                    {/* Decorative card back pattern */}
                    <div className="absolute inset-3 sm:inset-4 rounded-xl pointer-events-none"
                      style={{
                        border: '1px solid rgba(6, 182, 212, 0.06)',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2306b6d4' fill-opacity='0.03'%3E%3Cpath d='M20 0L0 20h40z'/%3E%3Cpath d='M20 40L0 20h40z'/%3E%3C/g%3E%3C/svg%3E")`,
                      }} />

                    {/* Wax seal */}
                    <div className="relative mb-2 sm:mb-3">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center relative"
                        style={{
                          background: `radial-gradient(circle at 40% 35%, ${tribe.sealColor}cc, ${tribe.sealColor}88, ${tribe.sealColor}44)`,
                          boxShadow: `0 4px 20px ${tribe.glowColor.replace('0.6', '0.3')}, inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.3)`,
                          border: `2px solid ${tribe.color}40`,
                        }}>
                        {/* Seal symbol */}
                        <span className="text-2xl sm:text-3xl"
                          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                          {tribe.sealIcon}
                        </span>
                        {/* Seal wax drip decorations */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                          style={{ background: `${tribe.sealColor}60` }} />
                      </div>
                    </div>

                    {/* Mystery label */}
                    <p className="text-xs sm:text-sm uppercase tracking-[0.25em] mb-1"
                      style={{
                        fontFamily: "'BlinkerSemiBold', sans-serif",
                        color: `${tribe.name === 'Mountain' ? 'rgba(150,150,150,0.5)' : tribe.color + '60'}`,
                      }}>
                      ✦ Sealed ✦
                    </p>

                    {/* Tap hint - pulses */}
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider mt-2"
                      style={{
                        fontFamily: "'BlinkerRegular', sans-serif",
                        color: 'rgba(6, 182, 212, 0.35)',
                        animation: 'tribePulse 2.5s ease-in-out infinite',
                      }}>
                      Tap to break seal
                    </p>

                    {/* Hover/active feedback */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${tribe.glowColor.replace('0.6', '0.06')}, transparent 60%)`,
                        border: `1.5px solid ${tribe.borderColor.replace('0.5', '0.15')}`,
                      }} />
                  </div>

                  {/* REVEALED STATE: Tribe card face */}
                  <div ref={(el) => { cardFaceRefs.current[index] = el }}
                    className="absolute inset-0 z-20 rounded-2xl flex flex-col items-center justify-center p-3 sm:p-5"
                    style={{
                      background: tribe.bgGradient,
                      border: `2px solid ${tribe.borderColor}`,
                      clipPath: isRevealed ? 'circle(75% at 50% 50%)' : 'circle(0% at 50% 50%)',
                      opacity: isRevealed ? 1 : 0,
                    }}>
                    {/* Ambient glow */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{ background: `radial-gradient(ellipse at 50% 30%, ${tribe.glowColor}, transparent 70%)` }} />

                    {/* Tribe card image */}
                    <div className="relative w-16 h-24 sm:w-24 sm:h-32 md:w-28 md:h-36 mb-2 sm:mb-3"
                      style={{
                        filter: `drop-shadow(0 0 12px ${tribe.glowColor})`,
                      }}>
                      <Image
                        src={tribe.cardImage}
                        alt={`${tribe.name} card`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 64px, 112px"
                        loading="lazy"
                      />
                    </div>

                    {/* Tribe name */}
                    <h3 className="text-lg sm:text-2xl md:text-3xl uppercase font-bold mb-0.5 relative z-10"
                      style={{
                        fontFamily: "'TheWalkyrDemo', serif",
                        color: getTextColor(tribe, 'name'),
                        textShadow: `0 0 20px ${tribe.glowColor}`,
                      }}>
                      {tribe.name}
                    </h3>

                    {/* Title */}
                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.15em] italic relative z-10"
                      style={{
                        fontFamily: "'BlinkerRegular', sans-serif",
                        color: getTextColor(tribe, 'title'),
                      }}>
                      {tribe.title}
                    </p>

                    {/* Element indicator */}
                    <div className="flex gap-1 mt-2">
                      {[0, 1, 2].map((d) => (
                        <div key={d} className="w-1 h-1 rounded-full"
                          style={{
                            background: tribe.name === 'Mountain' ? '#888' : tribe.color,
                            boxShadow: `0 0 4px ${tribe.glowColor.replace('0.6', '0.3')}`,
                          }} />
                      ))}
                    </div>

                    {/* Bottom glow */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px]"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${tribe.name === 'Mountain' ? '#888' : tribe.color}, transparent)`,
                      }} />
                  </div>
                </div>

                {/* Tribe name below card when revealed */}
                <div className="text-center mt-2 transition-all duration-500"
                  style={{ opacity: isRevealed ? 1 : 0, transform: isRevealed ? 'translateY(0)' : 'translateY(8px)' }}>
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-wider"
                    style={{
                      fontFamily: "'BlinkerSemiBold', sans-serif",
                      color: getTextColor(tribe, 'name'),
                      textShadow: `0 0 10px ${tribe.glowColor.replace('0.6', '0.2')}`,
                    }}>
                    {tribe.icon} {tribe.name}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Reveal All CTA */}
        {!allRevealed && (
          <div className="flex justify-center">
            <button
              onClick={revealAll}
              className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl font-semibold uppercase tracking-wider text-xs sm:text-sm transition-all duration-500 relative overflow-hidden group active:scale-95"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(14, 116, 144, 0.25) 100%)',
                border: '1.5px solid rgba(6, 182, 212, 0.35)',
                color: '#e0f2fe',
                boxShadow: '0 0 25px rgba(6, 182, 212, 0.08)',
                minHeight: '48px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 45px rgba(6, 182, 212, 0.2)'
                e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 25px rgba(6, 182, 212, 0.08)'
                e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.35)'
              }}
              aria-label="Reveal all four tribes"
            >
              <span className="relative z-10">✦ Reveal All Tribes</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>
        )}

        {/* Description cards after reveal */}
        {allRevealed && (
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-sm sm:max-w-lg md:max-w-2xl mx-auto">
            {tribes.map((tribe) => (
              <div key={tribe.name + '-desc'}
                className="rounded-xl p-3 sm:p-4 transition-all duration-300"
                style={{
                  background: 'linear-gradient(145deg, rgba(6, 30, 50, 0.4) 0%, rgba(0,0,0,0.7) 100%)',
                  border: `1px solid ${tribe.borderColor.replace('0.5', '0.15').replace('0.4', '0.12').replace('0.35', '0.12')}`,
                }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{tribe.icon}</span>
                  <h4 className="text-sm sm:text-base font-bold uppercase"
                    style={{ fontFamily: "'TheWalkyrDemo', serif", color: getTextColor(tribe, 'name') }}>
                    {tribe.name}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed"
                  style={{ fontFamily: "'BlinkerRegular', sans-serif", color: getTextColor(tribe, 'desc') }}>
                  {tribe.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes tribePulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </section>
  )
}
