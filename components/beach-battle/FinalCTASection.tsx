'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

export function FinalCTASection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const btnRef = useRef<HTMLAnchorElement>(null)
  const waveCanvasRef = useRef<HTMLCanvasElement>(null)

  // Wave animation
  useEffect(() => {
    const canvas = waveCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2
      canvas.height = canvas.offsetHeight * 2
      ctx.scale(2, 2)
    }
    resize()
    window.addEventListener('resize', resize)

    const drawWave = (
      yOffset: number,
      amplitude: number,
      frequency: number,
      speed: number,
      color: string,
      alpha: number
    ) => {
      if (!ctx || !canvas) return
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight

      ctx.beginPath()
      ctx.moveTo(0, height)

      for (let x = 0; x <= width; x++) {
        const y = yOffset + Math.sin(x * frequency + time * speed) * amplitude +
          Math.sin(x * frequency * 0.5 + time * speed * 0.7) * (amplitude * 0.5)
        ctx.lineTo(x, y)
      }

      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.closePath()

      ctx.fillStyle = color
      ctx.globalAlpha = alpha
      ctx.fill()
      ctx.globalAlpha = 1
    }

    const animate = () => {
      if (!ctx || !canvas) return
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      ctx.clearRect(0, 0, width, height)

      time += 0.015

      // Multiple wave layers
      drawWave(height * 0.75, 8, 0.008, 0.8, '#0e7490', 0.08)
      drawWave(height * 0.78, 6, 0.012, 1.0, '#06b6d4', 0.06)
      drawWave(height * 0.82, 10, 0.006, 0.6, '#0891b2', 0.1)
      drawWave(height * 0.86, 5, 0.015, 1.3, '#22d3ee', 0.05)
      drawWave(height * 0.88, 7, 0.01, 0.9, '#0e7490', 0.07)

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  // Scroll animations
  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 40, filter: 'blur(8px)' },
          {
            opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.5, ease: 'power3.out',
            scrollTrigger: { trigger: titleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      }

      if (subtitleRef.current) {
        gsap.fromTo(subtitleRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 0.3,
            scrollTrigger: { trigger: subtitleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      }

      if (btnRef.current) {
        gsap.fromTo(btnRef.current,
          { opacity: 0, y: 30, scale: 0.9 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.4)', delay: 0.5,
            scrollTrigger: { trigger: btnRef.current, start: 'top 90%', toggleActions: 'play none none reverse' },
          }
        )
      }
    }, sectionRef)

    return () => { ctx.revert() }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden"
      aria-label="Final Call to Action"
      style={{
        background: 'linear-gradient(180deg, #000 0%, #020810 30%, #061420 50%, #020810 80%, #000 100%)',
      }}
    >
      {/* Wave Canvas */}
      <canvas
        ref={waveCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Deep ocean glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-15"
          style={{
            background: 'radial-gradient(ellipse at bottom, rgba(6, 182, 212, 0.4), transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h2
          ref={titleRef}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold uppercase mb-8 opacity-0"
          style={{
            fontFamily: "'TheWalkyrDemo', serif",
            color: '#cbd5e1',
            textShadow: '0 0 80px rgba(6, 182, 212, 0.3), 0 0 150px rgba(6, 182, 212, 0.15), 2px 4px 12px rgba(0,0,0,0.8)',
            lineHeight: '1.1',
          }}
        >
          The Ocean Remembers.
        </h2>

        <p
          ref={subtitleRef}
          className="text-base md:text-lg mb-12 max-w-xl mx-auto opacity-0"
          style={{
            fontFamily: "'BlinkerRegular', sans-serif",
            color: 'rgba(148, 216, 240, 0.5)',
            letterSpacing: '0.1em',
          }}
        >
          Your tribe awaits. The tides are turning. Will you answer the call?
        </p>

        <a
          ref={btnRef}
          href="#qr-register"
          className="inline-block px-12 py-5 md:px-16 md:py-6 rounded-xl font-semibold uppercase tracking-wider text-base md:text-lg relative overflow-hidden group transition-all duration-500 opacity-0"
          style={{
            fontFamily: "'BlinkerSemiBold', sans-serif",
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(14, 116, 144, 0.35) 100%)',
            border: '2px solid rgba(6, 182, 212, 0.5)',
            color: '#e0f2fe',
            boxShadow: '0 0 50px rgba(6, 182, 212, 0.15), 0 0 100px rgba(6, 182, 212, 0.08), inset 0 0 30px rgba(6, 182, 212, 0.05)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 80px rgba(6, 182, 212, 0.35), 0 0 150px rgba(6, 182, 212, 0.15), inset 0 0 50px rgba(6, 182, 212, 0.1)'
            e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.8)'
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.04)'
            e.currentTarget.style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 50px rgba(6, 182, 212, 0.15), 0 0 100px rgba(6, 182, 212, 0.08), inset 0 0 30px rgba(6, 182, 212, 0.05)'
            e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.5)'
            e.currentTarget.style.transform = 'translateY(0) scale(1)'
            e.currentTarget.style.color = '#e0f2fe'
          }}
        >
          <span className="relative z-10">Register Now</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </a>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24"
        style={{ background: 'linear-gradient(to top, #000, transparent)' }} />
    </section>
  )
}
