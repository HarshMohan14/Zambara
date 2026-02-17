'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, createTimeline } from '@/lib/gsap'

const TRIBES = [
  { name: 'Lava', color: '#ef4444', icon: '🔥' },
  { name: 'Rain', color: '#06b6d4', icon: '🌧' },
  { name: 'Wind', color: '#a78bfa', icon: '🌬' },
  { name: 'Mountain', color: '#d1a058', icon: '🏔' },
]

export function QRRegistrationSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const revealRef = useRef<HTMLDivElement>(null)
  const [isRevealing, setIsRevealing] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [revealResult, setRevealResult] = useState<{ tribe: typeof TRIBES[0]; slot: string; table: number } | null>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.fromTo(contentRef.current,
          { opacity: 0, y: 60 },
          {
            opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: contentRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
          }
        )
      }
    }, sectionRef)

    return () => { ctx.revert() }
  }, [])

  const handleReveal = () => {
    if (isRevealing || isRevealed) return
    setIsRevealing(true)

    // Pick random tribe and slot
    const tribe = TRIBES[Math.floor(Math.random() * TRIBES.length)]
    const slotNum = String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')
    const slot = `${tribe.name}-${slotNum}`
    const table = Math.floor(Math.random() * 2) + 1

    // Animate the reveal
    if (revealRef.current) {
      const tl = createTimeline()

      // Phase 1: "The Ocean is Choosing..."
      tl.call(() => {
        if (revealRef.current) {
          revealRef.current.innerHTML = ''
          const choosing = document.createElement('div')
          choosing.className = 'text-center'
          choosing.innerHTML = `
            <div class="mb-6">
              <div class="inline-block animate-spin-slow" style="animation: oceanSpin 3s linear infinite;">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  <circle cx="30" cy="30" r="28" stroke="rgba(6, 182, 212, 0.3)" stroke-width="2" stroke-dasharray="8 4" />
                  <circle cx="30" cy="30" r="18" stroke="rgba(6, 182, 212, 0.6)" stroke-width="1.5" stroke-dasharray="6 3" />
                  <circle cx="30" cy="30" r="4" fill="rgba(6, 182, 212, 0.8)" />
                </svg>
              </div>
            </div>
            <p style="font-family: 'BlinkerRegular', sans-serif; color: rgba(6, 182, 212, 0.8); font-size: 18px; letter-spacing: 0.15em;" class="uppercase">
              The Ocean is Choosing...
            </p>
          `
          revealRef.current.appendChild(choosing)
          gsap.fromTo(choosing, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' })
        }
      })

      // Phase 2: Reveal result after 2.5s
      tl.call(() => {
        setRevealResult({ tribe, slot, table })

        if (revealRef.current) {
          gsap.to(revealRef.current.children[0], {
            opacity: 0, scale: 0.5, duration: 0.4, ease: 'power2.in',
            onComplete: () => {
              if (!revealRef.current) return
              revealRef.current.innerHTML = ''

              const result = document.createElement('div')
              result.className = 'text-center'
              result.innerHTML = `
                <div class="text-5xl md:text-6xl mb-4">${tribe.icon}</div>
                <p style="font-family: 'BlinkerRegular', sans-serif; color: rgba(148, 216, 240, 0.7); font-size: 14px; letter-spacing: 0.2em;" class="uppercase mb-2">
                  You belong to the
                </p>
                <h3 style="font-family: 'TheWalkyrDemo', serif; color: ${tribe.color}; text-shadow: 0 0 30px ${tribe.color}60; font-size: 2.5rem;" class="uppercase font-bold mb-6">
                  ${tribe.name} Tribe
                </h3>
                <div style="background: rgba(6, 30, 50, 0.5); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 12px; padding: 20px;" class="mb-6 inline-block min-w-[260px]">
                  <div class="grid grid-cols-1 gap-3 text-left">
                    <div class="flex justify-between items-center">
                      <span style="font-family: 'BlinkerRegular', sans-serif; color: rgba(255,255,255,0.4); font-size: 12px;" class="uppercase tracking-wider">Player ID</span>
                      <span style="font-family: 'BlinkerSemiBold', sans-serif; color: ${tribe.color}; font-size: 16px;">${slot}</span>
                    </div>
                    <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.15), transparent);"></div>
                    <div class="flex justify-between items-center">
                      <span style="font-family: 'BlinkerRegular', sans-serif; color: rgba(255,255,255,0.4); font-size: 12px;" class="uppercase tracking-wider">Tribe</span>
                      <span style="font-family: 'BlinkerSemiBold', sans-serif; color: #e2e8f0; font-size: 16px;">${tribe.name}</span>
                    </div>
                    <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.15), transparent);"></div>
                    <div class="flex justify-between items-center">
                      <span style="font-family: 'BlinkerRegular', sans-serif; color: rgba(255,255,255,0.4); font-size: 12px;" class="uppercase tracking-wider">Table</span>
                      <span style="font-family: 'BlinkerSemiBold', sans-serif; color: #e2e8f0; font-size: 16px;">Table ${table}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    class="px-6 py-3 rounded-lg text-sm uppercase tracking-wider transition-all duration-300 hover:scale-105"
                    style="font-family: 'BlinkerSemiBold', sans-serif; background: linear-gradient(135deg, ${tribe.color}30 0%, ${tribe.color}15 100%); border: 1px solid ${tribe.color}60; color: ${tribe.color}; box-shadow: 0 0 20px ${tribe.color}20;"
                    id="download-badge-btn"
                  >
                    ✦ Download Badge
                  </button>
                </div>
              `
              revealRef.current.appendChild(result)
              gsap.fromTo(result, { opacity: 0, scale: 0.8, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'back.out(1.4)' })
              setIsRevealing(false)
              setIsRevealed(true)
            }
          })
        }
      }, [], '+=2.5')
    }
  }

  const handleReset = () => {
    setIsRevealed(false)
    setIsRevealing(false)
    setRevealResult(null)
    if (revealRef.current) {
      revealRef.current.innerHTML = ''
    }
  }

  return (
    <section
      ref={sectionRef}
      id="qr-register"
      aria-label="QR Registration"
      className="relative w-full py-20 md:py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #000 0%, #041020 40%, #08192e 60%, #041020 80%, #000 100%)',
      }}
    >
      {/* Mystical ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3), transparent 60%)', filter: 'blur(100px)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div ref={contentRef} className="max-w-3xl mx-auto text-center opacity-0">
          {/* Header */}
          <p
            className="text-xs sm:text-sm uppercase tracking-[0.35em] mb-4"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6, 182, 212, 0.6)' }}
          >
            Enter The Arena
          </p>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase mb-6"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#e2e8f0',
              textShadow: '0 0 40px rgba(6, 182, 212, 0.2), 2px 4px 8px rgba(0,0,0,0.6)',
            }}
          >
            Scan & Discover Your Element
          </h2>
          <p
            className="text-base md:text-lg text-white/50 max-w-xl mx-auto mb-12"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
          >
            The Ocean decides your fate. Scan the QR code or click below to discover which tribe claims you.
          </p>

          {/* QR Code Display */}
          <div className="mb-12">
            <div
              className="inline-block p-6 rounded-2xl relative"
              style={{
                background: 'linear-gradient(145deg, rgba(6, 30, 50, 0.5) 0%, rgba(0,0,0,0.7) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                boxShadow: '0 0 60px rgba(6, 182, 212, 0.1), inset 0 0 30px rgba(6, 182, 212, 0.03)',
              }}
            >
              {/* QR Placeholder */}
              <div className="w-48 h-48 md:w-56 md:h-56 mx-auto mb-4 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(220,230,240,0.95) 100%)',
                  boxShadow: '0 0 30px rgba(6, 182, 212, 0.15)',
                }}
              >
                {/* QR Pattern */}
                <svg viewBox="0 0 200 200" className="w-40 h-40 md:w-48 md:h-48" fill="#0a1628">
                  <rect x="20" y="20" width="50" height="50" rx="4" />
                  <rect x="130" y="20" width="50" height="50" rx="4" />
                  <rect x="20" y="130" width="50" height="50" rx="4" />
                  <rect x="28" y="28" width="34" height="34" rx="2" fill="white" />
                  <rect x="138" y="28" width="34" height="34" rx="2" fill="white" />
                  <rect x="28" y="138" width="34" height="34" rx="2" fill="white" />
                  <rect x="38" y="38" width="14" height="14" rx="1" />
                  <rect x="148" y="38" width="14" height="14" rx="1" />
                  <rect x="38" y="148" width="14" height="14" rx="1" />
                  {/* Pattern dots */}
                  <rect x="80" y="20" width="10" height="10" rx="1" />
                  <rect x="95" y="20" width="10" height="10" rx="1" />
                  <rect x="110" y="20" width="10" height="10" rx="1" />
                  <rect x="80" y="35" width="10" height="10" rx="1" />
                  <rect x="110" y="35" width="10" height="10" rx="1" />
                  <rect x="80" y="80" width="10" height="10" rx="1" />
                  <rect x="95" y="80" width="10" height="10" rx="1" />
                  <rect x="110" y="80" width="10" height="10" rx="1" />
                  <rect x="80" y="95" width="10" height="10" rx="1" />
                  <rect x="95" y="95" width="10" height="10" rx="1" />
                  <rect x="130" y="80" width="10" height="10" rx="1" />
                  <rect x="160" y="80" width="10" height="10" rx="1" />
                  <rect x="130" y="95" width="10" height="10" rx="1" />
                  <rect x="145" y="95" width="10" height="10" rx="1" />
                  <rect x="160" y="95" width="10" height="10" rx="1" />
                  <rect x="20" y="80" width="10" height="10" rx="1" />
                  <rect x="35" y="95" width="10" height="10" rx="1" />
                  <rect x="50" y="80" width="10" height="10" rx="1" />
                  <rect x="130" y="130" width="10" height="10" rx="1" />
                  <rect x="145" y="145" width="10" height="10" rx="1" />
                  <rect x="160" y="130" width="10" height="10" rx="1" />
                  <rect x="130" y="160" width="10" height="10" rx="1" />
                  <rect x="160" y="160" width="10" height="10" rx="1" />
                  <rect x="80" y="130" width="10" height="10" rx="1" />
                  <rect x="95" y="145" width="10" height="10" rx="1" />
                  <rect x="110" y="130" width="10" height="10" rx="1" />
                  <rect x="80" y="160" width="10" height="10" rx="1" />
                  <rect x="110" y="160" width="10" height="10" rx="1" />
                </svg>
                {/* Glow pulse */}
                <div className="absolute inset-0 rounded-xl"
                  style={{ boxShadow: 'inset 0 0 40px rgba(6, 182, 212, 0.1)', animation: 'qrPulse 3s ease-in-out infinite' }} />
              </div>
              <p className="text-xs uppercase tracking-wider mt-2"
                style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(6, 182, 212, 0.5)' }}>
                Scan with your phone camera
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 max-w-xs mx-auto mb-12">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.3))' }} />
            <span className="text-xs uppercase tracking-wider" style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(6, 182, 212, 0.4)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.3), transparent)' }} />
          </div>

          {/* Demo Reveal Button */}
          {!isRevealing && !isRevealed && (
            <button
              onClick={handleReveal}
              className="px-10 py-5 rounded-xl font-semibold uppercase tracking-wider text-base transition-all duration-500 relative overflow-hidden group"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(14, 116, 144, 0.3) 100%)',
                border: '1.5px solid rgba(6, 182, 212, 0.4)',
                color: '#e0f2fe',
                boxShadow: '0 0 40px rgba(6, 182, 212, 0.15), inset 0 0 20px rgba(6, 182, 212, 0.05)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 60px rgba(6, 182, 212, 0.3), inset 0 0 30px rgba(6, 182, 212, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.7)'
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 40px rgba(6, 182, 212, 0.15), inset 0 0 20px rgba(6, 182, 212, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)'
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
              }}
            >
              <span className="relative z-10">✦ Discover Your Element</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          )}

          {/* Reveal Container */}
          <div ref={revealRef} className="min-h-[300px] flex items-center justify-center" />

          {/* Reset Button */}
          {isRevealed && (
            <button
              onClick={handleReset}
              className="mt-6 px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105"
              style={{
                fontFamily: "'BlinkerRegular', sans-serif",
                border: '1px solid rgba(6, 182, 212, 0.2)',
                color: 'rgba(6, 182, 212, 0.5)',
                background: 'transparent',
              }}
            >
              Try Again
            </button>
          )}
        </div>
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes oceanSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes qrPulse {
          0%, 100% { box-shadow: inset 0 0 40px rgba(6, 182, 212, 0.05); }
          50% { box-shadow: inset 0 0 60px rgba(6, 182, 212, 0.15); }
        }
      `}</style>
    </section>
  )
}
