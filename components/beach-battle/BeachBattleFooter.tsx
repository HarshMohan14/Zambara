'use client'

import { useEffect, useRef } from 'react'
import { gsap, createTimeline } from '@/lib/gsap'
import Link from 'next/link'
import Image from 'next/image'

const tribeColors = [
  { name: 'Lava', color: '#ef4444' },
  { name: 'Rain', color: '#3b82f6' },
  { name: 'Wind', color: '#e0e0e0' },
  { name: 'Mountain', color: '#555555' },
]

export function BeachBattleFooter() {
  const footerRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const clashCanvasRef = useRef<HTMLCanvasElement>(null)

  // Tribal clash particle canvas - fire, water, wind, earth particles colliding
  useEffect(() => {
    const canvas = clashCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      color: string
      size: number
      life: number
      maxLife: number
      alpha: number
    }

    const particles: Particle[] = []

    const spawnParticle = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      const tribeIdx = Math.floor(Math.random() * 4)
      const colors = ['#ef4444', '#3b82f6', '#e0e0e0', '#555555']
      const side = Math.random() < 0.5 ? 0 : 1
      const x = side === 0 ? Math.random() * w * 0.3 : w * 0.7 + Math.random() * w * 0.3
      const y = h * 0.3 + Math.random() * h * 0.5
      const angle = side === 0 ? Math.random() * 0.8 - 0.2 : Math.PI + Math.random() * 0.8 - 0.4
      const speed = Math.random() * 0.8 + 0.3

      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 0.3,
        color: colors[tribeIdx],
        size: Math.random() * 3 + 1,
        life: 0,
        maxLife: Math.random() * 120 + 60,
        alpha: Math.random() * 0.4 + 0.2,
      })
    }

    const animate = () => {
      if (!ctx || !canvas) return
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)
      time++

      // Spawn particles
      if (time % 3 === 0 && particles.length < 60) {
        spawnParticle()
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.003 // slight gravity
        p.life++
        const lifeRatio = p.life / p.maxLife
        const fadeAlpha = lifeRatio < 0.2 ? lifeRatio * 5 : lifeRatio > 0.7 ? (1 - lifeRatio) / 0.3 : 1

        if (p.life >= p.maxLife || p.x < -20 || p.x > w + 20) {
          particles.splice(i, 1)
          continue
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha * fadeAlpha
        ctx.fill()

        // Glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
        glow.addColorStop(0, p.color)
        glow.addColorStop(1, 'transparent')
        ctx.fillStyle = glow
        ctx.globalAlpha = p.alpha * fadeAlpha * 0.15
        ctx.fill()
      }

      ctx.globalAlpha = 1

      // Central clash glow (where tribes meet)
      const centerX = w / 2
      const centerY = h * 0.5
      const pulseSize = 60 + Math.sin(time * 0.02) * 20
      const clashGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize)
      clashGlow.addColorStop(0, 'rgba(209, 160, 88, 0.06)')
      clashGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.03)')
      clashGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = clashGlow
      ctx.fillRect(centerX - pulseSize, centerY - pulseSize, pulseSize * 2, pulseSize * 2)

      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  // GSAP entrance animations
  useEffect(() => {
    if (!footerRef.current) return
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        const children = contentRef.current.children
        const tl = createTimeline({
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        })

        tl.fromTo(Array.from(children),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
        )
      }
    }, footerRef)
    return () => { ctx.revert() }
  }, [])

  return (
    <footer
      ref={footerRef}
      className="relative w-full py-12 sm:py-16 md:py-20 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #000 0%, #0a0a12 30%, #0c0810 60%, #050308 100%)',
      }}
    >
      {/* Tribal clash canvas */}
      <canvas ref={clashCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Top border - four tribe colors clashing */}
      <div className="absolute top-0 left-0 right-0 h-[2px] flex">
        {tribeColors.map((tribe) => (
          <div key={tribe.name} className="flex-1 h-full" style={{ background: tribe.color, opacity: 0.6 }} />
        ))}
      </div>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

      {/* Ambient clash glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-10 w-40 h-40 sm:w-60 sm:h-60 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #ef4444, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute top-1/3 -right-10 w-40 h-40 sm:w-60 sm:h-60 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 sm:w-60 sm:h-60 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #d1a058, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      <div ref={contentRef} className="container mx-auto px-4 relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6 sm:mb-8 opacity-0">
          <Image
            src="/Zambaara.png"
            alt="ZAMBAARA"
            width={200}
            height={80}
            className="h-12 sm:h-16 w-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 15px rgba(209, 160, 88, 0.2))' }}
          />
        </div>

        {/* Battle cry text */}
        <div className="text-center mb-6 sm:mb-8 space-y-1.5 opacity-0">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#d1a058',
              textShadow: '0 0 25px rgba(209, 160, 88, 0.15), 2px 4px 8px rgba(0,0,0,0.8)',
            }}>
            The Elements Will Clash
          </h3>
          <p className="text-xs sm:text-sm uppercase tracking-[0.15em]"
            style={{
              fontFamily: "'BlinkerRegular', sans-serif",
              color: 'rgba(148, 216, 240, 0.4)',
            }}>
            Fire. Water. Wind. Earth. Only one prevails.
          </p>
        </div>

        {/* Tribe colors strip */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 opacity-0">
          {tribeColors.map((tribe) => (
            <div key={tribe.name} className="flex flex-col items-center gap-1.5 group cursor-default">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${tribe.color}cc, ${tribe.color}60, ${tribe.color}20)`,
                  border: `1.5px solid ${tribe.color}40`,
                  boxShadow: `0 0 15px ${tribe.color}15`,
                }} />
              <span className="text-[8px] uppercase tracking-wider"
                style={{
                  fontFamily: "'BlinkerRegular', sans-serif",
                  color: tribe.name === 'Mountain' ? 'rgba(150,150,150,0.5)' : `${tribe.color}80`,
                }}>
                {tribe.name}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="flex justify-center mb-6 sm:mb-8 opacity-0">
          <div className="w-24 sm:w-32 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(209, 160, 88, 0.3), transparent)' }} />
        </div>

        {/* Navigation links */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 sm:mb-10 opacity-0">
          {[
            { label: 'Home', href: '/' },
            { label: 'Beach Battle', href: '/beach-battle', accent: true },
            { label: 'How to Play', href: '/how-to-play' },
          ].map((link) => (
            <Link key={link.label} href={link.href}
              className="text-xs sm:text-sm uppercase tracking-wider transition-all duration-300"
              style={{
                fontFamily: "'BlinkerRegular', sans-serif",
                color: link.accent ? '#06b6d4' : 'rgba(209, 160, 88, 0.6)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = link.accent ? '#22d3ee' : '#d1a058'
                e.currentTarget.style.textShadow = `0 0 10px ${link.accent ? 'rgba(6, 182, 212, 0.4)' : 'rgba(209, 160, 88, 0.4)'}`
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = link.accent ? '#06b6d4' : 'rgba(209, 160, 88, 0.6)'
                e.currentTarget.style.textShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA button */}
        <div className="flex justify-center mb-8 sm:mb-10 opacity-0">
          <a href="#qr-register"
            className="px-7 py-3 sm:px-10 sm:py-4 rounded-lg font-semibold uppercase tracking-wider text-xs sm:text-sm transition-all duration-300 relative overflow-hidden group active:scale-95"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              background: 'linear-gradient(135deg, rgba(209, 160, 88, 0.15) 0%, rgba(209, 160, 88, 0.08) 100%)',
              border: '1.5px solid rgba(209, 160, 88, 0.35)',
              color: '#d1a058',
              boxShadow: '0 0 20px rgba(209, 160, 88, 0.06)',
              minHeight: '44px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 35px rgba(209, 160, 88, 0.2)'
              e.currentTarget.style.borderColor = 'rgba(209, 160, 88, 0.6)'
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(209, 160, 88, 0.06)'
              e.currentTarget.style.borderColor = 'rgba(209, 160, 88, 0.35)'
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
            }}>
            <span className="relative z-10">Join the Battle</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d1a058]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center pt-6 opacity-0"
          style={{ borderTop: '1px solid rgba(209, 160, 88, 0.08)' }}>
          <p className="text-[10px] sm:text-xs text-white/40"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            &copy; {new Date().getFullYear()} ZAMBAARA. All rights reserved.
          </p>
          <p className="text-[9px] sm:text-[10px] text-white/20 mt-1"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            Where Elements Clash by the Sea
          </p>
        </div>
      </div>
    </footer>
  )
}
