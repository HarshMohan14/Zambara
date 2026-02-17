'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'

interface TribeData {
  name: string
  element: string
  icon: string
  title: string
  color: string
  glowColor: string
  bgGradient: string
  borderColor: string
  description: string
}

const tribes: TribeData[] = [
  {
    name: 'Lava',
    element: 'fire',
    icon: '🔥',
    title: 'Bearer of the Flame',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    bgGradient: 'linear-gradient(145deg, rgba(127, 29, 29, 0.4) 0%, rgba(239, 68, 68, 0.08) 50%, rgba(0,0,0,0.9) 100%)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    description: 'From the depths of volcanic fury, the Lava tribe channels raw destructive force. Their fire consumes all that stands before it.',
  },
  {
    name: 'Rain',
    element: 'water',
    icon: '🌧',
    title: 'Child of the Storm',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    bgGradient: 'linear-gradient(145deg, rgba(8, 51, 68, 0.5) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(0,0,0,0.9) 100%)',
    borderColor: 'rgba(6, 182, 212, 0.35)',
    description: 'Born from the tempest above the ocean, Rain warriors command the downpour. They douse flames and erode mountains.',
  },
  {
    name: 'Wind',
    element: 'air',
    icon: '🌬',
    title: 'Walker of the Sky',
    color: '#a78bfa',
    glowColor: 'rgba(167, 139, 250, 0.5)',
    bgGradient: 'linear-gradient(145deg, rgba(46, 16, 101, 0.4) 0%, rgba(167, 139, 250, 0.08) 50%, rgba(0,0,0,0.9) 100%)',
    borderColor: 'rgba(167, 139, 250, 0.35)',
    description: 'Unseen and untouchable, the Wind tribe bends the battlefield itself. Their gusts redirect fate and scatter strategy.',
  },
  {
    name: 'Mountain',
    element: 'earth',
    icon: '🏔',
    title: 'Keeper of Stone',
    color: '#d1a058',
    glowColor: 'rgba(209, 160, 88, 0.5)',
    bgGradient: 'linear-gradient(145deg, rgba(92, 64, 20, 0.4) 0%, rgba(209, 160, 88, 0.08) 50%, rgba(0,0,0,0.9) 100%)',
    borderColor: 'rgba(209, 160, 88, 0.35)',
    description: 'Immovable and ancient, the Mountain tribe endures all. They are the shield against chaos, the wall that never breaks.',
  },
]

export function TribesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Title animation
      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 40, filter: 'blur(6px)' },
          {
            opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: titleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      }

      if (subtitleRef.current) {
        gsap.fromTo(subtitleRef.current,
          { opacity: 0, y: 25 },
          {
            opacity: 1, y: 0, duration: 1, ease: 'power2.out',
            scrollTrigger: { trigger: subtitleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      }

      // Stagger cards
      if (cardsContainerRef.current) {
        const cards = cardsContainerRef.current.children
        gsap.fromTo(
          Array.from(cards),
          { opacity: 0, y: 80, scale: 0.85, rotateX: 15 },
          {
            opacity: 1, y: 0, scale: 1, rotateX: 0,
            duration: 1, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsContainerRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    }, sectionRef)

    return () => { ctx.revert() }
  }, [])

  // 3D tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -8
    const rotateY = ((x - centerX) / centerX) * 8

    gsap.to(card, {
      rotateX, rotateY,
      duration: 0.3,
      ease: 'power2.out',
      transformPerspective: 1000,
    })
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    gsap.to(e.currentTarget, {
      rotateX: 0, rotateY: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)',
    })
    setHoveredIndex(null)
  }

  return (
    <section
      ref={sectionRef}
      id="tribes"
      aria-label="The Four Tribes"
      className="relative w-full py-20 md:py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #000 0%, #020617 30%, #0c1222 50%, #020617 70%, #000 100%)',
      }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3), transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(209, 160, 88, 0.3), transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <p
            className="text-xs sm:text-sm uppercase tracking-[0.35em] mb-4"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6, 182, 212, 0.7)' }}
          >
            Choose Your Allegiance
          </p>
          <h2
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase mb-6 opacity-0"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#e2e8f0',
              textShadow: '0 0 40px rgba(6, 182, 212, 0.2), 2px 4px 8px rgba(0,0,0,0.6)',
            }}
          >
            The Four Tribes
          </h2>
          <p
            ref={subtitleRef}
            className="text-base md:text-lg text-white/50 max-w-2xl mx-auto opacity-0"
            style={{ fontFamily: "'BlinkerRegular', sans-serif", letterSpacing: '0.05em' }}
          >
            Four elements. Four paths. Only one leads to the throne of the Zampion.
          </p>
          {/* Decorative line */}
          <div className="flex justify-center mt-8">
            <div className="w-24 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent)' }} />
          </div>
        </div>

        {/* Tribe Cards Grid */}
        <div
          ref={cardsContainerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          style={{ perspective: '1200px' }}
        >
          {tribes.map((tribe, index) => {
            const isHovered = hoveredIndex === index
            return (
              <div
                key={tribe.name}
                className="relative group cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
                onMouseMove={(e) => { handleMouseMove(e, index); setHoveredIndex(index) }}
                onMouseLeave={(e) => handleMouseLeave(e, index)}
              >
                <div
                  className="relative rounded-2xl p-8 md:p-10 h-full min-h-[380px] flex flex-col justify-between transition-all duration-500 overflow-hidden"
                  style={{
                    background: tribe.bgGradient,
                    border: `1.5px solid ${isHovered ? tribe.color : tribe.borderColor}`,
                    boxShadow: isHovered
                      ? `0 0 50px ${tribe.glowColor}, 0 20px 60px rgba(0,0,0,0.5), inset 0 0 40px ${tribe.glowColor.replace('0.5', '0.08')}`
                      : `0 4px 30px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,0,0,0.3)`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Element Icon */}
                  <div className="mb-6">
                    <div
                      className="text-5xl md:text-6xl mb-4 transition-all duration-500"
                      style={{
                        filter: isHovered ? `drop-shadow(0 0 20px ${tribe.glowColor})` : 'none',
                        transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                      }}
                    >
                      {tribe.icon}
                    </div>
                    <h3
                      className="text-2xl md:text-3xl font-bold uppercase mb-2 transition-colors duration-500"
                      style={{
                        fontFamily: "'TheWalkyrDemo', serif",
                        color: isHovered ? tribe.color : '#e2e8f0',
                        textShadow: isHovered ? `0 0 20px ${tribe.glowColor}` : 'none',
                      }}
                    >
                      {tribe.name}
                    </h3>
                    <p
                      className="text-sm italic uppercase tracking-[0.2em] transition-all duration-500"
                      style={{
                        fontFamily: "'BlinkerRegular', sans-serif",
                        color: isHovered ? tribe.color : 'rgba(255,255,255,0.4)',
                        opacity: isHovered ? 1 : 0.6,
                      }}
                    >
                      {tribe.title}
                    </p>
                  </div>

                  {/* Divider */}
                  <div
                    className="w-full h-px mb-5 transition-all duration-500"
                    style={{
                      background: isHovered
                        ? `linear-gradient(90deg, transparent, ${tribe.color}, transparent)`
                        : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                    }}
                  />

                  {/* Description */}
                  <p
                    className="text-sm leading-relaxed transition-colors duration-500"
                    style={{
                      fontFamily: "'BlinkerRegular', sans-serif",
                      color: isHovered ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)',
                    }}
                  >
                    {tribe.description}
                  </p>

                  {/* Corner accent */}
                  <div
                    className="absolute top-0 right-0 w-20 h-20 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at top right, ${tribe.glowColor.replace('0.5', '0.15')}, transparent 70%)`,
                      opacity: isHovered ? 1 : 0.3,
                    }}
                  />

                  {/* Bottom glow bar */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-700"
                    style={{
                      background: isHovered ? `linear-gradient(90deg, transparent, ${tribe.color}, transparent)` : 'transparent',
                      boxShadow: isHovered ? `0 0 20px ${tribe.glowColor}` : 'none',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
