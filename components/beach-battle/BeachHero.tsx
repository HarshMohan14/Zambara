'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, createTimeline } from '@/lib/gsap'

export function BeachHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const particleContainerRef = useRef<HTMLDivElement>(null)
  const [isMuted, setIsMuted] = useState(true)

  const toggleMute = async () => {
    const video = videoRef.current
    if (!video) return
    if (isMuted) {
      video.muted = false
      setIsMuted(false)
      try { await video.play() } catch (e) { console.error(e) }
    } else {
      video.muted = true
      setIsMuted(true)
    }
  }

  // Floating particles
  useEffect(() => {
    if (!particleContainerRef.current) return
    const container = particleContainerRef.current
    const particles: HTMLDivElement[] = []

    for (let i = 0; i < 60; i++) {
      const p = document.createElement('div')
      const size = Math.random() * 4 + 1
      p.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, rgba(56, 189, 248, ${Math.random() * 0.6 + 0.2}), transparent);
        border-radius: 50%;
        pointer-events: none;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        filter: blur(${Math.random() * 1}px);
      `
      container.appendChild(p)
      particles.push(p)

      gsap.to(p, {
        y: -(Math.random() * 200 + 100),
        x: (Math.random() - 0.5) * 120,
        opacity: 0,
        duration: Math.random() * 6 + 4,
        repeat: -1,
        delay: Math.random() * 5,
        ease: 'none',
        onRepeat: () => {
          gsap.set(p, {
            y: 0,
            x: 0,
            opacity: Math.random() * 0.6 + 0.2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          })
        },
      })
    }

    return () => {
      particles.forEach(p => {
        gsap.killTweensOf(p)
        p.remove()
      })
    }
  }, [])

  // Hero entrance timeline
  useEffect(() => {
    if (!sectionRef.current) return

    const tl = createTimeline({ delay: 0.5 })

    // Video parallax on scroll
    if (videoRef.current) {
      gsap.to(videoRef.current, {
        yPercent: 20,
        scale: 1.1,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      })
    }

    // Title: split-text-like reveal
    if (titleRef.current) {
      const text = titleRef.current.textContent || ''
      titleRef.current.innerHTML = ''
      const words = text.split(' ')
      words.forEach((word, i) => {
        const span = document.createElement('span')
        span.className = 'inline-block overflow-hidden mr-[0.3em]'
        const inner = document.createElement('span')
        inner.className = 'inline-block'
        inner.textContent = word
        inner.style.transform = 'translateY(120%)'
        inner.style.opacity = '0'
        span.appendChild(inner)
        titleRef.current!.appendChild(span)
      })

      const innerSpans = titleRef.current.querySelectorAll('span > span')
      tl.to(innerSpans, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.12,
        ease: 'power4.out',
      }, 0.8)
    }

    // Subtitle
    if (subtitleRef.current) {
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power2.out' },
        '-=0.5'
      )
    }

    // CTA buttons
    if (ctaRef.current) {
      const buttons = ctaRef.current.children
      tl.fromTo(
        Array.from(buttons),
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'back.out(1.4)',
        },
        '-=0.4'
      )
    }

    return () => { tl.kill() }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden bg-black"
      id="beach-hero"
      aria-label="Beach Battle Hero"
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scale(1.05)' }}
      >
        <source src="/ocean-dragon.mp4" type="video/mp4" />
      </video>

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 z-10" />
      <div
        className="absolute bottom-0 left-0 right-0 h-48 z-10"
        style={{ background: 'linear-gradient(to top, #000 0%, transparent 100%)' }}
      />

      {/* Bioluminescent vignette */}
      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 50% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 60%)',
        }}
      />

      {/* Floating Particles */}
      <div ref={particleContainerRef} className="absolute inset-0 z-20 pointer-events-none overflow-hidden" />

      {/* Content */}
      <div className="relative z-30 h-full flex flex-col items-center justify-center px-4 text-center">
        {/* Title */}
        <h1
          ref={titleRef}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold uppercase tracking-wider leading-none mb-6"
          style={{
            fontFamily: "'TheWalkyrDemo', serif",
            color: '#e2e8f0',
            textShadow: '0 0 60px rgba(6, 182, 212, 0.4), 0 0 120px rgba(6, 182, 212, 0.2), 2px 4px 12px rgba(0,0,0,0.8)',
          }}
        >
          Zambaara Beach Battle
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-12 max-w-3xl opacity-0"
          style={{
            fontFamily: "'BlinkerRegular', sans-serif",
            color: 'rgba(148, 216, 240, 0.9)',
            textShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
            letterSpacing: '0.15em',
          }}
        >
          Where the Elements Clash by the Sea
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <a
            href="#qr-register"
            className="group relative px-8 py-4 sm:px-10 sm:py-5 rounded-lg font-semibold uppercase tracking-wider text-sm sm:text-base overflow-hidden transition-all duration-500"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(14, 116, 144, 0.4) 100%)',
              border: '1.5px solid rgba(6, 182, 212, 0.6)',
              color: '#e0f2fe',
              boxShadow: '0 0 30px rgba(6, 182, 212, 0.15), inset 0 0 20px rgba(6, 182, 212, 0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 50px rgba(6, 182, 212, 0.4), inset 0 0 30px rgba(6, 182, 212, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.9)'
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px rgba(6, 182, 212, 0.15), inset 0 0 20px rgba(6, 182, 212, 0.05)'
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.6)'
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
            }}
          >
            <span className="relative z-10">Scan to Enter the Battle</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </a>

          <a
            href="#tribes"
            className="group relative px-8 py-4 sm:px-10 sm:py-5 rounded-lg font-semibold uppercase tracking-wider text-sm sm:text-base overflow-hidden transition-all duration-500"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              background: 'linear-gradient(135deg, rgba(209, 160, 88, 0.2) 0%, rgba(180, 120, 60, 0.3) 100%)',
              border: '1.5px solid rgba(209, 160, 88, 0.5)',
              color: '#fde68a',
              boxShadow: '0 0 30px rgba(209, 160, 88, 0.1), inset 0 0 20px rgba(209, 160, 88, 0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 50px rgba(209, 160, 88, 0.3), inset 0 0 30px rgba(209, 160, 88, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(209, 160, 88, 0.8)'
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px rgba(209, 160, 88, 0.1), inset 0 0 20px rgba(209, 160, 88, 0.05)'
              e.currentTarget.style.borderColor = 'rgba(209, 160, 88, 0.5)'
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
            }}
          >
            <span className="relative z-10">View The Tribes</span>
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 animate-bounce">
        <span
          className="text-xs uppercase tracking-[0.3em]"
          style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(148, 216, 240, 0.5)' }}
        >
          Dive In
        </span>
        <svg className="w-5 h-5 opacity-40" fill="none" stroke="rgba(148, 216, 240, 0.6)" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {/* Audio Toggle */}
      <button
        onClick={toggleMute}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-black/50 backdrop-blur-sm border border-cyan-500/40 hover:border-cyan-400/70 transition-all duration-300"
        style={{ boxShadow: '0 4px 15px rgba(6, 182, 212, 0.15)' }}
        aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="rgba(6, 182, 212, 0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="rgba(6, 182, 212, 0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>
    </section>
  )
}
