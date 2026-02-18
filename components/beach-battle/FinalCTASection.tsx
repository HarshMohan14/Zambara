'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'

export function FinalCTASection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const btnRef = useRef<HTMLAnchorElement>(null)
  const waveCanvasRef = useRef<HTMLCanvasElement>(null)
  const [showSticky, setShowSticky] = useState(false)

  // Tribal war wave canvas
  useEffect(() => {
    const canvas = waveCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    // Respect reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const drawWave = (yOff: number, amp: number, freq: number, speed: number, color: string, alpha: number) => {
      if (!ctx || !canvas) return
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.beginPath()
      ctx.moveTo(0, h)
      for (let x = 0; x <= w; x += 3) {
        const y = yOff + Math.sin(x * freq + time * speed) * amp + Math.sin(x * freq * 0.5 + time * speed * 0.7) * (amp * 0.5)
        ctx.lineTo(x, y)
      }
      ctx.lineTo(w, h)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.globalAlpha = alpha
      ctx.fill()
      ctx.globalAlpha = 1
    }

    const animate = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      time += prefersReduced ? 0.003 : 0.015
      const h = canvas.offsetHeight

      // Tribal war waves - all four tribe colors + ocean teal
      drawWave(h * 0.72, 10, 0.006, 0.6, '#7f1d1d', 0.04) // Lava red undertone
      drawWave(h * 0.76, 7, 0.009, 0.8, '#1e3a8a', 0.05)  // Rain blue
      drawWave(h * 0.80, 5, 0.012, 1.0, '#0e7490', 0.06)   // Ocean teal
      drawWave(h * 0.83, 8, 0.005, 0.5, '#374151', 0.03)   // Mountain gray
      drawWave(h * 0.86, 6, 0.014, 1.1, '#0891b2', 0.07)   // Teal bright
      drawWave(h * 0.89, 4, 0.018, 1.3, '#22d3ee', 0.04)   // Cyan

      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  // Scroll animations + sticky CTA trigger
  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 35, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out',
            scrollTrigger: { trigger: titleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' } }
        )
      }
      if (subtitleRef.current) {
        gsap.fromTo(subtitleRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 0.2,
            scrollTrigger: { trigger: subtitleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' } }
        )
      }
      if (btnRef.current) {
        gsap.fromTo(btnRef.current,
          { opacity: 0, y: 25, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.4)', delay: 0.4,
            scrollTrigger: { trigger: btnRef.current, start: 'top 90%', toggleActions: 'play none none reverse' } }
        )
      }
    }, sectionRef)

    // Show sticky CTA after scrolling past hero
    const handleScroll = () => {
      setShowSticky(window.scrollY > window.innerHeight * 1.2)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      ctx.revert()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      <section
        ref={sectionRef}
        className="relative w-full min-h-[55vh] sm:min-h-[60vh] flex items-center justify-center overflow-hidden"
        aria-label="Final Call to Action"
      >
        <canvas ref={waveCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Subtle overlay for depth — no opaque bg */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.4]"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.5) 100%)' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] opacity-[0.08]"
            style={{ background: 'radial-gradient(ellipse at bottom, rgba(6, 182, 212, 0.35), transparent 70%)', filter: 'blur(60px)' }} />
        </div>

        <div className="relative z-10 text-center px-5 max-w-sm sm:max-w-xl mx-auto">
          <h2 ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold uppercase mb-4 sm:mb-6 opacity-0"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#cbd5e1',
              textShadow: '0 0 60px rgba(6, 182, 212, 0.2), 0 0 120px rgba(6, 182, 212, 0.08), 2px 4px 10px rgba(0,0,0,0.8)',
              lineHeight: '1.1',
            }}>
            The Ocean Remembers.
          </h2>

          <p ref={subtitleRef}
            className="text-xs sm:text-sm md:text-base mb-7 sm:mb-10 max-w-xs sm:max-w-sm mx-auto opacity-0"
            style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(148, 216, 240, 0.4)', letterSpacing: '0.08em' }}>
            Your tribe awaits. The tides are turning. Will you answer the call?
          </p>

          <a ref={btnRef} href="/beach-battle/register"
            className="inline-block px-7 py-4 sm:px-10 sm:py-5 rounded-xl font-semibold uppercase tracking-wider text-sm sm:text-base relative overflow-hidden group transition-all duration-500 opacity-0 active:scale-95"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(14, 116, 144, 0.3) 100%)',
              border: '2px solid rgba(6, 182, 212, 0.4)',
              color: '#e0f2fe',
              boxShadow: '0 0 40px rgba(6, 182, 212, 0.08), inset 0 0 25px rgba(6, 182, 212, 0.03)',
              minHeight: '48px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 65px rgba(6, 182, 212, 0.25), inset 0 0 40px rgba(6, 182, 212, 0.06)'
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.7)'
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 40px rgba(6, 182, 212, 0.08), inset 0 0 25px rgba(6, 182, 212, 0.03)'
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)'
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
            }}>
            <span className="relative z-10">Register Now</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </a>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20" style={{ background: 'linear-gradient(to top, #000, transparent)' }} />
      </section>

      {/* Sticky "Register" Mini-CTA - appears after scrolling past hero */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[90] transition-all duration-500 pointer-events-none"
        style={{
          transform: showSticky ? 'translateY(0)' : 'translateY(100%)',
          opacity: showSticky ? 1 : 0,
        }}>
        <div className="pointer-events-auto mx-auto max-w-md px-4 pb-4 sm:pb-5">
          <a href="/beach-battle/register"
            className="flex items-center justify-center gap-2 w-full py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-semibold transition-all duration-300 active:scale-95"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(14, 116, 144, 0.4) 100%)',
              border: '1.5px solid rgba(6, 182, 212, 0.5)',
              color: '#e0f2fe',
              boxShadow: '0 -4px 30px rgba(0,0,0,0.5), 0 0 30px rgba(6, 182, 212, 0.12)',
              backdropFilter: 'blur(12px)',
              minHeight: '48px',
            }}>
            <span>⚔️</span>
            <span>Join The Battle</span>
          </a>
        </div>
      </div>
    </>
  )
}
