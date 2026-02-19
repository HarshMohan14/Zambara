'use client'

import { useEffect, useRef } from 'react'
import { gsap, createTimeline } from '@/lib/gsap'
import Link from 'next/link'
import Image from 'next/image'

const tribeColors = [
  { name: 'Lava', color: '#ef4444', icon: '🔥' },
  { name: 'Rain', color: '#3b82f6', icon: '🌧️' },
  { name: 'Wind', color: '#e0e0e0', icon: '🌬️' },
  { name: 'Mountain', color: '#555555', icon: '🏔️' },
]

const runeLinks = [
  { label: '⛩ Home', href: '/' },
  { label: '⚔ Beach Battle', href: '/beach-battle', accent: true },
  { label: '📜 How to Play', href: '/how-to-play' },
  { label: '🎴 Game Cards', href: '/#cards' },
]

export function BeachBattleFooter() {
  const footerRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Stormy ocean canvas — mist + tribal particle collision
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
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

    interface MistParticle {
      x: number
      y: number
      vx: number
      size: number
      alpha: number
      color: string
    }

    const mist: MistParticle[] = []

    const spawnMist = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      const colors = ['rgba(6, 182, 212, 0.03)', 'rgba(148, 216, 240, 0.02)', 'rgba(255,255,255,0.015)']
      mist.push({
        x: -100,
        y: h * 0.2 + Math.random() * h * 0.6,
        vx: Math.random() * 0.3 + 0.1,
        size: Math.random() * 150 + 80,
        alpha: Math.random() * 0.3 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    const animate = () => {
      if (!ctx || !canvas) return
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)
      time++

      // Spawn mist
      if (time % (prefersReduced ? 60 : 20) === 0 && mist.length < 15) {
        spawnMist()
      }

      // Draw mist layers
      for (let i = mist.length - 1; i >= 0; i--) {
        const m = mist[i]
        m.x += m.vx
        if (m.x > w + m.size) {
          mist.splice(i, 1)
          continue
        }
        ctx.beginPath()
        const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.size)
        grad.addColorStop(0, m.color)
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.globalAlpha = m.alpha
        ctx.fillRect(m.x - m.size, m.y - m.size, m.size * 2, m.size * 2)
      }
      ctx.globalAlpha = 1

      // Central golden pulse for "Hall of Fame" feel
      const cx = w / 2
      const cy = h * 0.45
      const pulse = 80 + Math.sin(time * 0.015) * 25
      const centralGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulse)
      centralGlow.addColorStop(0, 'rgba(209, 160, 88, 0.04)')
      centralGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.02)')
      centralGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = centralGlow
      ctx.fillRect(cx - pulse, cy - pulse, pulse * 2, pulse * 2)

      // Draw tribal silhouette shapes at bottom — mountain/wave outlines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.03)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      // Mountain silhouette left
      ctx.moveTo(0, h)
      ctx.lineTo(w * 0.15, h * 0.7)
      ctx.lineTo(w * 0.25, h * 0.8)
      ctx.lineTo(w * 0.35, h * 0.65)
      ctx.lineTo(w * 0.45, h * 0.85)
      // Wave transition
      for (let x = w * 0.45; x <= w; x += 3) {
        const waveY = h * 0.85 + Math.sin((x * 0.01) + time * 0.01) * 8
        ctx.lineTo(x, waveY)
      }
      ctx.lineTo(w, h)
      ctx.stroke()

      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  // GSAP entrance
  useEffect(() => {
    if (!footerRef.current) return
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        const tl = createTimeline({
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        })
        tl.fromTo(Array.from(contentRef.current.children),
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
      className="relative w-full py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden"
    >
      {/* Stormy ocean canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Top border - four tribe colors clashing */}
      <div className="absolute top-0 left-0 right-0 h-[3px] flex">
        {tribeColors.map((tribe) => (
          <div key={tribe.name} className="flex-1 h-full relative overflow-hidden" style={{ background: tribe.color, opacity: 0.5 }}>
            <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, transparent, ${tribe.color}, transparent)`, animation: 'shimmer 3s ease-in-out infinite' }} />
          </div>
        ))}
      </div>

      {/* Dark overlay for readability against unified bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 pointer-events-none" />

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 -left-10 w-40 h-40 sm:w-60 sm:h-60 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #ef4444, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute top-1/3 -right-10 w-40 h-40 sm:w-60 sm:h-60 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 sm:w-60 sm:h-60 rounded-full opacity-[0.025]"
          style={{ background: 'radial-gradient(circle, #d1a058, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      <div ref={contentRef} className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6 sm:mb-8 opacity-0">
          <Image
            src="/Zambaara.png"
            alt="ZAMBAARA"
            width={200}
            height={80}
            className="h-12 sm:h-16 w-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 15px rgba(209, 160, 88, 0.2))' }}
            loading="lazy"
          />
        </div>

        {/* Closing cinematic line */}
        <div className="text-center mb-6 sm:mb-8 space-y-2 opacity-0">
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold uppercase"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#cbd5e1',
              textShadow: '0 0 40px rgba(6, 182, 212, 0.15), 2px 4px 8px rgba(0,0,0,0.8)',
            }}>
            The Ocean Remembers.
          </h3>
          <p className="text-xs sm:text-sm lg:text-base uppercase tracking-[0.15em]"
            style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(148, 216, 240, 0.35)' }}>
            Fire. Water. Wind. Earth. — Only one prevails.
          </p>
        </div>

        {/* Tribe orbs row */}
        <div className="flex justify-center gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 opacity-0">
          {tribeColors.map((tribe) => (
            <div key={tribe.name} className="flex flex-col items-center gap-1.5 group cursor-default">
              <div className="w-9 h-9 sm:w-11 sm:h-11 lg:w-14 lg:h-14 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `radial-gradient(circle at 40% 35%, ${tribe.color}99, ${tribe.color}44, ${tribe.color}15)`,
                  border: `1.5px solid ${tribe.color}30`,
                  boxShadow: `0 0 12px ${tribe.color}15`,
                }}>
                <span className="text-sm lg:text-lg">{tribe.icon}</span>
              </div>
              <span className="text-[9px] sm:text-xs uppercase tracking-wider"
                style={{
                  fontFamily: "'BlinkerRegular', sans-serif",
                  color: tribe.name === 'Mountain' ? 'rgba(150,150,150,0.45)' : `${tribe.color}60`,
                }}>
                {tribe.name}
              </span>
            </div>
          ))}
        </div>

        {/* Divider with diamond */}
        <div className="flex justify-center items-center gap-3 mb-6 sm:mb-8 opacity-0">
          <div className="flex-1 max-w-[80px] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(209, 160, 88, 0.25))' }} />
          <div className="w-2 h-2 rotate-45" style={{ background: 'rgba(209, 160, 88, 0.3)' }} />
          <div className="flex-1 max-w-[80px] h-px" style={{ background: 'linear-gradient(90deg, rgba(209, 160, 88, 0.25), transparent)' }} />
        </div>

        {/* Rune-style navigation links */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 opacity-0">
          {runeLinks.map((link) => (
            <Link key={link.label} href={link.href}
              className="text-xs sm:text-sm lg:text-base uppercase tracking-wider transition-all duration-300 hover:translate-y-[-1px]"
              style={{
                fontFamily: "'BlinkerRegular', sans-serif",
                color: link.accent ? 'rgba(6, 182, 212, 0.7)' : 'rgba(209, 160, 88, 0.5)',
                textShadow: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = link.accent ? '#22d3ee' : '#d1a058'
                e.currentTarget.style.textShadow = `0 0 10px ${link.accent ? 'rgba(6, 182, 212, 0.4)' : 'rgba(209, 160, 88, 0.4)'}`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = link.accent ? 'rgba(6, 182, 212, 0.7)' : 'rgba(209, 160, 88, 0.5)'
                e.currentTarget.style.textShadow = 'none'
              }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA - Join the Next Battle */}
        <div className="flex justify-center mb-8 sm:mb-10 opacity-0">
          <a href="#qr-register"
            className="px-7 py-3.5 sm:px-10 sm:py-4 rounded-xl font-semibold uppercase tracking-wider text-xs sm:text-sm transition-all duration-300 relative overflow-hidden group active:scale-95"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(14, 116, 144, 0.2) 100%)',
              border: '1.5px solid rgba(6, 182, 212, 0.3)',
              color: '#e0f2fe',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.06)',
              minHeight: '48px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 40px rgba(6, 182, 212, 0.2)'
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(6, 182, 212, 0.06)'
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)'
            }}>
            <span className="relative z-10">⚔ Join The Next Battle</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </a>
        </div>

        {/* Minimal social icons */}
        <div className="flex justify-center gap-5 mb-8 opacity-0">
          {[
            { name: 'Instagram', path: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6' },
            { name: 'Twitter/X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
          ].map((social) => (
            <a key={social.name} href="#" aria-label={social.name}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 group"
              style={{
                border: '1px solid rgba(209, 160, 88, 0.15)',
                background: 'rgba(0,0,0,0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(209, 160, 88, 0.4)'
                e.currentTarget.style.boxShadow = '0 0 15px rgba(209, 160, 88, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(209, 160, 88, 0.15)'
                e.currentTarget.style.boxShadow = 'none'
              }}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="rgba(209, 160, 88, 0.5)">
                <path d={social.path} />
              </svg>
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-center pt-6 opacity-0"
          style={{ borderTop: '1px solid rgba(209, 160, 88, 0.06)' }}>
          <p className="text-xs sm:text-sm text-white/35"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            &copy; {new Date().getFullYear()} ZAMBAARA. All rights reserved.
          </p>
          <p className="text-[10px] sm:text-xs text-white/15 mt-1"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            Where Elements Clash by the Sea
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); opacity: 0; }
          50% { transform: translateX(100%); opacity: 0.5; }
        }
      `}</style>
    </footer>
  )
}
