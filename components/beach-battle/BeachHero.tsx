'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, createTimeline } from '@/lib/gsap'

export function BeachHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const dropletContainerRef = useRef<HTMLDivElement>(null)
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

  // 3D Water droplets matching the ocean dragon video aesthetic
  useEffect(() => {
    if (!dropletContainerRef.current) return
    const container = dropletContainerRef.current
    const droplets: HTMLDivElement[] = []
    // Fewer particles on mobile for performance
    const count = window.innerWidth < 768 ? 20 : 35

    for (let i = 0; i < count; i++) {
      const d = document.createElement('div')
      const size = Math.random() * 8 + 3
      const isLarge = size > 7
      // 3D water droplet look: bright core, translucent edge, specular highlight
      d.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size * 1.2}px;
        background: radial-gradient(ellipse at 35% 25%,
          rgba(200, 240, 255, ${Math.random() * 0.6 + 0.4}),
          rgba(80, 200, 240, ${Math.random() * 0.35 + 0.15}),
          rgba(6, 182, 212, ${Math.random() * 0.15 + 0.05}),
          transparent 75%);
        border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
        pointer-events: none;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        filter: blur(${isLarge ? 0 : Math.random() * 0.3}px);
        box-shadow: ${isLarge
          ? `inset -1px -1px 3px rgba(0,0,0,0.15),
             inset 1px 1px 2px rgba(255,255,255,0.25),
             0 0 ${size * 1.5}px rgba(6, 182, 212, 0.2),
             0 0 ${size * 3}px rgba(80, 200, 240, 0.08)`
          : `0 0 ${size}px rgba(6, 182, 212, 0.15)`};
        transform: rotate(${Math.random() * 30 - 15}deg);
      `
      container.appendChild(d)
      droplets.push(d)

      // Float upward with slight wobble like real water droplets
      gsap.to(d, {
        y: -(Math.random() * 200 + 100),
        x: Math.sin(Math.random() * Math.PI * 2) * (Math.random() * 60 + 20),
        opacity: 0,
        scale: Math.random() * 0.3 + 0.7,
        rotation: Math.random() * 40 - 20,
        duration: Math.random() * 6 + 4,
        repeat: -1,
        delay: Math.random() * 4,
        ease: 'power1.out',
        onRepeat: () => {
          gsap.set(d, {
            y: 0, x: 0, scale: 1,
            opacity: Math.random() * 0.6 + 0.2,
            left: `${Math.random() * 100}%`,
            top: `${60 + Math.random() * 40}%`,
            rotation: Math.random() * 30 - 15,
          })
        },
      })
    }

    return () => {
      droplets.forEach(d => { gsap.killTweensOf(d); d.remove() })
    }
  }, [])

  // Hero entrance timeline
  useEffect(() => {
    if (!sectionRef.current) return

    const tl = createTimeline({ delay: 0.3 })

    // Video parallax on scroll
    if (videoRef.current) {
      gsap.to(videoRef.current, {
        yPercent: 12, scale: 1.06,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top', end: 'bottom top', scrub: 1.5,
        },
      })
    }

    // Title: split-text-like reveal
    if (titleRef.current) {
      const text = titleRef.current.textContent || ''
      titleRef.current.innerHTML = ''
      const words = text.split(' ')
      words.forEach((word) => {
        const span = document.createElement('span')
        span.className = 'inline-block overflow-hidden mr-[0.25em]'
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
        y: 0, opacity: 1,
        duration: 1, stagger: 0.12,
        ease: 'power4.out',
      }, 0.5)
    }

    // Subtitle blur-deblur
    if (subtitleRef.current) {
      tl.fromTo(subtitleRef.current,
        { opacity: 0, y: 20, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power2.out' },
        '-=0.4'
      )
    }

    // CTA buttons
    if (ctaRef.current) {
      tl.fromTo(Array.from(ctaRef.current.children),
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'back.out(1.4)' },
        '-=0.3'
      )
    }

    return () => { tl.kill() }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[100svh] min-h-[600px] overflow-hidden bg-black"
      id="beach-hero"
      aria-label="Beach Battle Hero"
    >
      {/* Video Background - 3D ocean dragon with water droplets */}
      <video
        ref={videoRef}
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scale(1.05)' }}
        poster=""
      >
        <source src="/ocean-dragon.mp4" type="video/mp4" />
      </video>

      {/* Cinematic Overlays - heavier on mobile for text readability over 3D video */}
      <div className="absolute inset-0 z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.7) 80%, rgba(0,0,0,0.95) 100%)' }} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 z-10" />

      {/* Bioluminescent vignette - matches the 3D water glow */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 75%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)' }} />

      {/* 3D Water droplet particles */}
      <div ref={dropletContainerRef} className="absolute inset-0 z-20 pointer-events-none overflow-hidden" />

      {/* Content - bottom-weighted for mobile thumb reach */}
      <div className="relative z-30 h-full flex flex-col items-center justify-end pb-24 sm:pb-28 md:justify-center md:pb-0 px-5 sm:px-6 lg:px-8 text-center max-w-7xl mx-auto">
        {/* Title */}
        <h1
          ref={titleRef}
          className="text-[2.2rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[5.5rem] font-bold uppercase tracking-wider mb-3 sm:mb-5"
          style={{
            fontFamily: "'TheWalkyrDemo', serif",
            color: '#e2e8f0',
            textShadow: '0 0 50px rgba(6, 182, 212, 0.35), 0 0 100px rgba(6, 182, 212, 0.15), 2px 4px 10px rgba(0,0,0,0.9)',
          }}
        >
          Zambaara Beach Battle
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl mb-7 sm:mb-9 max-w-[320px] sm:max-w-xl lg:max-w-2xl opacity-0"
          style={{
            fontFamily: "'BlinkerRegular', sans-serif",
            color: 'rgba(148, 216, 240, 0.85)',
            textShadow: '0 0 15px rgba(6, 182, 212, 0.25)',
            letterSpacing: '0.12em',
          }}
        >
          Where the Elements Clash by the Sea
        </p>

        {/* CTA Buttons - stacked on mobile, touch-friendly sizes */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 sm:gap-5 lg:gap-6 w-full sm:w-auto max-w-[280px] sm:max-w-none">
          <a href="/beach-battle/register"
            className="group relative px-6 py-4 sm:px-8 sm:py-4 lg:px-10 lg:py-5 rounded-xl font-semibold uppercase tracking-wider text-sm lg:text-base overflow-hidden transition-all duration-500 text-center active:scale-95"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(14, 116, 144, 0.4) 100%)',
              border: '1.5px solid rgba(6, 182, 212, 0.6)', color: '#e0f2fe',
              boxShadow: '0 0 25px rgba(6, 182, 212, 0.12), inset 0 0 15px rgba(6, 182, 212, 0.05)',
              minHeight: '48px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 45px rgba(6, 182, 212, 0.35), inset 0 0 25px rgba(6, 182, 212, 0.12)'
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.9)'
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 25px rgba(6, 182, 212, 0.12), inset 0 0 15px rgba(6, 182, 212, 0.05)'
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.6)'
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
            }}>
            <span className="relative z-10">Enter the Battle</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </a>

          <a href="#tribes"
            className="group relative px-6 py-4 sm:px-8 sm:py-4 lg:px-10 lg:py-5 rounded-xl font-semibold uppercase tracking-wider text-sm lg:text-base overflow-hidden transition-all duration-500 text-center active:scale-95"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              background: 'linear-gradient(135deg, rgba(209, 160, 88, 0.15) 0%, rgba(180, 120, 60, 0.25) 100%)',
              border: '1.5px solid rgba(209, 160, 88, 0.45)', color: '#fde68a',
              boxShadow: '0 0 25px rgba(209, 160, 88, 0.08), inset 0 0 15px rgba(209, 160, 88, 0.04)',
              minHeight: '48px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 45px rgba(209, 160, 88, 0.25), inset 0 0 25px rgba(209, 160, 88, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(209, 160, 88, 0.8)'
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 25px rgba(209, 160, 88, 0.08), inset 0 0 15px rgba(209, 160, 88, 0.04)'
              e.currentTarget.style.borderColor = 'rgba(209, 160, 88, 0.45)'
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
            }}>
            <span className="relative z-10">Discover The Tribes</span>
          </a>
        </div>
      </div>

      {/* Scroll indicator - larger tap target on mobile */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 animate-bounce">
        <span className="text-[10px] uppercase tracking-[0.3em]"
          style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(148, 216, 240, 0.45)' }}>
          Dive In
        </span>
        <svg className="w-4 h-4 opacity-40" fill="none" stroke="rgba(148, 216, 240, 0.6)" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {/* Audio Toggle - accessible tap target */}
      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-black/60 backdrop-blur-sm border border-cyan-500/40 hover:border-cyan-400/70 transition-all duration-300 active:scale-90"
        style={{ boxShadow: '0 4px 12px rgba(6, 182, 212, 0.12)', minWidth: '48px', minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
