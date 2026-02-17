'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap, createTimeline } from '@/lib/gsap'

const TRIBES = [
  { name: 'Lava', color: '#ef4444', glowColor: 'rgba(239, 68, 68, 0.5)', icon: '🔥', borderColor: '#ef4444', bgFrom: '#7f1d1d', bgTo: '#991b1b', element: 'Fire' },
  { name: 'Rain', color: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.5)', icon: '🌧️', borderColor: '#3b82f6', bgFrom: '#1e3a8a', bgTo: '#1d4ed8', element: 'Water' },
  { name: 'Wind', color: '#e0e0e0', glowColor: 'rgba(224, 224, 224, 0.4)', icon: '🌬️', borderColor: '#ccc', bgFrom: '#4b5563', bgTo: '#6b7280', element: 'Air' },
  { name: 'Mountain', color: '#555', glowColor: 'rgba(85, 85, 85, 0.5)', icon: '🏔️', borderColor: '#666', bgFrom: '#1a1a1a', bgTo: '#333', element: 'Earth' },
]

export function QRRegistrationSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const revealRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const [isRevealing, setIsRevealing] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [showBadgePreview, setShowBadgePreview] = useState(false)
  const [revealResult, setRevealResult] = useState<{
    tribe: typeof TRIBES[0]
    slot: string
    table: number
    playerId: string
  } | null>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.fromTo(contentRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: contentRef.current, start: 'top 80%', toggleActions: 'play none none reverse' } }
        )
      }
    }, sectionRef)
    return () => { ctx.revert() }
  }, [])

  // Animate result with water-droplet/mist reveal
  useEffect(() => {
    if (!isRevealed || !revealRef.current) return
    const ctx = gsap.context(() => {
      const tl = createTimeline()
      // Mist dispersal reveal
      tl.fromTo(revealRef.current,
        { opacity: 0, scale: 0.85, filter: 'blur(15px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out' }
      )
    })
    return () => { ctx.revert() }
  }, [isRevealed])

  const handleReveal = useCallback(() => {
    if (isRevealing || isRevealed) return
    setIsRevealing(true)

    const tribe = TRIBES[Math.floor(Math.random() * TRIBES.length)]
    const slotNum = String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')
    const slot = `${tribe.name.substring(0, 1).toUpperCase()}${slotNum}`
    const table = Math.floor(Math.random() * 4) + 1
    const playerId = `${tribe.name}-${slotNum}`

    // 2.5s suspense delay
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
    setShowBadgePreview(false)
  }

  // Generate full-screen canvas badge
  const generateBadgeCanvas = useCallback((): HTMLCanvasElement | null => {
    if (!revealResult) return null

    const canvas = document.createElement('canvas')
    const W = 600, H = 1000
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const tc = revealResult.tribe.color
    const isDark = revealResult.tribe.name === 'Mountain'
    const displayColor = isDark ? '#a0a0a0' : tc

    // === Background ===
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
    bgGrad.addColorStop(0, '#050a14')
    bgGrad.addColorStop(0.3, '#0a1628')
    bgGrad.addColorStop(0.5, '#0c1a30')
    bgGrad.addColorStop(0.7, '#0a1628')
    bgGrad.addColorStop(1, '#050a14')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    // Tribe color radial glow behind center
    const glow = ctx.createRadialGradient(W / 2, 380, 0, W / 2, 380, 300)
    glow.addColorStop(0, isDark ? 'rgba(100,100,100,0.08)' : `${tc}14`)
    glow.addColorStop(1, 'transparent')
    ctx.fillStyle = glow
    ctx.fillRect(0, 80, W, 600)

    // === Ornate outer border ===
    ctx.strokeStyle = displayColor
    ctx.lineWidth = 2.5
    ctx.strokeRect(18, 18, W - 36, H - 36)
    ctx.strokeStyle = isDark ? 'rgba(100,100,100,0.2)' : `${tc}30`
    ctx.lineWidth = 1
    ctx.strokeRect(28, 28, W - 56, H - 56)

    // Corner ornaments
    const drawCorner = (x: number, y: number, dx: number, dy: number) => {
      ctx.strokeStyle = displayColor
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(x + dx * 40, y)
      ctx.lineTo(x, y)
      ctx.lineTo(x, y + dy * 40)
      ctx.stroke()
      ctx.fillStyle = displayColor
      ctx.beginPath()
      ctx.moveTo(x + dx * 10, y + dy * 10)
      ctx.lineTo(x + dx * 15, y + dy * 5)
      ctx.lineTo(x + dx * 20, y + dy * 10)
      ctx.lineTo(x + dx * 15, y + dy * 15)
      ctx.closePath()
      ctx.fill()
    }
    drawCorner(38, 38, 1, 1)
    drawCorner(W - 38, 38, -1, 1)
    drawCorner(38, H - 38, 1, -1)
    drawCorner(W - 38, H - 38, -1, -1)

    // === Event Name Header ===
    ctx.font = '11px sans-serif'
    ctx.fillStyle = isDark ? 'rgba(180,180,180,0.4)' : `${tc}60`
    ctx.textAlign = 'center'
    ctx.fillText('Z A M B A A R A   B E A C H   B A T T L E', W / 2, 78)

    // Decorative line
    const lineGrad = ctx.createLinearGradient(120, 0, W - 120, 0)
    lineGrad.addColorStop(0, 'transparent')
    lineGrad.addColorStop(0.5, displayColor)
    lineGrad.addColorStop(1, 'transparent')
    ctx.strokeStyle = lineGrad
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(120, 95)
    ctx.lineTo(W - 120, 95)
    ctx.stroke()

    // === Tribal Emblem (large icon) ===
    ctx.font = '100px serif'
    ctx.textAlign = 'center'
    ctx.fillText(revealResult.tribe.icon, W / 2, 230)

    // Tribe name (large)
    ctx.font = 'bold 60px sans-serif'
    ctx.fillStyle = displayColor
    ctx.fillText(revealResult.tribe.name.toUpperCase(), W / 2, 310)

    // Element subtitle
    ctx.font = '13px sans-serif'
    ctx.fillStyle = isDark ? 'rgba(180,180,180,0.5)' : `${tc}80`
    ctx.fillText(`E L E M E N T :  ${revealResult.tribe.element.toUpperCase()}`, W / 2, 345)

    // Subtitle
    ctx.font = '14px sans-serif'
    ctx.fillStyle = isDark ? 'rgba(180,180,180,0.5)' : `${tc}80`
    ctx.fillText('W A R R I O R   O F   T H E   T I D E S', W / 2, 378)

    // Separator
    ctx.strokeStyle = lineGrad
    ctx.beginPath()
    ctx.moveTo(140, 405)
    ctx.lineTo(W - 140, 405)
    ctx.stroke()
    // Diamond center
    ctx.fillStyle = displayColor
    ctx.beginPath()
    ctx.moveTo(W / 2, 400)
    ctx.lineTo(W / 2 + 6, 405)
    ctx.lineTo(W / 2, 410)
    ctx.lineTo(W / 2 - 6, 405)
    ctx.closePath()
    ctx.fill()

    // === Info Fields ===
    const drawField = (label: string, value: string, y: number) => {
      ctx.font = '10px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.textAlign = 'center'
      ctx.fillText(label.toUpperCase(), W / 2, y)
      ctx.font = 'bold 28px sans-serif'
      ctx.fillStyle = '#e2e8f0'
      ctx.fillText(value, W / 2, y + 36)
      const ulGrad = ctx.createLinearGradient(180, 0, W - 180, 0)
      ulGrad.addColorStop(0, 'transparent')
      ulGrad.addColorStop(0.5, 'rgba(255,255,255,0.06)')
      ulGrad.addColorStop(1, 'transparent')
      ctx.strokeStyle = ulGrad
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(180, y + 50)
      ctx.lineTo(W - 180, y + 50)
      ctx.stroke()
    }

    drawField('Player ID', revealResult.playerId, 445)
    drawField('Battle Slot', revealResult.slot, 530)
    drawField('Arena Table', `Table ${revealResult.table}`, 615)

    // Tribe element badge
    ctx.font = 'bold 13px sans-serif'
    ctx.fillStyle = displayColor
    ctx.fillText(`✦  ${revealResult.tribe.name.toUpperCase()} TRIBE  ✦`, W / 2, 700)

    // Bottom separator
    ctx.strokeStyle = lineGrad
    ctx.beginPath()
    ctx.moveTo(140, 730)
    ctx.lineTo(W - 140, 730)
    ctx.stroke()

    // Radial glow bottom
    const bGlow = ctx.createRadialGradient(W / 2, 750, 0, W / 2, 750, 200)
    bGlow.addColorStop(0, isDark ? 'rgba(100,100,100,0.04)' : `${tc}06`)
    bGlow.addColorStop(1, 'transparent')
    ctx.fillStyle = bGlow
    ctx.fillRect(0, 550, W, 400)

    // Motivational quote
    ctx.font = 'italic 14px sans-serif'
    ctx.fillStyle = 'rgba(148, 216, 240, 0.35)'
    ctx.fillText('"The Ocean chose you. Now prove your worth."', W / 2, 780)

    // Water droplet decoration
    for (let i = 0; i < 12; i++) {
      const dx = W / 2 + Math.cos(i * Math.PI / 6) * 120
      const dy = 840 + Math.sin(i * Math.PI / 6) * 15
      const r = Math.random() * 3 + 1
      ctx.beginPath()
      ctx.arc(dx, dy, r, 0, Math.PI * 2)
      ctx.fillStyle = isDark ? 'rgba(150,150,150,0.1)' : `${tc}15`
      ctx.fill()
    }

    // Logo/website
    ctx.font = 'bold 20px sans-serif'
    ctx.fillStyle = isDark ? 'rgba(150,150,150,0.35)' : `${tc}35`
    ctx.fillText('ZAMBAARA', W / 2, 900)
    ctx.font = '10px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.fillText('zambaara.com', W / 2, 920)

    // Bottom accent border
    ctx.strokeStyle = displayColor
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(120, H - 28)
    ctx.lineTo(W - 120, H - 28)
    ctx.stroke()

    return canvas
  }, [revealResult])

  // Download badge
  const downloadBadge = useCallback(() => {
    const canvas = generateBadgeCanvas()
    if (!canvas || !revealResult) return
    const link = document.createElement('a')
    link.download = `zambaara-warrior-${revealResult.playerId.toLowerCase()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [generateBadgeCanvas, revealResult])

  // Instagram-style preview toggle
  const toggleBadgePreview = useCallback(() => {
    setShowBadgePreview(prev => !prev)
  }, [])

  return (
    <section
      ref={sectionRef}
      id="qr-register"
      aria-label="QR Registration"
      className="relative w-full py-14 sm:py-20 md:py-28 overflow-hidden"
    >
      {/* Subtle section overlay — transparent, unified bg shows through */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.45]"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.5) 100%)' }} />
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
              style={{
                background: 'linear-gradient(145deg, rgba(6, 30, 50, 0.5) 0%, rgba(0,0,0,0.7) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                boxShadow: '0 0 40px rgba(6, 182, 212, 0.06)',
              }}>
              <div className="w-36 h-36 sm:w-44 sm:h-44 mx-auto mb-3 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(220,230,240,0.95) 100%)',
                  boxShadow: '0 0 25px rgba(6, 182, 212, 0.1)',
                }}>
                <svg viewBox="0 0 200 200" className="w-28 h-28 sm:w-36 sm:h-36" fill="#0a1628">
                  <rect x="20" y="20" width="50" height="50" rx="4" />
                  <rect x="130" y="20" width="50" height="50" rx="4" />
                  <rect x="20" y="130" width="50" height="50" rx="4" />
                  <rect x="28" y="28" width="34" height="34" rx="2" fill="white" />
                  <rect x="138" y="28" width="34" height="34" rx="2" fill="white" />
                  <rect x="28" y="138" width="34" height="34" rx="2" fill="white" />
                  <rect x="38" y="38" width="14" height="14" rx="1" />
                  <rect x="148" y="38" width="14" height="14" rx="1" />
                  <rect x="38" y="148" width="14" height="14" rx="1" />
                  <rect x="80" y="20" width="10" height="10" rx="1" />
                  <rect x="95" y="20" width="10" height="10" rx="1" />
                  <rect x="110" y="20" width="10" height="10" rx="1" />
                  <rect x="80" y="80" width="10" height="10" rx="1" />
                  <rect x="95" y="80" width="10" height="10" rx="1" />
                  <rect x="130" y="80" width="10" height="10" rx="1" />
                  <rect x="160" y="80" width="10" height="10" rx="1" />
                  <rect x="130" y="130" width="10" height="10" rx="1" />
                  <rect x="160" y="160" width="10" height="10" rx="1" />
                  <rect x="80" y="130" width="10" height="10" rx="1" />
                  <rect x="110" y="160" width="10" height="10" rx="1" />
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
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 55px rgba(6, 182, 212, 0.25)' }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 35px rgba(6, 182, 212, 0.1)' }}>
              <span className="relative z-10">✦ Discover Your Element</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          )}

          {/* Reveal Phase: Ocean Choosing */}
          {isRevealing && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative w-20 h-20 mb-5">
                <div className="absolute inset-0" style={{ animation: 'oceanSpin 2s linear infinite' }}>
                  <svg width="100%" height="100%" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="38" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1.5" strokeDasharray="6 4" />
                    <circle cx="40" cy="40" r="28" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1" strokeDasharray="4 3" />
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center" style={{ animation: 'oceanSpin 3s linear infinite reverse' }}>
                  <div className="text-3xl">🌊</div>
                </div>
              </div>
              <p className="uppercase tracking-[0.15em] text-sm"
                style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(6, 182, 212, 0.8)', animation: 'tribePulseText 1.5s ease-in-out infinite' }}>
                The Ocean is Choosing…
              </p>
            </div>
          )}

          {/* Result: Full tribe reveal + Badge */}
          {isRevealed && revealResult && (
            <div ref={revealRef} className="py-4 sm:py-6" style={{ perspective: '1200px' }}>
              {/* Tribe icon with glow */}
              <div className="text-5xl sm:text-7xl mb-3"
                style={{ filter: `drop-shadow(0 0 30px ${revealResult.tribe.glowColor})` }}>
                {revealResult.tribe.icon}
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] mb-1"
                style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(148, 216, 240, 0.5)' }}>
                You belong to the
              </p>
              <h3 className="text-3xl sm:text-5xl uppercase font-bold mb-1"
                style={{
                  fontFamily: "'TheWalkyrDemo', serif",
                  color: revealResult.tribe.name === 'Mountain' ? '#c8c8c8' : revealResult.tribe.color,
                  textShadow: `0 0 30px ${revealResult.tribe.glowColor}`,
                }}>
                {revealResult.tribe.name} Tribe
              </h3>
              <p className="text-[10px] uppercase tracking-[0.15em] mb-5"
                style={{
                  fontFamily: "'BlinkerRegular', sans-serif",
                  color: revealResult.tribe.name === 'Mountain' ? 'rgba(150,150,150,0.6)' : `${revealResult.tribe.color}80`,
                }}>
                Element of {revealResult.tribe.element}
              </p>

              {/* Warrior Badge Card */}
              <div ref={badgeRef}
                className="inline-block rounded-xl p-5 sm:p-6 mb-6 min-w-[280px] sm:min-w-[320px] relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(6, 30, 50, 0.6) 0%, rgba(0,0,0,0.75) 100%)',
                  border: `1.5px solid ${revealResult.tribe.name === 'Mountain' ? 'rgba(100,100,100,0.3)' : `${revealResult.tribe.color}30`}`,
                  boxShadow: `0 0 30px ${revealResult.tribe.glowColor.replace('0.5', '0.08')}`,
                }}>
                {/* Corner accents */}
                {[['top-2 left-2', 'border-t border-l'], ['top-2 right-2', 'border-t border-r'],
                  ['bottom-2 left-2', 'border-b border-l'], ['bottom-2 right-2', 'border-b border-r']].map(([pos, border], i) => (
                  <div key={i} className={`absolute ${pos} w-3 h-3 ${border}`}
                    style={{ borderColor: revealResult.tribe.name === 'Mountain' ? '#555' : `${revealResult.tribe.color}40` }} />
                ))}

                <p className="text-[8px] uppercase tracking-[0.3em] mb-4"
                  style={{ fontFamily: "'BlinkerRegular', sans-serif", color: revealResult.tribe.name === 'Mountain' ? 'rgba(150,150,150,0.5)' : `${revealResult.tribe.color}60` }}>
                  Warrior Badge
                </p>

                <div className="space-y-3 text-left">
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
                        <span className="text-sm sm:text-base font-bold"
                          style={{
                            fontFamily: "'BlinkerSemiBold', sans-serif",
                            color: revealResult.tribe.name === 'Mountain' ? '#c8c8c8' : revealResult.tribe.color,
                          }}>
                          {item.value}
                        </span>
                      </div>
                      {i < 2 && (
                        <div className="h-px mt-2"
                          style={{ background: `linear-gradient(90deg, transparent, ${revealResult.tribe.name === 'Mountain' ? 'rgba(100,100,100,0.1)' : `${revealResult.tribe.color}10`}, transparent)` }} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-2 text-center">
                  <p className="text-[8px] uppercase tracking-[0.2em]"
                    style={{
                      fontFamily: "'BlinkerSemiBold', sans-serif",
                      color: revealResult.tribe.name === 'Mountain' ? 'rgba(150,150,150,0.6)' : `${revealResult.tribe.color}70`,
                    }}>
                    ✦ {revealResult.tribe.name} Warrior ✦
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 max-w-[280px] sm:max-w-[320px] mx-auto">
                {/* Download Badge */}
                <button onClick={downloadBadge}
                  className="w-full px-5 py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-95 font-semibold relative overflow-hidden group"
                  style={{
                    fontFamily: "'BlinkerSemiBold', sans-serif",
                    background: `linear-gradient(135deg, ${revealResult.tribe.name === 'Mountain' ? 'rgba(100,100,100,0.2)' : `${revealResult.tribe.color}20`} 0%, rgba(0,0,0,0.5) 100%)`,
                    border: `1.5px solid ${revealResult.tribe.name === 'Mountain' ? 'rgba(100,100,100,0.4)' : `${revealResult.tribe.color}40`}`,
                    color: revealResult.tribe.name === 'Mountain' ? '#c8c8c8' : revealResult.tribe.color,
                    boxShadow: `0 0 20px ${revealResult.tribe.glowColor.replace('0.5', '0.08')}`,
                    minHeight: '48px',
                  }}>
                  <span className="relative z-10">⬇ Download Badge</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>

                {/* Instagram-style Preview */}
                <button onClick={toggleBadgePreview}
                  className="w-full px-5 py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-95 font-semibold"
                  style={{
                    fontFamily: "'BlinkerSemiBold', sans-serif",
                    background: 'linear-gradient(135deg, rgba(225, 48, 108, 0.12) 0%, rgba(131, 58, 180, 0.12) 100%)',
                    border: '1.5px solid rgba(225, 48, 108, 0.3)',
                    color: '#f472b6',
                    minHeight: '44px',
                  }}>
                  📸 Instagram Preview
                </button>

                {/* Try Again */}
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

      {/* Full-screen Badge Preview Modal */}
      {showBadgePreview && revealResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={toggleBadgePreview}>
          <div className="relative max-w-[340px] sm:max-w-[400px] w-full" onClick={(e) => e.stopPropagation()}>
            {/* Instagram-like frame */}
            <div className="rounded-2xl overflow-hidden relative"
              style={{
                background: 'linear-gradient(145deg, rgba(6, 30, 50, 0.9) 0%, rgba(0,0,0,0.95) 100%)',
                border: `2px solid ${revealResult.tribe.name === 'Mountain' ? 'rgba(100,100,100,0.3)' : `${revealResult.tribe.color}30`}`,
                boxShadow: `0 0 60px ${revealResult.tribe.glowColor.replace('0.5', '0.15')}`,
                aspectRatio: '9 / 16',
              }}>
              {/* Badge content rendered as preview */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                {/* Top bar */}
                <p className="text-[8px] uppercase tracking-[0.4em] mb-4 absolute top-5"
                  style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(6, 182, 212, 0.4)' }}>
                  Zambaara Beach Battle
                </p>

                {/* Tribe emblem */}
                <div className="text-6xl mb-3"
                  style={{ filter: `drop-shadow(0 0 25px ${revealResult.tribe.glowColor})` }}>
                  {revealResult.tribe.icon}
                </div>

                <h4 className="text-3xl font-bold uppercase mb-1"
                  style={{
                    fontFamily: "'TheWalkyrDemo', serif",
                    color: revealResult.tribe.name === 'Mountain' ? '#c8c8c8' : revealResult.tribe.color,
                    textShadow: `0 0 20px ${revealResult.tribe.glowColor}`,
                  }}>
                  {revealResult.tribe.name}
                </h4>

                <p className="text-[9px] uppercase tracking-[0.15em] mb-6"
                  style={{ fontFamily: "'BlinkerRegular', sans-serif", color: revealResult.tribe.name === 'Mountain' ? 'rgba(150,150,150,0.5)' : `${revealResult.tribe.color}60` }}>
                  Warrior of the Tides
                </p>

                {/* Divider */}
                <div className="w-16 h-px mb-5"
                  style={{ background: `linear-gradient(90deg, transparent, ${revealResult.tribe.name === 'Mountain' ? '#666' : revealResult.tribe.color}, transparent)` }} />

                {/* Player info */}
                <div className="space-y-2 mb-6">
                  <p className="text-lg font-bold"
                    style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#e2e8f0' }}>
                    {revealResult.playerId}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider"
                    style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.3)' }}>
                    Table {revealResult.table} • Slot {revealResult.slot}
                  </p>
                </div>

                {/* Quote */}
                <p className="text-[9px] italic absolute bottom-12"
                  style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(148, 216, 240, 0.3)' }}>
                  &quot;The Ocean chose you.&quot;
                </p>

                {/* Footer */}
                <p className="text-[8px] uppercase tracking-wider absolute bottom-5"
                  style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.15)' }}>
                  zambaara.com
                </p>
              </div>
            </div>

            {/* Close button */}
            <button onClick={toggleBadgePreview}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center bg-black/80 border border-white/20 text-white/60 hover:text-white text-xs transition-all active:scale-90"
              aria-label="Close preview">
              ✕
            </button>

            {/* Download from preview */}
            <button onClick={downloadBadge}
              className="w-full mt-4 px-5 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold active:scale-95 transition-all"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
                background: `linear-gradient(135deg, ${revealResult.tribe.name === 'Mountain' ? 'rgba(100,100,100,0.2)' : `${revealResult.tribe.color}20`} 0%, rgba(0,0,0,0.5) 100%)`,
                border: `1.5px solid ${revealResult.tribe.name === 'Mountain' ? 'rgba(100,100,100,0.35)' : `${revealResult.tribe.color}35`}`,
                color: revealResult.tribe.name === 'Mountain' ? '#c8c8c8' : revealResult.tribe.color,
              }}>
              ⬇ Save to Camera Roll
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes oceanSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes qrPulse { 0%, 100% { box-shadow: inset 0 0 20px rgba(6, 182, 212, 0.03); } 50% { box-shadow: inset 0 0 40px rgba(6, 182, 212, 0.1); } }
        @keyframes tribePulseText { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
      `}</style>
    </section>
  )
}
