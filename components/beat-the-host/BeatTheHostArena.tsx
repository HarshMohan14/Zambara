'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { gsap } from '@/lib/gsap'

interface GamePlayer {
  id: string
  player_id: string
  player_name: string
}

interface Game {
  id: string
  status: string
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  winner_id: string | null
  winner_name: string | null
  created_at: string
  beat_the_host_game_players: GamePlayer[]
}

interface LeaderboardEntry {
  id: string
  winner_name: string
  duration_seconds: number
  ended_at: string
  started_at: string
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

function LiveTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const start = new Date(startedAt).getTime()
    const tick = () => setElapsed(Math.round((Date.now() - start) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt])
  const m = Math.floor(elapsed / 60)
  const s = elapsed % 60
  return (
    <div className="font-mono text-5xl md:text-6xl font-bold tracking-widest"
      style={{ color: '#22c55e', textShadow: '0 0 30px rgba(34,197,94,0.6), 0 0 60px rgba(34,197,94,0.2)' }}>
      {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
    </div>
  )
}

interface SpinnerSlice {
  id: number
  label: string
  emoji: string
  description: string
  angle: number // Slice angle size in degrees
  color: string // Slice fill gradient/color
  element: 'lava' | 'wind' | 'water' | 'mountain'
}

interface SlicesWithAngles extends SpinnerSlice {
  startAngle: number
  endAngle: number
  midAngle: number
}

// 8 sections with angles summing to exactly 360°
const SPIN_SLICES: SpinnerSlice[] = [
  { id: 1, label: '10% OFF', emoji: '🔥', description: '10% Discount Coupon', angle: 80, color: 'url(#sliceGold)', element: 'lava' },
  { id: 2, label: '20% OFF', emoji: '💧', description: '20% Discount Coupon', angle: 60, color: 'url(#sliceBlack)', element: 'water' },
  { id: 3, label: '10% OFF', emoji: '🔥', description: '10% Discount Coupon', angle: 75, color: 'url(#sliceGold)', element: 'lava' },
  { id: 4, label: 'BUY 2 AT 850', emoji: '🌀', description: 'Buy 2 tournament entries at 850', angle: 50, color: 'url(#sliceBlack)', element: 'wind' },
  { id: 5, label: 'EARTH BRACELET', emoji: '⛰️', description: 'Official Zambaara Earth Bracelet', angle: 40, color: 'url(#sliceGold)', element: 'mountain' },
  { id: 6, label: 'ICE BRACELET', emoji: '❄️', description: 'Official Zambaara Ice Bracelet', angle: 30, color: 'url(#sliceBlack)', element: 'water' },
  { id: 7, label: 'FREE GAME', emoji: '👑', description: 'Free Tournament Entry Ticket', angle: 6, color: 'url(#sliceGrandGold)', element: 'lava' },
  { id: 8, label: 'TRY AGAIN', emoji: '🌧️', description: 'Better Luck Next Time!', angle: 19, color: 'url(#sliceBlack)', element: 'water' }
]

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  life: number
  maxLife: number
}

function ElementalSpinner() {
  const [charge, setCharge] = useState(0)
  const [isCharging, setIsCharging] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [spinDuration, setSpinDuration] = useState(0)
  const [winningSlice, setWinningSlice] = useState<SlicesWithAngles | null>(null)
  const [showRewardModal, setShowRewardModal] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const chargeIntervalRef = useRef<any>(null)
  const requestRef = useRef<number | null>(null)
  const burstTriggerRef = useRef<'lava' | 'wind' | 'water' | 'mountain' | null>(null)

  // Map starting and ending angles of slices
  const slicesWithAngles = useMemo<SlicesWithAngles[]>(() => {
    let currentAngle = 0
    return SPIN_SLICES.map((slice) => {
      const startAngle = currentAngle
      const endAngle = currentAngle + slice.angle
      currentAngle = endAngle
      return {
        ...slice,
        startAngle,
        endAngle,
        midAngle: startAngle + slice.angle / 2
      }
    })
  }, [])

  // Identify current element phase based on charge level
  const activeElement = useMemo(() => {
    if (charge < 25) return 'water'
    if (charge < 50) return 'wind'
    if (charge < 75) return 'lava'
    return 'mountain'
  }, [charge])

  // Canvas animations loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.parentElement?.clientWidth || 400
    canvas.height = canvas.parentElement?.clientHeight || 400

    const updateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const particles = particlesRef.current

      // Spawn normal elemental charge sparks
      if (isCharging) {
        const cx = canvas.width / 2
        const cy = canvas.height / 2
        const colorMap = {
          water: ['#38bdf8', '#0ea5e9', '#67e8f9'],
          wind: ['#e2e8f0', '#94a3b8', '#cbd5e1'],
          lava: ['#ef4444', '#f97316', '#facc15'],
          mountain: ['#4ade80', '#22c55e', '#d1a058']
        }
        const colors = colorMap[activeElement]
        const randomColor = colors[Math.floor(Math.random() * colors.length)]

        // Swirling particles drawing into the center
        const pAngle = Math.random() * Math.PI * 2
        const dist = 160 + Math.random() * 40
        particles.push({
          x: cx + Math.cos(pAngle) * dist,
          y: cy + Math.sin(pAngle) * dist,
          vx: -Math.cos(pAngle) * (2 + (charge / 20)),
          vy: -Math.sin(pAngle) * (2 + (charge / 20)),
          size: 2 + Math.random() * 3,
          color: randomColor,
          alpha: 1,
          life: 0,
          maxLife: 40 + Math.random() * 20
        })
      }

      // Handle custom landing prize burst explosion
      if (burstTriggerRef.current) {
        const cx = canvas.width / 2
        const cy = canvas.height / 2
        const element = burstTriggerRef.current
        const colorMap = {
          lava: ['#f87171', '#f97316', '#fbbf24', '#f43f5e'],
          wind: ['#ffffff', '#e2e8f0', '#22d3ee', '#38bdf8'],
          water: ['#60a5fa', '#3b82f6', '#06b6d4', '#0891b2'],
          mountain: ['#34d399', '#10b981', '#fbbf24', '#d1a058']
        }
        const colors = colorMap[element]

        for (let i = 0; i < 120; i++) {
          const pAngle = Math.random() * Math.PI * 2
          const speed = 2 + Math.random() * 7
          particles.push({
            x: cx,
            y: cy,
            vx: Math.cos(pAngle) * speed,
            vy: Math.sin(pAngle) * speed,
            size: 2 + Math.random() * 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            life: 0,
            maxLife: 60 + Math.random() * 40
          })
        }
        burstTriggerRef.current = null
      }

      // Render and move particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life++
        p.alpha = 1 - (p.life / p.maxLife)

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.shadowBlur = 8
        ctx.shadowColor = p.color
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        if (p.life >= p.maxLife) {
          particles.splice(i, 1)
        }
      }

      requestRef.current = requestAnimationFrame(updateParticles)
    }

    updateParticles()
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [isCharging, activeElement, charge])

  // Start charging power meter on hold
  const startCharging = () => {
    if (isSpinning) return
    setIsCharging(true)
    setCharge(0)

    chargeIntervalRef.current = setInterval(() => {
      setCharge((prev) => {
        if (prev >= 100) {
          return 100
        }
        return prev + 1.8 // Charge speed
      })
    }, 20)
  }

  // Release hold to launch the spin
  const releaseSpin = () => {
    if (!isCharging) return
    setIsCharging(false)
    clearInterval(chargeIntervalRef.current)

    let finalCharge = charge
    if (finalCharge < 8) {
      finalCharge = 15
      setCharge(15)
    }

    triggerSpin(finalCharge)
  }

  // Calculate final angle and trigger wheel rotation
  const triggerSpin = (spinCharge: number) => {
    setIsSpinning(true)
    setWinningSlice(null)

    // Weighted Random Selector based on visual slice sizes (angles)
    const totalWeights = 360
    const randVal = Math.random() * totalWeights

    let selected: SlicesWithAngles | null = null
    for (const slice of slicesWithAngles) {
      if (randVal >= slice.startAngle && randVal < slice.endAngle) {
        selected = slice
        break
      }
    }
    if (!selected) selected = slicesWithAngles[0]

    setWinningSlice(selected)

    // Calculate dynamic spins count based on charge power (longer hold = more force/rotations)
    const extraRotations = 3 + Math.floor(spinCharge / 8) + Math.floor((spinCharge * spinCharge) / 400)
    const duration = 3.5 + (spinCharge / 20)
    setSpinDuration(duration)

    // Calculate targeted landing point (Top needle is standard 12 o'clock / 0° local)
    // Pointer points at (360 - landAngle)
    const padding = selected.angle * 0.15
    const innerRandomAngle = selected.startAngle + padding + (Math.random() * (selected.angle - padding * 2))
    const targetAngle = (extraRotations * 360) + (360 - innerRandomAngle)

    setRotation(targetAngle)

    // Set callback timeout when wheel stops
    setTimeout(() => {
      setIsSpinning(false)
      setCharge(0)
      // Trigger elemental burst
      if (selected) {
        burstTriggerRef.current = selected.element
      }
      // Open modal
      setTimeout(() => {
        setShowRewardModal(true)
      }, 400)
    }, duration * 1000)
  }

  // Helper polar drawing math for SVG arcs
  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians)
    }
  }

  const getArcPath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, startAngle)
    const end = polarToCartesian(cx, cy, r, endAngle)
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y} Z`
  }

  return (
    <section className="bg-black/50 border border-[#d1a058]/15 rounded-xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
      
      {/* Background radial overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d1a058]/5 blur-3xl rounded-full pointer-events-none" />

      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold uppercase text-[#d1a058]" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
          ⚡ Elemental Wheel of Destiny ⚡
        </h2>
        <p className="text-white/60 text-xs md:text-sm max-w-xl mx-auto" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
          Channel the powers of Lava, Wind, Water, and Mountain. Hold the charge button below to gather elemental force, and release to claim your trial reward!
        </p>
      </div>

      <div ref={containerRef} className="flex flex-col items-center gap-8">
        
        {/* Top: SVG Wheel Graphic */}
        <div className="w-full max-w-[290px] xs:max-w-[340px] sm:max-w-[440px] md:max-w-[500px] lg:max-w-[540px] aspect-square flex justify-center relative select-none">
          
          {/* Wheel Frame (Concentric ancient runic gold rings) */}
          <div className={`w-full h-full relative rounded-full border-4 border-[#d1a058]/40 shadow-[0_0_35px_rgba(209,160,88,0.3)] bg-black/35 backdrop-blur-md p-1.5 md:p-3 flex items-center justify-center ${charge === 100 ? 'shake-overdrive' : ''}`}>
            
            {/* HTML5 Canvas overlay for particles */}
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20 rounded-full" />
            
            {/* Inner relative container to align rotating and static SVGs perfectly */}
            <div className="w-full h-full relative flex items-center justify-center">
              
              {/* SVG Wheel segments rendering */}
              <svg 
                className="w-full h-full transform origin-center transition-transform select-none"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? `transform ${spinDuration}s cubic-bezier(0.15, 0.85, 0.15, 1)` : 'none'
                }}
                viewBox="0 0 400 400"
              >
                <defs>
                  {/* Zambaara Matte Black Glass Gradient (Radial to dark contrast at outer rim) */}
                  <radialGradient id="sliceBlack" cx="15%" cy="50%" r="85%">
                    <stop offset="0%" stopColor="rgba(44, 44, 44, 0.45)" />
                    <stop offset="50%" stopColor="rgba(20, 20, 20, 0.65)" />
                    <stop offset="100%" stopColor="rgba(5, 5, 5, 0.88)" />
                  </radialGradient>
                  
                  {/* Zambaara Premium Burnished Gold Glass Gradient (Radial to dark contrast at outer rim) */}
                  <radialGradient id="sliceGold" cx="15%" cy="50%" r="85%">
                    <stop offset="0%" stopColor="rgba(254, 240, 138, 0.38)" />
                    <stop offset="30%" stopColor="rgba(209, 160, 88, 0.48)" />
                    <stop offset="70%" stopColor="rgba(133, 83, 7, 0.68)" />
                    <stop offset="100%" stopColor="rgba(30, 15, 2, 0.88)" />
                  </radialGradient>

                  {/* Zambaara Grand Prize Gold Glass Gradient (Radial to dark contrast at outer rim) */}
                  <radialGradient id="sliceGrandGold" cx="15%" cy="50%" r="85%">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.55)" />
                    <stop offset="25%" stopColor="rgba(254, 240, 138, 0.68)" />
                    <stop offset="55%" stopColor="rgba(209, 160, 88, 0.78)" />
                    <stop offset="100%" stopColor="rgba(69, 26, 3, 0.93)" />
                  </radialGradient>
                </defs>

                {/* Slices Drawing */}
                {slicesWithAngles.map((slice) => {
                  const pathData = getArcPath(200, 200, 186, slice.startAngle, slice.endAngle)
                  
                  // Flip text on the left half to keep it right-side up
                  const isLeftHalf = slice.midAngle > 180 && slice.midAngle < 360
                  const textRotation = isLeftHalf ? slice.midAngle - 270 : slice.midAngle - 90
                  
                  // Radius midpoint of slice: outer radius is 186, center cap is 38.
                  // Visible area is from 38 to 186. Midpoint = 38 + (186-38)/2 = 38 + 74 = 112.
                  // 200 is center. Distance is 112.
                  const textX = isLeftHalf ? 88 : 312
                  const textAnchor = "middle"

                  // Dynamic font size mapping based on slice angle size
                  const getFontSize = (angle: number) => {
                    if (angle >= 70) return '19px'
                    if (angle >= 50) return '17px'
                    if (angle >= 30) return '15.5px'
                    if (angle >= 15) return '13.5px'
                    return '11px'
                  }
                  
                  return (
                    <g key={slice.id}>
                      <path 
                        d={pathData} 
                        fill={slice.color} 
                        stroke="#d1a058" 
                        strokeWidth="1.5" 
                        opacity="0.95"
                        className="transition-opacity hover:opacity-100 cursor-pointer"
                      />
                      
                      {/* Radial slice labels: Aligned perfectly with high-contrast text stroke */}
                      <g transform={`rotate(${textRotation}, 200, 200)`}>
                        {/* Prize Text Label */}
                        <text
                          x={textX}
                          y="200"
                          textAnchor={textAnchor}
                          dominantBaseline="middle"
                          fill={slice.id === 7 ? '#facc15' : '#ffffff'}
                          fontSize={getFontSize(slice.angle)}
                          fontWeight="900"
                          letterSpacing="0.04em"
                          stroke="#000000"
                          strokeWidth="3.6"
                          paintOrder="stroke fill"
                          style={{
                            fontFamily: "'BlinkerSemiBold', sans-serif",
                            textShadow: '0 0 6px rgba(0,0,0,0.8)'
                          }}
                        >
                          {slice.label}
                        </text>
                      </g>
                    </g>
                  )
                })}

                {/* Concentric Runic Gold Rings (Adds the Zambaara astronomical layout) */}
                <circle cx="200" cy="200" r="186" stroke="url(#goldGradient)" strokeWidth="6" fill="none" opacity="0.9" />
                <circle cx="200" cy="200" r="183" stroke="#000" strokeWidth="1.5" fill="none" />
              </svg>

              {/* Static SVG Overlay for Specular Glass Shine and Right-Side Up Cap Logo */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                viewBox="0 0 400 400"
              >
                <defs>
                  {/* Vertical gradient for glass specular reflection */}
                  <linearGradient id="glassReflection" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                    <stop offset="30%" stopColor="#ffffff" stopOpacity="0.15" />
                    <stop offset="60%" stopColor="#ffffff" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Outer ring gold gradient for Cap */}
                  <linearGradient id="goldGradientCap" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#d1a058" />
                    <stop offset="100%" stopColor="#a16207" />
                  </linearGradient>
                </defs>

                {/* Glass Specular Reflection Shine overlay (top half) */}
                <path 
                  d="M 14 200 A 186 186 0 0 1 386 200 Z" 
                  fill="url(#glassReflection)" 
                  opacity="0.9" 
                />

                {/* Outer glass highlight rim */}
                <circle 
                  cx="200" 
                  cy="200" 
                  r="185" 
                  stroke="rgba(255, 255, 255, 0.15)" 
                  strokeWidth="1.5" 
                  fill="none" 
                />

                {/* Center Medallion Cap (Static, so logo is always right-side up!) */}
                <circle cx="200" cy="200" r="38" fill="url(#goldGradientCap)" stroke="#d1a058" strokeWidth="2.5" />
                <circle cx="200" cy="200" r="32" fill="#111" stroke="#d1a058" strokeWidth="1" />
                <image 
                  href="/Zambaara.png" 
                  x="174" 
                  y="182" 
                  width="52" 
                  height="36" 
                  preserveAspectRatio="xMidYMid meet" 
                />
              </svg>

            </div>

            {/* Pointer (Needle: Golden Runic Triangle with Pulsing Crystal Gem) */}
            <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
              <svg className="w-7 h-7 text-yellow-500 drop-shadow-[0_2px_12px_rgba(234,179,8,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22L4 7h16z" />
              </svg>
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full border border-black animate-pulse absolute top-1.5 shadow-[0_0_8px_#ef4444]" />
            </div>
            
          </div>
        </div>

        {/* Bottom: Controller charging dashboard */}
        <div className="w-full max-w-xl md:max-w-2xl space-y-6 flex flex-col justify-center">
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white uppercase" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
              Elemental Force Charger
            </h3>
            
            {/* Visual Vertical Power Meter */}
            <div className="h-10 bg-black/60 border border-white/10 rounded-lg overflow-hidden relative flex items-center shadow-inner">
              
              {/* Charge gradient bar */}
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-red-500 transition-all ease-out duration-75 relative"
                style={{
                  width: `${charge}%`,
                  backgroundImage: charge === 100 
                    ? 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6)' 
                    : activeElement === 'water' 
                    ? 'linear-gradient(90deg, #06b6d4, #0ea5e9)'
                    : activeElement === 'wind'
                    ? 'linear-gradient(90deg, #94a3b8, #cbd5e1)'
                    : activeElement === 'lava'
                    ? 'linear-gradient(90deg, #ef4444, #f97316)'
                    : 'linear-gradient(90deg, #22c55e, #d1a058)'
                }}
              >
                {charge > 0 && (
                  <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/70 blur-xs animate-pulse" />
                )}
              </div>

              {/* Status Labels inside the bar */}
              <div className="absolute inset-0 flex justify-between items-center px-4 pointer-events-none select-none">
                <span className="text-[10px] uppercase font-bold text-white/50 tracking-widest font-mono">
                  {charge === 0 && 'READY // STANDBY'}
                  {charge > 0 && charge < 25 && '💧 RIPPLE CHARGE'}
                  {charge >= 25 && charge < 50 && '🌀 WIND STORM'}
                  {charge >= 50 && charge < 75 && '🔥 LAVA IGNITION'}
                  {charge >= 75 && charge < 100 && '⛰️ EARTH FORCE'}
                  {charge === 100 && '💥 OVERDRIVE UNLEASHED!'}
                </span>
                <span className="text-xs font-black text-white font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {Math.floor(charge)}%
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Button */}
          <button
            onMouseDown={startCharging}
            onMouseUp={releaseSpin}
            onMouseLeave={releaseSpin}
            onTouchStart={(e) => { e.preventDefault(); startCharging(); }}
            onTouchEnd={(e) => { e.preventDefault(); releaseSpin(); }}
            disabled={isSpinning}
            className={`w-full py-5 rounded-xl border-2 font-black uppercase text-base tracking-widest transition-all select-none duration-100 transform active:scale-[0.98] ${
              isSpinning 
                ? 'bg-gray-800/20 border-gray-700/30 text-gray-500 cursor-not-allowed' 
                : isCharging 
                ? 'bg-red-600/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.25)] animate-pulse'
                : 'bg-[#d1a058]/10 hover:bg-[#d1a058]/20 border-[#d1a058] text-[#d1a058] shadow-[0_4px_15px_rgba(209,160,88,0.15)] cursor-pointer'
            }`}
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
          >
            {isSpinning 
              ? '⚡ Spinning elements...' 
              : isCharging 
              ? '⚡ RELEASE TO SPIN!' 
              : '🔥 Press & Hold to Charge Force'}
          </button>

        </div>

      </div>

      {/* Victory Reward Modal Dialog */}
      {showRewardModal && winningSlice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-gradient-to-b from-black via-black to-yellow-950/20 border-2 border-[#d1a058] rounded-2xl max-w-sm w-full p-6 text-center shadow-[0_0_50px_rgba(209,160,88,0.3)] relative overflow-hidden space-y-6">
            
            {/* Element specific backing glowing halo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#d1a058]/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="space-y-2 relative z-10">
              <span className="text-[10px] tracking-widest text-[#d1a058] font-bold uppercase block font-mono">Arena Prize Unlocked</span>
              <h3 className="text-2xl font-black text-white uppercase" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
                Reward Acclaimed!
              </h3>
            </div>

            {/* Zambaara Ticket Coupon Design (Rendered for all prizes) */}
            <div className="w-full max-w-[290px] mx-auto bg-black/80 backdrop-blur-md border-2 border-[#d1a058] rounded-xl p-5 relative shadow-[0_0_30px_rgba(209,160,88,0.3)] flex flex-col items-center justify-center overflow-hidden">
              {/* Glass shine overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
              
              {/* Ticket notches */}
              <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black border-r-2 border-[#d1a058]" />
              <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black border-l-2 border-[#d1a058]" />
              
              {/* Dashed inner border */}
              <div className="w-full border border-dashed border-[#d1a058]/45 rounded-lg py-5 px-3 flex flex-col items-center justify-center space-y-3 relative z-10">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#d1a058] font-bold font-mono">Zambaara Coupon</span>
                
                <div className="text-2xl font-black text-white tracking-wide drop-shadow-[0_0_12px_rgba(255,255,255,0.25)] text-center px-1 font-serif uppercase">
                  {winningSlice.label}
                </div>
                
                <div className="w-20 h-[1.5px] bg-gradient-to-r from-transparent via-[#d1a058]/50 to-transparent" />
                
                <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider px-2 text-center leading-relaxed">
                  {winningSlice.id === 8 ? "Better luck next time!" : "Show to the counter to avail the prize"}
                </p>
              </div>
            </div>

            <div className="space-y-1 relative z-10">
              <p className="text-white/60 text-xs px-4">
                {winningSlice.description}
              </p>
            </div>

            <button
              onClick={() => setShowRewardModal(false)}
              className="w-full bg-[#d1a058] hover:bg-[#c09048] text-black font-extrabold py-3 rounded-lg text-xs uppercase tracking-widest transition-colors relative z-10 shadow-[0_4px_10px_rgba(209,160,88,0.2)]"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
            >
              Claim to Inventory
            </button>
          </div>
        </div>
      )}
      
      {/* Local keyframes style block */}
      <style jsx>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s infinite linear;
        }
        @keyframes shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          20%, 60% { transform: translate(-0.5px, 0.5px) rotate(-0.1deg); }
          40%, 80% { transform: translate(0.5px, -0.5px) rotate(0.1deg); }
        }
        .shake-overdrive {
          animation: shake 0.15s infinite ease-in-out;
        }
        .blur-xs {
          filter: blur(2px);
        }
      `}</style>
    </section>
  )
}

export function BeatTheHostArena() {

  const [games, setGames] = useState<Game[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const heroRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  const fetchData = async () => {
    try {
      const [gR, lR] = await Promise.all([
        fetch('/api/beat-the-host/games'),
        fetch('/api/beat-the-host/leaderboard'),
      ])
      const [gD, lD] = await Promise.all([gR.json(), lR.json()])
      if (gD.success) setGames(gD.data.games || [])
      if (lD.success) setLeaderboard(lD.data.leaderboard || [])
    } catch { /* silent */ }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (hasAnimated.current || !heroRef.current) return
    hasAnimated.current = true
    const els = heroRef.current.querySelectorAll('.h-anim')
    gsap.from(els, { opacity: 0, y: 60, filter: 'blur(8px)', duration: 1.2, stagger: 0.18, ease: 'power3.out' })
  }, [])

  const liveGames = games.filter(g => g.status === 'live')
  const completedGames = games.filter(g => g.status === 'completed')

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* Ambient bg glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(209,160,88,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(ellipse, rgba(239,68,68,0.04) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: '400px', height: '400px', background: 'radial-gradient(ellipse, rgba(34,197,94,0.04) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div className="relative z-10">
        {/* ═══ HERO ═══ */}
        <section ref={heroRef} id="beat-hero" className="min-h-screen flex items-center justify-center px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="h-anim mb-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.3em]"
                style={{ background: 'rgba(209,160,88,0.1)', border: '1px solid rgba(209,160,88,0.3)', color: '#d1a058', fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                Zambaara Tournament Arena
              </span>
            </div>

            <h1 className="h-anim text-6xl md:text-8xl font-bold uppercase leading-[0.88] mb-6"
              style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#d1a058', textShadow: '0 0 50px rgba(209,160,88,0.25), 0 4px 30px rgba(0,0,0,0.8)' }}>
              Beat<br />The<br />Host
            </h1>

            <p className="h-anim text-lg md:text-xl text-white/55 max-w-xl mx-auto mb-10 leading-relaxed"
              style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
              Step into the arena. Defeat the host. Claim your place in the Hall of Champions.
            </p>

            <div className="h-anim flex flex-wrap justify-center gap-8 text-sm uppercase tracking-widest"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1" style={{ color: '#22c55e', textShadow: '0 0 20px rgba(34,197,94,0.4)' }}>{liveGames.length}</div>
                <div className="text-white/40 text-xs">Live Battles</div>
              </div>
              <div className="text-white/10 text-3xl">|</div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1" style={{ color: '#fbbf24' }}>{leaderboard.length}</div>
                <div className="text-white/40 text-xs">Champions</div>
              </div>
              <div className="text-white/10 text-3xl">|</div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1 text-white/50">{completedGames.length}</div>
                <div className="text-white/40 text-xs">Battles Fought</div>
              </div>
            </div>

            <div className="h-anim mt-16 animate-bounce">
              <svg className="w-6 h-6 mx-auto text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </section>

        {/* ═══ LIVE ARENA ═══ */}
        <section className="px-4 py-20 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold uppercase mb-2"
              style={{ fontFamily: "'TheWalkyrDemo', serif", color: liveGames.length > 0 ? '#22c55e' : '#d1a058', textShadow: liveGames.length > 0 ? '0 0 40px rgba(34,197,94,0.3)' : 'none' }}>
              {liveGames.length > 0 ? 'Live Arena' : 'The Arena'}
            </h2>
            <p className="text-white/35 text-xs uppercase tracking-[0.25em]" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
              {liveGames.length > 0 ? `${liveGames.length} battle${liveGames.length > 1 ? 's' : ''} in progress` : 'Awaiting the next challenger'}
            </p>
          </div>

          {liveGames.length === 0 ? (
            <div className="text-center py-20 rounded-2xl max-w-lg mx-auto"
              style={{ background: 'rgba(209,160,88,0.03)', border: '1px dashed rgba(209,160,88,0.15)' }}>
              <svg className="w-14 h-14 mx-auto mb-4 opacity-15" viewBox="0 0 24 24" fill="none" stroke="#d1a058" strokeWidth="1">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
              <p className="text-white/25 text-base" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>The arena is silent...</p>
              <p className="text-white/15 text-sm mt-2" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>A new challenger will rise soon.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {liveGames.map((game, idx) => (
                <div key={game.id} className="relative rounded-2xl p-8 md:p-10 overflow-hidden text-center"
                  style={{
                    background: 'linear-gradient(160deg, rgba(34,197,94,0.04), rgba(0,0,0,0.85))',
                    border: '2px solid rgba(34,197,94,0.3)',
                    boxShadow: '0 0 50px rgba(34,197,94,0.07), inset 0 0 80px rgba(34,197,94,0.02)',
                  }}>
                  {/* Corner brackets */}
                  {[['top-0 left-0', 'border-t border-l'], ['top-0 right-0', 'border-t border-r'], ['bottom-0 left-0', 'border-b border-l'], ['bottom-0 right-0', 'border-b border-r']].map(([pos, borders]) => (
                    <div key={pos} className={`absolute ${pos} w-8 h-8`} style={{ borderColor: 'rgba(34,197,94,0.5)', borderWidth: '1.5px', borderStyle: 'solid', borderRight: borders.includes('border-r') ? undefined : 'none', borderLeft: borders.includes('border-l') ? undefined : 'none', borderTop: borders.includes('border-t') ? undefined : 'none', borderBottom: borders.includes('border-b') ? undefined : 'none' }} />
                  ))}

                  <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs uppercase tracking-[0.25em] font-semibold" style={{ color: '#22c55e', fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                      Battle {idx + 1} — Live
                    </span>
                  </div>

                  <LiveTimer startedAt={game.started_at} />

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    {game.beat_the_host_game_players.map((gp: GamePlayer, pi: number) => (
                      <div key={gp.id} className="flex items-center gap-3">
                        {pi > 0 && (
                          <span className="text-base font-bold" style={{ color: 'rgba(209,160,88,0.4)', fontFamily: "'TheWalkyrDemo', serif" }}>×</span>
                        )}
                        <div className="px-6 py-3 rounded-xl"
                          style={{ background: 'rgba(209,160,88,0.08)', border: '1.5px solid rgba(209,160,88,0.25)' }}>
                          <span className="text-sm md:text-base font-bold uppercase tracking-wider"
                            style={{ color: '#d1a058', fontFamily: "'BlinkerSemiBold', sans-serif" }}>{gp.player_name}</span>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold" style={{ color: 'rgba(239,68,68,0.5)', fontFamily: "'TheWalkyrDemo', serif" }}>VS</span>
                      <div className="px-6 py-3 rounded-xl"
                        style={{ background: 'rgba(239,68,68,0.07)', border: '1.5px solid rgba(239,68,68,0.25)', boxShadow: '0 0 20px rgba(239,68,68,0.08)' }}>
                        <span className="text-sm md:text-base font-bold uppercase tracking-wider"
                          style={{ color: '#ef4444', fontFamily: "'TheWalkyrDemo', serif" }}>The Host</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ═══ INTERACTIVE SPINNER WHEEL ═══ */}
        <section className="px-4 py-10 max-w-4xl mx-auto relative z-10">
          <ElementalSpinner />
        </section>

        {/* ═══ HALL OF CHAMPIONS ═══ */}
        <section className="px-4 py-20 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold uppercase mb-2"
              style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#fbbf24', textShadow: '0 0 30px rgba(251,191,36,0.2)' }}>
              Hall of Champions
            </h2>
            <p className="text-white/35 text-xs uppercase tracking-[0.25em]" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
              Fastest warriors who defeated the host
            </p>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-16 rounded-2xl max-w-md mx-auto"
              style={{ background: 'rgba(251,191,36,0.03)', border: '1px dashed rgba(251,191,36,0.12)' }}>
              <p className="text-white/25" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>No champions yet. Be the first.</p>
            </div>
          ) : (
            <>
              {/* Podium */}
              <div className="flex items-end justify-center gap-2 md:gap-4 mb-10">
                {leaderboard.length >= 2 && (
                  <div className="flex-1 max-w-[180px]">
                    <div className="rounded-t-2xl p-4 text-center flex flex-col justify-end"
                      style={{ height: '160px', background: 'linear-gradient(180deg, rgba(148,163,184,0.08), rgba(148,163,184,0.02))', border: '1px solid rgba(148,163,184,0.2)', borderBottom: 'none' }}>
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(148,163,184,0.15)', border: '2px solid rgba(148,163,184,0.4)' }}>
                        <span className="text-sm font-bold text-gray-300">2</span>
                      </div>
                      <p className="text-sm font-bold text-white truncate" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>{leaderboard[1].winner_name}</p>
                      <p className="font-mono text-xs mt-0.5" style={{ color: '#22c55e' }}>{fmt(leaderboard[1].duration_seconds)}</p>
                    </div>
                  </div>
                )}
                <div className="flex-1 max-w-[200px]">
                  <div className="rounded-t-2xl p-5 text-center flex flex-col justify-end relative"
                    style={{ height: '210px', background: 'linear-gradient(180deg, rgba(251,191,36,0.1), rgba(251,191,36,0.02))', border: '2px solid rgba(251,191,36,0.25)', borderBottom: 'none', boxShadow: '0 0 40px rgba(251,191,36,0.07)' }}>
                    <div className="absolute top-4 left-1/2 -translate-x-1/2">
                      <svg className="w-9 h-9" viewBox="0 0 24 24" fill="#fbbf24" opacity="0.9">
                        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                      </svg>
                    </div>
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(251,191,36,0.15)', border: '2px solid rgba(251,191,36,0.5)', boxShadow: '0 0 20px rgba(251,191,36,0.15)' }}>
                      <span className="text-base font-bold" style={{ color: '#fbbf24' }}>1</span>
                    </div>
                    <p className="text-base font-bold text-white truncate" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>{leaderboard[0].winner_name}</p>
                    <p className="font-mono text-sm mt-0.5 font-bold" style={{ color: '#22c55e' }}>{fmt(leaderboard[0].duration_seconds)}</p>
                  </div>
                </div>
                {leaderboard.length >= 3 && (
                  <div className="flex-1 max-w-[180px]">
                    <div className="rounded-t-2xl p-4 text-center flex flex-col justify-end"
                      style={{ height: '130px', background: 'linear-gradient(180deg, rgba(180,83,9,0.08), rgba(180,83,9,0.02))', border: '1px solid rgba(180,83,9,0.2)', borderBottom: 'none' }}>
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(180,83,9,0.15)', border: '2px solid rgba(180,83,9,0.4)' }}>
                        <span className="text-sm font-bold text-amber-600">3</span>
                      </div>
                      <p className="text-sm font-bold text-white truncate" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>{leaderboard[2].winner_name}</p>
                      <p className="font-mono text-xs mt-0.5" style={{ color: '#22c55e' }}>{fmt(leaderboard[2].duration_seconds)}</p>
                    </div>
                  </div>
                )}
              </div>

              {leaderboard.length > 3 && (
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(209,160,88,0.12)' }}>
                  {leaderboard.slice(3).map((e, i) => (
                    <div key={e.id}
                      className="flex items-center justify-between px-5 py-3.5 transition-all hover:bg-white/[0.02]"
                      style={{ borderBottom: i < leaderboard.length - 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <div className="flex items-center gap-4">
                        <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
                          {i + 4}
                        </span>
                        <span className="text-sm font-semibold text-white" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>{e.winner_name}</span>
                      </div>
                      <div className="flex items-center gap-5">
                        <span className="font-mono text-sm font-bold" style={{ color: '#22c55e' }}>{fmt(e.duration_seconds)}</span>
                        <span className="text-xs text-white/20">{new Date(e.ended_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* ═══ BATTLE ARCHIVES ═══ */}
        <section className="px-4 py-20 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold uppercase mb-2"
              style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#d1a058' }}>
              Battle Archives
            </h2>
            <p className="text-white/35 text-xs uppercase tracking-[0.25em]" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
              Every battle written in history
            </p>
          </div>

          {completedGames.length === 0 ? (
            <div className="text-center py-16 rounded-2xl max-w-md mx-auto"
              style={{ background: 'rgba(209,160,88,0.03)', border: '1px dashed rgba(209,160,88,0.1)' }}>
              <p className="text-white/25" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>No battles recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedGames.map((game, idx) => (
                <div key={game.id}
                  className="rounded-xl p-5 md:p-6 transition-all group"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(209,160,88,0.08)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(209,160,88,0.22)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(209,160,88,0.08)')}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(209,160,88,0.08)', border: '1px solid rgba(209,160,88,0.2)' }}>
                        <span className="text-xs font-bold" style={{ color: 'rgba(209,160,88,0.7)' }}>#{completedGames.length - idx}</span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {game.beat_the_host_game_players.map((gp: GamePlayer) => (
                            <span key={gp.id} className="text-xs px-2 py-0.5 rounded"
                              style={{
                                background: gp.player_id === game.winner_id ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${gp.player_id === game.winner_id ? 'rgba(251,191,36,0.28)' : 'rgba(255,255,255,0.05)'}`,
                                color: gp.player_id === game.winner_id ? '#fbbf24' : 'rgba(255,255,255,0.45)',
                                fontFamily: "'BlinkerSemiBold', sans-serif",
                              }}>
                              {gp.player_id === game.winner_id && (
                                <svg className="inline w-2.5 h-2.5 mr-1 -mt-0.5" viewBox="0 0 24 24" fill="#fbbf24">
                                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/>
                                </svg>
                              )}
                              {gp.player_name}
                            </span>
                          ))}
                          <span className="text-xs px-2 py-0.5 rounded"
                            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)', color: 'rgba(239,68,68,0.5)' }}>
                            Host
                          </span>
                        </div>
                        <p className="text-xs text-white/20" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                          {new Date(game.started_at).toLocaleDateString()} · {new Date(game.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 md:flex-shrink-0">
                      {game.winner_name && (
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-white/20 mb-0.5">Winner</p>
                          <p className="text-sm font-bold" style={{ color: '#fbbf24', fontFamily: "'BlinkerSemiBold', sans-serif" }}>{game.winner_name}</p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-white/20 mb-0.5">Time</p>
                        <p className="font-mono text-sm font-bold" style={{ color: '#22c55e' }}>
                          {game.duration_seconds ? fmt(game.duration_seconds) : '--:--'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="h-24" />
      </div>
    </div>
  )
}
