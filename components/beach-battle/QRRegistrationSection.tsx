'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap, createTimeline } from '@/lib/gsap'

const TRIBES = [
  { name: 'Lava', color: '#ef4444', glowColor: 'rgba(239, 68, 68, 0.5)', icon: '\uD83D\uDD25', borderColor: '#ef4444', bgFrom: '#7f1d1d', bgTo: '#991b1b' },
  { name: 'Rain', color: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.5)', icon: '\uD83C\uDF27\uFE0F', borderColor: '#3b82f6', bgFrom: '#1e3a8a', bgTo: '#1d4ed8' },
  { name: 'Wind', color: '#e0e0e0', glowColor: 'rgba(224, 224, 224, 0.4)', icon: '\uD83C\uDF2C\uFE0F', borderColor: '#ccc', bgFrom: '#4b5563', bgTo: '#6b7280' },
  { name: 'Mountain', color: '#555', glowColor: 'rgba(85, 85, 85, 0.5)', icon: '\uD83C\uDFD4\uFE0F', borderColor: '#666', bgFrom: '#1a1a1a', bgTo: '#333' },
]

export function QRRegistrationSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const revealRef = useRef<HTMLDivElement>(null)
  const [isRevealing, setIsRevealing] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [revealResult, setRevealResult] = useState<{ tribe: typeof TRIBES[0]; slot: string; table: number; playerId: string } | null>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.fromTo(contentRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: contentRef.current, start: 'top 80%', toggleActions: 'play none none reverse' } }
        )
      }
    }, sectionRef)
    return () => { ctx.revert() }
  }, [])

  // Animate result card when revealed
  useEffect(() => {
    if (!isRevealed || !revealRef.current) return
    const ctx = gsap.context(() => {
      const tl = createTimeline()
      tl.fromTo(revealRef.current,
        { opacity: 0, scale: 0.8, rotationY: -30 },
        { opacity: 1, scale: 1, rotationY: 0, duration: 0.8, ease: 'back.out(1.4)' }
      )
    })
    return () => { ctx.revert() }
  }, [isRevealed])

  const handleReveal = useCallback(() => {
    if (isRevealing || isRevealed) return
    setIsRevealing(true)

    const tribe = TRIBES[Math.floor(Math.random() * TRIBES.length)]
    const slotNum = String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')
    const slot = `${tribe.name.toUpperCase()}-${slotNum}`
    const table = Math.floor(Math.random() * 4) + 1
    const playerId = `ZBB-${tribe.name.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    // Delay reveal for suspense
    setTimeout(() => {
      setRevealResult({ tribe, slot, table, playerId })
      setIsRevealing(false)
      setIsRevealed(true)
    }, 2500)
  }, [isRevealing, isRevealed])

  const handleReset = () => {
    setIsRevealed(false)
    setIsRevealing(false)
    setRevealResult(null)
  }

  // Generate and download a stunning tribal badge
  const downloadBadge = useCallback(() => {
    if (!revealResult) return

    const canvas = document.createElement('canvas')
    const W = 600, H = 1000
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const tc = revealResult.tribe.color
    const isDark = revealResult.tribe.name === 'Mountain'

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
    bgGrad.addColorStop(0, '#050a14')
    bgGrad.addColorStop(0.4, '#0a1628')
    bgGrad.addColorStop(0.6, '#0c1a30')
    bgGrad.addColorStop(1, '#050a14')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    // Radial tribe glow behind content
    const glowGrad = ctx.createRadialGradient(W/2, 350, 0, W/2, 350, 280)
    glowGrad.addColorStop(0, isDark ? 'rgba(100,100,100,0.08)' : `${tc}12`)
    glowGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = glowGrad
    ctx.fillRect(0, 50, W, 600)

    // Outer ornate border
    ctx.strokeStyle = isDark ? '#555' : tc
    ctx.lineWidth = 2
    ctx.strokeRect(20, 20, W - 40, H - 40)
    // Inner border
    ctx.strokeStyle = isDark ? 'rgba(100,100,100,0.3)' : `${tc}40`
    ctx.lineWidth = 1
    ctx.strokeRect(30, 30, W - 60, H - 60)

    // Corner ornaments
    const drawCorner = (x: number, y: number, dx: number, dy: number) => {
      ctx.strokeStyle = isDark ? '#777' : tc
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(x + dx * 35, y)
      ctx.lineTo(x, y)
      ctx.lineTo(x, y + dy * 35)
      ctx.stroke()
      // Decorative diamond
      ctx.fillStyle = isDark ? '#555' : tc
      ctx.beginPath()
      ctx.moveTo(x + dx * 8, y + dy * 8)
      ctx.lineTo(x + dx * 12, y + dy * 4)
      ctx.lineTo(x + dx * 16, y + dy * 8)
      ctx.lineTo(x + dx * 12, y + dy * 12)
      ctx.closePath()
      ctx.fill()
    }
    drawCorner(40, 40, 1, 1)
    drawCorner(W - 40, 40, -1, 1)
    drawCorner(40, H - 40, 1, -1)
    drawCorner(W - 40, H - 40, -1, -1)

    // Header text
    ctx.font = '12px sans-serif'
    ctx.fillStyle = isDark ? 'rgba(180,180,180,0.5)' : `${tc}70`
    ctx.textAlign = 'center'
    ctx.letterSpacing = '6px'
    ctx.fillText('Z A M B A A R A   B E A C H   B A T T L E', W / 2, 85)

    // Decorative line under header
    const lineGrad = ctx.createLinearGradient(150, 0, W - 150, 0)
    lineGrad.addColorStop(0, 'transparent')
    lineGrad.addColorStop(0.5, isDark ? '#555' : tc)
    lineGrad.addColorStop(1, 'transparent')
    ctx.strokeStyle = lineGrad
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(150, 100)
    ctx.lineTo(W - 150, 100)
    ctx.stroke()

    // Tribe icon (emoji as text)
    ctx.font = '90px serif'
    ctx.textAlign = 'center'
    ctx.fillText(revealResult.tribe.icon, W / 2, 220)

    // Tribe name large
    ctx.font = 'bold 56px sans-serif'
    ctx.fillStyle = isDark ? '#c8c8c8' : tc
    ctx.fillText(revealResult.tribe.name.toUpperCase(), W / 2, 300)

    // Subtitle
    ctx.font = '14px sans-serif'
    ctx.fillStyle = isDark ? 'rgba(180,180,180,0.6)' : `${tc}90`
    ctx.fillText('W A R R I O R   O F   T H E   T I D E S', W / 2, 335)

    // Decorative separator
    ctx.strokeStyle = lineGrad
    ctx.beginPath()
    ctx.moveTo(160, 365)
    ctx.lineTo(W - 160, 365)
    ctx.stroke()

    // Small diamond at center of line
    ctx.fillStyle = isDark ? '#555' : tc
    ctx.beginPath()
    ctx.moveTo(W / 2, 360)
    ctx.lineTo(W / 2 + 5, 365)
    ctx.lineTo(W / 2, 370)
    ctx.lineTo(W / 2 - 5, 365)
    ctx.closePath()
    ctx.fill()

    // Info fields
    const drawField = (label: string, value: string, y: number) => {
      // Label
      ctx.font = '10px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.textAlign = 'center'
      ctx.fillText(label.toUpperCase(), W / 2, y)
      // Value
      ctx.font = 'bold 24px sans-serif'
      ctx.fillStyle = '#e2e8f0'
      ctx.fillText(value, W / 2, y + 32)
      // Underline
      const ulGrad = ctx.createLinearGradient(200, 0, W - 200, 0)
      ulGrad.addColorStop(0, 'transparent')
      ulGrad.addColorStop(0.5, 'rgba(255,255,255,0.08)')
      ulGrad.addColorStop(1, 'transparent')
      ctx.strokeStyle = ulGrad
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(200, y + 45)
      ctx.lineTo(W - 200, y + 45)
      ctx.stroke()
    }

    drawField('Player ID', revealResult.playerId, 410)
    drawField('Battle Slot', revealResult.slot, 485)
    drawField('Arena Table', `Table ${revealResult.table}`, 560)

    // Tribe element badge
    ctx.font = 'bold 13px sans-serif'
    ctx.fillStyle = isDark ? '#888' : tc
    ctx.fillText(`\u2726  ${revealResult.tribe.name.toUpperCase()} TRIBE  \u2726`, W / 2, 650)

    // Bottom ornament
    ctx.strokeStyle = lineGrad
    ctx.beginPath()
    ctx.moveTo(160, 680)
    ctx.lineTo(W - 160, 680)
    ctx.stroke()

    // Radial glow behind tribe area
    const bGlow = ctx.createRadialGradient(W/2, 700, 0, W/2, 700, 200)
    bGlow.addColorStop(0, isDark ? 'rgba(100,100,100,0.04)' : `${tc}06`)
    bGlow.addColorStop(1, 'transparent')
    ctx.fillStyle = bGlow
    ctx.fillRect(0, 500, W, 400)

    // Motivational text
    ctx.font = 'italic 14px sans-serif'
    ctx.fillStyle = 'rgba(148, 216, 240, 0.35)'
    ctx.fillText('"The Ocean chose you. Now prove your worth."', W / 2, 730)

    // Logo / website
    ctx.font = 'bold 18px sans-serif'
    ctx.fillStyle = isDark ? 'rgba(150,150,150,0.4)' : `${tc}40`
    ctx.fillText('ZAMBAARA', W / 2, 900)
    ctx.font = '10px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.fillText('zambaara.com', W / 2, 920)

    // Bottom border accent
    ctx.strokeStyle = isDark ? '#444' : tc
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(150, H - 30)
    ctx.lineTo(W - 150, H - 30)
    ctx.stroke()

    // Download
    const link = document.createElement('a')
    link.download = `zambaara-warrior-badge-${revealResult.slot.toLowerCase()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [revealResult])

  return (
    <section
      ref={sectionRef}
      id="qr-register"
      aria-label="QR Registration"
      className="relative w-full py-14 sm:py-20 md:py-28 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #000 0%, #041020 40%, #08192e 60%, #041020 80%, #000 100%)' }}
    >
      {/* Mystical ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-60 h-60 sm:w-72 sm:h-72 md:w-[500px] md:h-[500px] rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25), transparent 60%)', filter: 'blur(80px)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div ref={contentRef} className="max-w-sm sm:max-w-lg mx-auto text-center opacity-0">
          {/* Header */}
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] mb-3"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6, 182, 212, 0.6)' }}>
            Enter The Arena
          </p>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold uppercase mb-3"
            style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#e2e8f0', textShadow: '0 0 40px rgba(6, 182, 212, 0.2), 2px 4px 8px rgba(0,0,0,0.6)' }}>
            Discover Your Element
          </h2>
          <p className="text-xs sm:text-sm text-white/40 max-w-xs sm:max-w-sm mx-auto mb-8"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            The Ocean decides your fate. Scan the QR code or tap below to discover which tribe claims you.
          </p>

          {/* QR Code */}
          <div className="mb-6 sm:mb-8">
            <div className="inline-block p-4 sm:p-6 rounded-2xl"
              style={{ background: 'linear-gradient(145deg, rgba(6, 30, 50, 0.5) 0%, rgba(0,0,0,0.7) 100%)', border: '1px solid rgba(6, 182, 212, 0.2)', boxShadow: '0 0 40px rgba(6, 182, 212, 0.06)' }}>
              <div className="w-36 h-36 sm:w-44 sm:h-44 mx-auto mb-3 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(220,230,240,0.95) 100%)', boxShadow: '0 0 25px rgba(6, 182, 212, 0.1)' }}>
                <svg viewBox="0 0 200 200" className="w-28 h-28 sm:w-36 sm:h-36" fill="#0a1628">
                  <rect x="20" y="20" width="50" height="50" rx="4" /><rect x="130" y="20" width="50" height="50" rx="4" />
                  <rect x="20" y="130" width="50" height="50" rx="4" />
                  <rect x="28" y="28" width="34" height="34" rx="2" fill="white" /><rect x="138" y="28" width="34" height="34" rx="2" fill="white" />
                  <rect x="28" y="138" width="34" height="34" rx="2" fill="white" />
                  <rect x="38" y="38" width="14" height="14" rx="1" /><rect x="148" y="38" width="14" height="14" rx="1" />
                  <rect x="38" y="148" width="14" height="14" rx="1" />
                  <rect x="80" y="20" width="10" height="10" rx="1" /><rect x="95" y="20" width="10" height="10" rx="1" />
                  <rect x="110" y="20" width="10" height="10" rx="1" /><rect x="80" y="35" width="10" height="10" rx="1" />
                  <rect x="80" y="80" width="10" height="10" rx="1" /><rect x="95" y="80" width="10" height="10" rx="1" />
                  <rect x="110" y="80" width="10" height="10" rx="1" /><rect x="80" y="95" width="10" height="10" rx="1" />
                  <rect x="130" y="80" width="10" height="10" rx="1" /><rect x="160" y="80" width="10" height="10" rx="1" />
                  <rect x="130" y="95" width="10" height="10" rx="1" /><rect x="160" y="95" width="10" height="10" rx="1" />
                  <rect x="20" y="80" width="10" height="10" rx="1" /><rect x="50" y="80" width="10" height="10" rx="1" />
                  <rect x="130" y="130" width="10" height="10" rx="1" /><rect x="160" y="160" width="10" height="10" rx="1" />
                  <rect x="80" y="130" width="10" height="10" rx="1" /><rect x="110" y="160" width="10" height="10" rx="1" />
                </svg>
                <div className="absolute inset-0 rounded-xl" style={{ animation: 'qrPulse 3s ease-in-out infinite' }} />
              </div>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider"
                style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(6, 182, 212, 0.4)' }}>
                Scan with your phone camera
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 max-w-[180px] mx-auto mb-6 sm:mb-8">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.2))' }} />
            <span className="text-[9px] uppercase tracking-wider" style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(6, 182, 212, 0.3)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.2), transparent)' }} />
          </div>

          {/* Reveal button */}
          {!isRevealing && !isRevealed && (
            <button onClick={handleReveal}
              className="px-7 py-4 sm:px-10 sm:py-5 rounded-xl font-semibold uppercase tracking-wider text-sm transition-all duration-500 relative overflow-hidden group active:scale-95"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(14, 116, 144, 0.3) 100%)',
                border: '1.5px solid rgba(6, 182, 212, 0.4)', color: '#e0f2fe',
                boxShadow: '0 0 35px rgba(6, 182, 212, 0.1)',
                minHeight: '48px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 55px rgba(6, 182, 212, 0.25)'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)' }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 35px rgba(6, 182, 212, 0.1)'; e.currentTarget.style.transform = 'translateY(0) scale(1)' }}>
              <span className="relative z-10">\u2726 Discover Your Element</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          )}

          {/* Reveal Phase: Ocean is choosing */}
          {isRevealing && (
            <div className="flex flex-col items-center justify-center py-8">
              {/* Spinning elemental symbols */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-5">
                <div className="absolute inset-0" style={{ animation: 'oceanSpin 2s linear infinite' }}>
                  <svg width="100%" height="100%" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="38" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1.5" strokeDasharray="6 4" />
                    <circle cx="40" cy="40" r="28" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1" strokeDasharray="4 3" />
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center" style={{ animation: 'oceanSpin 3s linear infinite reverse' }}>
                  <div className="text-2xl sm:text-3xl" style={{ animation: 'elementCycle 2s steps(4) infinite' }}>
                    {'\uD83D\uDD25'}
                  </div>
                </div>
              </div>
              <p className="uppercase tracking-[0.15em] text-xs sm:text-sm"
                style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(6, 182, 212, 0.8)', animation: 'tribePulseText 1.5s ease-in-out infinite' }}>
                The Ocean is Choosing\u2026
              </p>
            </div>
          )}

          {/* Result: Tribe + Badge */}
          {isRevealed && revealResult && (
            <div ref={revealRef} className="py-4 sm:py-6" style={{ perspective: '1200px' }}>
              {/* Tribe icon with glow */}
              <div className="text-5xl sm:text-6xl mb-3"
                style={{ filter: `drop-shadow(0 0 25px ${revealResult.tribe.glowColor})` }}>
                {revealResult.tribe.icon}
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] mb-1"
                style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(148, 216, 240, 0.5)' }}>
                You belong to the
              </p>
              <h3 className="text-3xl sm:text-4xl uppercase font-bold mb-4"
                style={{
                  fontFamily: "'TheWalkyrDemo', serif",
                  color: revealResult.tribe.name === 'Mountain' ? '#c8c8c8' : revealResult.tribe.color,
                  textShadow: `0 0 25px ${revealResult.tribe.glowColor}`,
                }}>
                {revealResult.tribe.name} Tribe
              </h3>

              {/* Warrior badge card - immersive design */}
              <div className="inline-block rounded-xl p-4 sm:p-5 mb-5 min-w-[260px] sm:min-w-[300px] relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(6, 30, 50, 0.6) 0%, rgba(0,0,0,0.75) 100%)',
                  border: `1.5px solid ${revealResult.tribe.name === 'Mountain' ? 'rgba(100,100,100,0.3)' : `${revealResult.tribe.color}30`}`,
                  boxShadow: `0 0 30px ${revealResult.tribe.glowColor.replace('0.5', '0.08')}`,
                }}>
                {/* Corner accents */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l"
                  style={{ borderColor: revealResult.tribe.name === 'Mountain' ? '#555' : `${revealResult.tribe.color}40` }} />
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r"
                  style={{ borderColor: revealResult.tribe.name === 'Mountain' ? '#555' : `${revealResult.tribe.color}40` }} />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l"
                  style={{ borderColor: revealResult.tribe.name === 'Mountain' ? '#555' : `${revealResult.tribe.color}40` }} />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r"
                  style={{ borderColor: revealResult.tribe.name === 'Mountain' ? '#555' : `${revealResult.tribe.color}40` }} />

                {/* Badge header */}
                <p className="text-[8px] uppercase tracking-[0.3em] mb-3"
                  style={{
                    fontFamily: "'BlinkerRegular', sans-serif",
                    color: revealResult.tribe.name === 'Mountain' ? 'rgba(150,150,150,0.5)' : `${revealResult.tribe.color}60`,
                  }}>
                  Warrior Badge
                </p>

                <div className="space-y-2.5 text-left">
                  {[
                    { label: 'Player ID', value: revealResult.playerId },
                    { label: 'Battle Slot', value: revealResult.slot },
                    { label: 'Arena Table', value: `Table ${revealResult.table}` },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase tracking-wider"
                          style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.3)' }}>
                          {item.label}
                        </span>
                        <span className="text-xs sm:text-sm font-bold"
                          style={{
                            fontFamily: "'BlinkerSemiBold', sans-serif",
                            color: revealResult.tribe.name === 'Mountain' ? '#c8c8c8' : revealResult.tribe.color,
                          }}>
                          {item.value}
                        </span>
                      </div>
                      {i < 2 && (
                        <div className="h-px mt-2"
                          style={{
                            background: `linear-gradient(90deg, transparent, ${
                              revealResult.tribe.name === 'Mountain' ? 'rgba(100,100,100,0.12)' : `${revealResult.tribe.color}12`
                            }, transparent)`,
                          }} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Tribe element badge at bottom */}
                <div className="mt-3 pt-2 text-center">
                  <p className="text-[8px] uppercase tracking-[0.2em]"
                    style={{
                      fontFamily: "'BlinkerSemiBold', sans-serif",
                      color: revealResult.tribe.name === 'Mountain' ? 'rgba(150,150,150,0.6)' : `${revealResult.tribe.color}70`,
                    }}>
                    \u2726 {revealResult.tribe.name} Warrior \u2726
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 max-w-[260px] sm:max-w-[300px] mx-auto">
                <button onClick={downloadBadge}
                  className="w-full px-5 py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-95 font-semibold relative overflow-hidden group"
                  style={{
                    fontFamily: "'BlinkerSemiBold', sans-serif",
                    background: `linear-gradient(135deg, ${
                      revealResult.tribe.name === 'Mountain' ? 'rgba(100,100,100,0.2)' : `${revealResult.tribe.color}20`
                    } 0%, rgba(0,0,0,0.5) 100%)`,
                    border: `1.5px solid ${revealResult.tribe.name === 'Mountain' ? 'rgba(100,100,100,0.4)' : `${revealResult.tribe.color}40`}`,
                    color: revealResult.tribe.name === 'Mountain' ? '#c8c8c8' : revealResult.tribe.color,
                    boxShadow: `0 0 20px ${revealResult.tribe.glowColor.replace('0.5', '0.1')}`,
                    minHeight: '48px',
                  }}>
                  <span className="relative z-10">\u2726 Download Your Badge</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
                <button onClick={handleReset}
                  className="w-full px-4 py-2.5 rounded-xl text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-95"
                  style={{
                    fontFamily: "'BlinkerRegular', sans-serif",
                    border: '1px solid rgba(6, 182, 212, 0.15)',
                    color: 'rgba(6, 182, 212, 0.4)',
                    minHeight: '40px',
                  }}>
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes oceanSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes qrPulse { 0%, 100% { box-shadow: inset 0 0 20px rgba(6, 182, 212, 0.03); } 50% { box-shadow: inset 0 0 40px rgba(6, 182, 212, 0.1); } }
        @keyframes tribePulseText { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes elementCycle {
          0% { content: '\uD83D\uDD25'; }
          25% { content: '\uD83C\uDF27'; }
          50% { content: '\uD83C\uDF2C'; }
          75% { content: '\uD83C\uDFD4'; }
        }
      `}</style>
    </section>
  )
}
