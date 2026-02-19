'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { QRCodeSVG } from 'qrcode.react'
import Link from 'next/link'

const TRIBES = [
  { name: 'Lava', color: '#ef4444', icon: '\uD83D\uDD25', element: 'Fire' },
  { name: 'Rain', color: '#3b82f6', icon: '\uD83C\uDF27\uFE0F', element: 'Water' },
  { name: 'Wind', color: '#e0e0e0', icon: '\uD83C\uDF2C\uFE0F', element: 'Air' },
  { name: 'Mountain', color: '#a78bfa', icon: '\uD83C\uDFD4\uFE0F', element: 'Earth' },
]

interface SlotStatus {
  total: number
  maxPlayers: number
  isFull: boolean
  tribes: { tribe: string; count: number; maxPerTribe: number }[]
}

export function QRRegistrationSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [slotStatus, setSlotStatus] = useState<SlotStatus | null>(null)
  const [registerUrl, setRegisterUrl] = useState('')

  // Build registration URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRegisterUrl(`${window.location.origin}/beach-battle/register`)
    }
  }, [])

  // Fetch slot status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/beach-battle/register?status=true')
        const data = await res.json()
        if (data.success && data.data) {
          setSlotStatus(data.data)
        }
      } catch {
        // silent fail
      }
    }
    fetchStatus()
    // Refresh every 30s
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  // Entrance animation
  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.fromTo(contentRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: contentRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
          }
        )
      }
    }, sectionRef)
    return () => { ctx.revert() }
  }, [])

  const isFull = slotStatus?.isFull ?? false
  const slotsLeft = slotStatus ? slotStatus.maxPlayers - slotStatus.total : null
  const displayColor = (t: typeof TRIBES[0]) => t.name === 'Mountain' ? '#c4b5fd' : t.color

  return (
    <section
      ref={sectionRef}
      id="qr-register"
      aria-label="QR Registration"
      className="relative w-full py-14 sm:py-20 md:py-28 lg:py-32 overflow-hidden"
    >
      {/* Subtle section overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.45]"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.5) 100%)' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-60 h-60 sm:w-72 sm:h-72 md:w-[500px] md:h-[500px] rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25), transparent 60%)', filter: 'blur(80px)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div ref={contentRef} className="max-w-sm sm:max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto opacity-0">
          {/* Desktop: side-by-side layout */}
          <div className="lg:flex lg:items-center lg:gap-12 xl:gap-16">

          {/* Left column: Text + tribe slots */}
          <div className="lg:flex-1 text-center lg:text-left">
          {/* Header */}
          <p className="text-sm sm:text-base uppercase tracking-[0.35em] mb-3"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6, 182, 212, 0.6)' }}>
            Enter The Arena
          </p>
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase mb-3"
            style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#e2e8f0', textShadow: '0 0 40px rgba(6, 182, 212, 0.2), 2px 4px 8px rgba(0,0,0,0.6)' }}>
            Discover Your Tribe
          </h2>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-white/50 max-w-xs sm:max-w-sm lg:max-w-md mx-auto lg:mx-0 mb-6"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            Scan the QR code to register. The Ocean will assign you to one of four elemental tribes.
          </p>

          {/* Slot Status Badge */}
          {slotsLeft !== null && (
            <div className="mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isFull ? 'border-red-500/25' : ''}`}
                style={{
                  background: isFull
                    ? 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(0,0,0,0.3) 100%)'
                    : 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(0,0,0,0.3) 100%)',
                  border: `1px solid ${isFull ? 'rgba(239,68,68,0.25)' : 'rgba(6,182,212,0.2)'}`,
                }}>
                <div className={`w-2 h-2 rounded-full ${isFull ? 'bg-red-500' : slotsLeft <= 4 ? 'bg-amber-500' : 'bg-cyan-500'} animate-pulse`} />
                <span className="text-xs sm:text-sm uppercase tracking-wider"
                  style={{
                    fontFamily: "'BlinkerSemiBold', sans-serif",
                    color: isFull ? '#fca5a5' : slotsLeft <= 4 ? '#fcd34d' : 'rgba(6,182,212,0.7)',
                  }}>
                  {isFull ? 'Arena Full \u2014 Try Next Slot' : `${slotsLeft} of 16 slots open`}
                </span>
              </div>
            </div>
          )}

          {/* Live tribe slots */}
          {slotStatus && (
            <div className="flex justify-center lg:justify-start gap-3 sm:gap-4 mb-8">
              {TRIBES.map((t) => {
                const count = slotStatus.tribes.find((s) => s.tribe === t.name)?.count ?? 0
                const full = count >= 4
                return (
                  <div key={t.name} className="text-center">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl mx-auto mb-1.5 transition-all ${full ? 'opacity-30 grayscale' : ''}`}
                      style={{
                        background: `radial-gradient(circle at 40% 35%, ${displayColor(t)}55, ${displayColor(t)}20)`,
                        border: `1px solid ${displayColor(t)}${full ? '15' : '30'}`,
                        boxShadow: full ? 'none' : `0 0 14px ${displayColor(t)}15`,
                      }}>
                      {t.icon}
                    </div>
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold"
                      style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: full ? 'rgba(255,255,255,0.2)' : `${displayColor(t)}` }}>
                      {t.name}
                    </p>
                    <p className="text-[9px] sm:text-[10px]"
                      style={{ fontFamily: "'BlinkerRegular', sans-serif", color: full ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.35)' }}>
                      {count}/4
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Desktop-only motivational quote */}
          <div className="hidden lg:block mb-6">
            <div className="rounded-xl p-4" style={{ background: 'linear-gradient(145deg, rgba(6,30,50,0.3) 0%, rgba(0,0,0,0.4) 100%)', border: '1px solid rgba(6,182,212,0.1)' }}>
              <p className="text-sm xl:text-base text-white/30 italic" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                &ldquo;The ocean does not choose the strongest. It chooses those brave enough to answer.&rdquo;
              </p>
            </div>
          </div>
          </div>{/* end left column */}

          {/* Right column: QR + CTA */}
          <div className="lg:flex-1 text-center">
          {/* QR Code — real scannable QR */}
          <div className="mb-6 sm:mb-8">
            <Link href="/beach-battle/register"
              className={`inline-block p-4 sm:p-6 rounded-2xl transition-all duration-300 group ${isFull ? 'opacity-50 pointer-events-none' : 'hover:scale-[1.02]'}`}
              style={{
                background: 'linear-gradient(145deg, rgba(6, 30, 50, 0.5) 0%, rgba(0,0,0,0.7) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                boxShadow: '0 0 40px rgba(6, 182, 212, 0.06)',
              }}>
              <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-3 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.97) 0%, rgba(230,240,250,0.97) 100%)',
                  boxShadow: '0 0 25px rgba(6, 182, 212, 0.1)',
                }}>
                {registerUrl ? (
                  <QRCodeSVG
                    value={registerUrl}
                    size={160}
                    bgColor="transparent"
                    fgColor="#0a1628"
                    level="M"
                    includeMargin={false}
                    className="w-32 h-32 sm:w-40 sm:h-40"
                  />
                ) : (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 animate-pulse bg-gray-200 rounded" />
                )}
                {/* Pulse overlay */}
                <div className="absolute inset-0 rounded-xl" style={{ animation: 'qrPulse 3s ease-in-out infinite' }} />
              </div>
              <p className="text-xs sm:text-sm uppercase tracking-wider group-hover:text-cyan-300 transition-colors"
                style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(6, 182, 212, 0.4)' }}>
                {isFull ? 'Arena is full' : 'Scan to register'}
              </p>
            </Link>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 max-w-[180px] mx-auto mb-6 sm:mb-8">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.2))' }} />
            <span className="text-xs uppercase tracking-wider" style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(6, 182, 212, 0.3)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.2), transparent)' }} />
          </div>

          {/* Register button */}
          {!isFull ? (
            <Link href="/beach-battle/register"
              className="inline-block px-7 py-4 sm:px-10 sm:py-5 rounded-xl font-semibold uppercase tracking-wider text-sm transition-all duration-500 relative overflow-hidden group active:scale-95"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(14, 116, 144, 0.3) 100%)',
                border: '1.5px solid rgba(6, 182, 212, 0.4)', color: '#e0f2fe',
                boxShadow: '0 0 35px rgba(6, 182, 212, 0.1)', minHeight: '48px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 55px rgba(6, 182, 212, 0.25)' }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 35px rgba(6, 182, 212, 0.1)' }}>
              <span className="relative z-10">{'\u2726'} Register Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          ) : (
            <div className="inline-block px-7 py-4 sm:px-10 sm:py-5 rounded-xl font-semibold uppercase tracking-wider text-sm opacity-50 cursor-not-allowed"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
                background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(0,0,0,0.3) 100%)',
                border: '1.5px solid rgba(239,68,68,0.25)', color: '#fca5a5',
                minHeight: '48px',
              }}>
              {'\u2694\uFE0F'} Arena Full — Try Next Slot
            </div>
          )}
          </div>{/* end right column */}
          </div>{/* end flex */}
        </div>
      </div>

      <style jsx>{`
        @keyframes qrPulse {
          0%, 100% { box-shadow: inset 0 0 20px rgba(6, 182, 212, 0.03); }
          50% { box-shadow: inset 0 0 40px rgba(6, 182, 212, 0.1); }
        }
      `}</style>
    </section>
  )
}
