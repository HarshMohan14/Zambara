'use client'

import React, { useEffect, useState, useMemo, useRef } from 'react'
import { db } from '@/lib/firebase'
import { 
  collection, 
  query, 
  onSnapshot, 
  where,
  Timestamp 
} from 'firebase/firestore'
import Link from 'next/link'

interface BthPlayer {
  id: string
  name: string
  number: string
}

interface BthGame {
  id: string
  players: BthPlayer[]
  startTime: any
  endTime?: any
  status: 'active' | 'ended'
  winnerId?: string
  winnerName?: string
  duration?: number // in seconds
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


// Canvas Particle interface for elemental animations
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
  spinRadius?: number
  angle?: number
  speed?: number
}

// Live timer component for active games
function ActiveTimer({ startTime }: { startTime: any }) {
  const [elapsed, setElapsed] = useState('00:00')

  useEffect(() => {
    if (!startTime) return

    const startMs = startTime instanceof Timestamp 
      ? startTime.toMillis() 
      : (startTime?.seconds ? startTime.seconds * 1000 : Date.now())

    const updateTimer = () => {
      const diffSecs = Math.floor((Date.now() - startMs) / 1000)
      if (diffSecs < 0) {
        setElapsed('00:00')
        return
      }
      const mins = Math.floor(diffSecs / 60)
      const secs = diffSecs % 60
      setElapsed(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  return <span className="font-mono text-xl md:text-2xl text-[#d1a058] tracking-widest font-black drop-shadow-[0_0_10px_rgba(209,160,88,0.5)]">{elapsed}</span>
}

// Elite Tournament Crown Icon Component
function TournamentCrown({ tier }: { tier: 'gold' | 'silver' | 'bronze' }) {
  const colors = {
    gold: {
      stroke: '#d1a058',
      glow: 'rgba(209, 160, 88, 0.4)',
      fill: 'url(#goldGradient)'
    },
    silver: {
      stroke: '#94a3b8',
      glow: 'rgba(148, 163, 184, 0.2)',
      fill: 'url(#silverGradient)'
    },
    bronze: {
      stroke: '#c2410c',
      glow: 'rgba(194, 65, 12, 0.2)',
      fill: 'url(#bronzeGradient)'
    }
  }

  const activeColor = colors[tier]

  return (
    <svg 
      className="w-10 h-10 filter drop-shadow-[0_0_6px_var(--glow-color)]" 
      style={{ '--glow-color': activeColor.glow } as React.CSSProperties}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={activeColor.stroke} 
      strokeWidth="1.5"
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#d1a058" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>
        <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="bronzeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffedd5" />
          <stop offset="50%" stopColor="#c2410c" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
      </defs>
      <path strokeLinecap="round" strokeLinejoin="round" fill={activeColor.fill} d="M2 4.5l3 9h14l3-9-5 3.5-5-5.5-5 5.5-5-3.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 18.5h18" strokeWidth="2" />
      <circle cx="2" cy="4.5" r="1.2" fill={activeColor.stroke} />
      <circle cx="12" cy="2.5" r="1.2" fill={activeColor.stroke} />
      <circle cx="22" cy="4.5" r="1.2" fill={activeColor.stroke} />
    </svg>
  )
}

// Elemental Spinner Section Component
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

export default function BeatTheHostPage() {
  const [activeGames, setActiveGames] = useState<BthGame[]>([])
  const [leaderboard, setLeaderboard] = useState<BthGame[]>([])
  const [loading, setLoading] = useState(true)
  
  // Interactive search query
  const [searchQuery, setSearchQuery] = useState('')

  // Real-time listeners
  useEffect(() => {
    // 1. Listen Active BTH Games
    const qActive = query(collection(db, 'bth_games'), where('status', '==', 'active'))
    const unsubscribeActive = onSnapshot(qActive, (snapshot) => {
      const data: BthGame[] = []
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as BthGame)
      })
      data.sort((a, b) => {
        const tA = a.startTime?.seconds || 0
        const tB = b.startTime?.seconds || 0
        return tB - tA
      })
      setActiveGames(data)
      setLoading(false)
    }, (err) => {
      console.error('Active games listener error:', err)
      setLoading(false)
    })

    // 2. Listen Ended Games (for leaderboard)
    const qEnded = query(collection(db, 'bth_games'), where('status', '==', 'ended'))
    const unsubscribeEnded = onSnapshot(qEnded, (snapshot) => {
      const endedData: BthGame[] = []
      snapshot.forEach((doc) => {
        endedData.push({ id: doc.id, ...doc.data() } as BthGame)
      })

      // Leaderboard: only players who beat host, sorted by duration asc
      const winners = endedData.filter(g => g.winnerName && g.winnerName !== 'Host')
      winners.sort((a, b) => (a.duration || 0) - (b.duration || 0))
      setLeaderboard(winners)
    }, (err) => {
      console.error('Ended games listener error:', err)
    })

    return () => {
      unsubscribeActive()
      unsubscribeEnded()
    }
  }, [])

  // Format seconds to MM:SS helper
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Filtered leaderboard records based on search query
  const filteredLeaderboard = useMemo(() => {
    return leaderboard.filter(g => 
      g.winnerName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [leaderboard, searchQuery])

  // Top 3 winners for the podium layout
  const topThree = useMemo(() => {
    return leaderboard.slice(0, 3)
  }, [leaderboard])

  // Remaining leaderboard records
  const remainingLeaderboard = useMemo(() => {
    return leaderboard.slice(3)
  }, [leaderboard])

  return (
    <main className="min-h-screen relative pt-24 pb-20 px-4 overflow-hidden bg-black/95">
      
      {/* Floating Particles/Embers Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/10 w-2 h-2 bg-[#d1a058]/20 rounded-full animate-float-slow-1" />
        <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-red-500/10 rounded-full animate-float-slow-2" />
        <div className="absolute top-4/5 left-1/3 w-1.5 h-1.5 bg-[#d1a058]/35 rounded-full animate-float-slow-3" />
        <div className="absolute top-1/10 left-4/5 w-2.5 h-2.5 bg-yellow-500/15 rounded-full animate-float-slow-4" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10 space-y-16">
        
        {/* Navigation Breadcrumb & Back Link */}
        <div className="flex justify-between items-center border-b border-[#d1a058]/10 pb-4">
          <Link
            href="/#hero"
            className="inline-flex items-center gap-2 transition-all duration-300 hover:opacity-80 group text-[#d1a058] text-sm"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
          >
            <span className="transform group-hover:-translate-x-1 transition-transform">←</span> Back to Home
          </Link>
          <div className="text-white/40 text-xs uppercase tracking-widest font-mono">
            Arena Registry v2.0
          </div>
        </div>

        {/* Hero Banner Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/25 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded">
            Live Tournament Event
          </div>
          <h1
            className="text-4xl md:text-6xl font-black text-center tracking-wide uppercase"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#d1a058',
              textShadow: '0 0 15px rgba(209, 160, 88, 0.35), 2px 2px 4px rgba(0, 0, 0, 0.95)',
            }}
          >
            Beat the Host
          </h1>
          <p
            className="text-white/70 max-w-xl mx-auto text-sm md:text-base leading-relaxed"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
          >
            Do you have what it takes to vanquish the Host? Track live active battles as warriors challenge the reigning champion, and check the Hall of Fame for the fastest winners of the night.
          </p>
        </div>

        {/* 1. Active Battles Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[#d1a058]/20 pb-3">
            <span className="text-2xl">⚔</span>
            <h2 className="text-2xl md:text-3xl font-bold uppercase text-[#d1a058]" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
              Live Arena Matchups
            </h2>
          </div>

          {loading ? (
            <div className="bg-black/60 border border-[#d1a058]/20 rounded-2xl p-12 text-center space-y-4 shadow-lg backdrop-blur-md">
              <div className="w-12 h-12 border-4 border-[#d1a058] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white/60 font-semibold tracking-wider uppercase text-xs animate-pulse">Syncing Arena Data...</p>
            </div>
          ) : activeGames.length === 0 ? (
            <div className="bg-black/40 border border-[#d1a058]/20 rounded-xl p-10 text-center relative overflow-hidden shadow-2xl backdrop-blur-md group hover:border-[#d1a058]/40 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d1a058]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="text-4xl mb-3 animate-bounce">👹</div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                Arena Status: Waiting for Challengers
              </h3>
              <p className="text-white/50 text-xs max-w-md mx-auto" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                The Host sits unchallenged in the elemental chamber. Register at the organizer desk to launch a battle and claim your spot on the Leaderboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {activeGames.map((game) => (
                <div 
                  key={game.id} 
                  className="bg-black border-2 border-red-500/30 hover:border-red-500/50 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.1)] relative backdrop-blur-md transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  {/* Energy border gradient backdrop */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-red-500 to-purple-600 animate-pulse" />
                  
                  {/* Split VS Battle Screen Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 items-center text-center">
                    
                    {/* Challengers Card (Left) */}
                    <div className="md:col-span-5 p-8 bg-gradient-to-br from-yellow-950/20 via-yellow-900/10 to-transparent relative overflow-hidden flex flex-col justify-center min-h-[160px]">
                      <div className="absolute top-0 left-0 w-24 h-24 bg-yellow-500/5 blur-3xl rounded-full" />
                      <span className="text-[10px] tracking-widest text-[#d1a058] font-bold uppercase mb-2">Challenger Team</span>
                      <h4 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide uppercase line-clamp-2" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                        {game.players.map(p => p.name).join(' & ')}
                      </h4>
                      <div className="mt-3 flex justify-center gap-1.5">
                        {game.players.map((p, idx) => (
                          <span key={p.id} className="text-[10px] bg-yellow-500/10 border border-yellow-500/20 text-[#d1a058] px-2 py-0.5 rounded-full">
                            WARRIOR #{idx + 1}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Central Timer & Pulse (Middle) */}
                    <div className="md:col-span-2 p-6 flex flex-col items-center justify-center border-y md:border-y-0 md:border-x border-white/10 bg-black/60 relative">
                      {/* Pulse ring animation */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 border border-[#d1a058]/30 rounded-full animate-ping opacity-40" />
                      </div>
                      
                      <div className="z-10 flex flex-col items-center">
                        <span className="text-xs uppercase tracking-widest text-red-500 font-bold mb-1 animate-pulse">CLASHING</span>
                        <div className="my-1">
                          <ActiveTimer startTime={game.startTime} />
                        </div>
                        <span className="text-[10px] font-mono text-white/40 mt-1">ELAPSED TIME</span>
                      </div>
                    </div>

                    {/* The Host Card (Right) */}
                    <div className="md:col-span-5 p-8 bg-gradient-to-bl from-purple-950/20 via-red-950/10 to-transparent relative overflow-hidden flex flex-col justify-center min-h-[160px]">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-3xl rounded-full" />
                      <span className="text-[10px] tracking-widest text-purple-400 font-bold uppercase mb-2">Defending Master</span>
                      <h4 className="text-2xl md:text-3xl font-extrabold text-red-500 tracking-wide uppercase" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                        THE HOST
                      </h4>
                      <div className="mt-3 flex justify-center">
                        <span className="text-[10px] bg-red-500/15 border border-red-500/30 text-red-400 px-3 py-0.5 rounded-full font-mono uppercase tracking-wider animate-pulse">
                          👹 BOSS LEVEL
                        </span>
                      </div>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

        {/* Dynamic Interactive Spinner Wheel Section */}
        <ElementalSpinner />

        {/* 2. Leaderboard Section */}
        <section className="space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#d1a058]/20 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <h2 className="text-2xl md:text-3xl font-bold uppercase text-[#d1a058]" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
                Hall of Fame
              </h2>
            </div>
            
            {/* Leaderboard Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search Zampions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/80 border border-[#d1a058]/30 hover:border-[#d1a058]/55 focus:border-[#d1a058] rounded px-3 py-1.5 text-xs text-white placeholder-white/35 focus:outline-none transition-all w-full sm:w-48"
                style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-xs"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {leaderboard.length === 0 ? (
            <div className="bg-black/40 border border-[#d1a058]/20 rounded-xl p-8 text-center text-white/40 text-sm">
              No record-breaking player victories logged yet. Be the first to defeat the host!
            </div>
          ) : (
            <div className="space-y-6 font-sans">
              
              {/* Premium Top 3 Legends Roll */}
              {!searchQuery && topThree.length > 0 && (
                <div className="flex flex-col gap-4">
                  
                  {/* Legend Rank 1 Card */}
                  <div className="bg-gradient-to-r from-yellow-950/20 via-black/80 to-yellow-950/10 border border-yellow-500/40 rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_0_35px_rgba(209,160,88,0.15)] relative overflow-hidden transition-all duration-300 hover:border-yellow-500/70 hover:shadow-[0_0_40px_rgba(209,160,88,0.22)] group">
                    <div className="absolute -inset-px bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                      <div className="flex-shrink-0 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <TournamentCrown tier="gold" />
                      </div>
                      <div className="text-left space-y-1">
                        <span className="text-[10px] tracking-widest text-yellow-500 font-extrabold uppercase font-mono block">
                          I // SUPREME CHAMPION
                        </span>
                        <h3 
                          className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide gold-shimmer-text"
                          style={{ fontFamily: "'TheWalkyrDemo', serif" }}
                        >
                          {topThree[0].winnerName}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 relative z-10 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                      <div className="text-left md:text-right">
                        <span className="text-[9px] uppercase tracking-widest text-white/30 font-mono block mb-1">RECORD TIME</span>
                        <div className="text-3xl font-black text-yellow-400 font-mono drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]">
                          {topThree[0].duration ? formatDuration(topThree[0].duration) : '00:00'}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-widest text-white/30 font-mono block mb-1">DATE ACHIEVED</span>
                        <div className="text-xs font-mono text-white/70">
                          {topThree[0].endTime instanceof Timestamp
                            ? topThree[0].endTime.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
                            : (topThree[0].endTime?.seconds ? new Date(topThree[0].endTime.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'N/A')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Legend Rank 2 Card */}
                  {topThree[1] && (
                    <div className="bg-gradient-to-r from-slate-900/10 via-black/80 to-slate-900/5 border border-slate-400/25 rounded-xl p-5 md:p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_0_20px_rgba(148,163,184,0.05)] relative overflow-hidden transition-all duration-300 hover:border-slate-400/50 group">
                      <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                        <div className="flex-shrink-0 p-2.5 bg-slate-400/5 border border-slate-400/20 rounded-lg">
                          <TournamentCrown tier="silver" />
                        </div>
                        <div className="text-left space-y-1">
                          <span className="text-[10px] tracking-widest text-slate-400 font-bold uppercase font-mono block">
                            II // ELITE VANGUARD
                          </span>
                          <h3 
                            className="text-xl md:text-2xl font-bold uppercase text-white/95"
                            style={{ fontFamily: "'TheWalkyrDemo', serif" }}
                          >
                            {topThree[1].winnerName}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 relative z-10 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                        <div className="text-left md:text-right">
                          <span className="text-[9px] uppercase tracking-widest text-white/30 font-mono block mb-1">RECORD TIME</span>
                          <div className="text-2xl font-bold text-slate-300 font-mono">
                            {topThree[1].duration ? formatDuration(topThree[1].duration) : '00:00'}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] uppercase tracking-widest text-white/30 font-mono block mb-1">DATE ACHIEVED</span>
                          <div className="text-xs font-mono text-white/60">
                            {topThree[1].endTime instanceof Timestamp
                              ? topThree[1].endTime.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
                              : (topThree[1].endTime?.seconds ? new Date(topThree[1].endTime.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'N/A')}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Legend Rank 3 Card */}
                  {topThree[2] && (
                    <div className="bg-gradient-to-r from-orange-950/10 via-black/80 to-orange-950/5 border border-orange-700/20 rounded-xl p-5 md:p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_0_20px_rgba(194,65,12,0.05)] relative overflow-hidden transition-all duration-300 hover:border-orange-700/40 group">
                      <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                        <div className="flex-shrink-0 p-2.5 bg-orange-700/5 border border-orange-700/15 rounded-lg">
                          <TournamentCrown tier="bronze" />
                        </div>
                        <div className="text-left space-y-1">
                          <span className="text-[10px] tracking-widest text-orange-500 font-bold uppercase font-mono block">
                            III // ELITE GLADIATOR
                          </span>
                          <h3 
                            className="text-xl md:text-2xl font-bold uppercase text-white/90"
                            style={{ fontFamily: "'TheWalkyrDemo', serif" }}
                          >
                            {topThree[2].winnerName}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 relative z-10 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                        <div className="text-left md:text-right">
                          <span className="text-[9px] uppercase tracking-widest text-white/30 font-mono block mb-1">RECORD TIME</span>
                          <div className="text-2xl font-bold text-orange-400 font-mono">
                            {topThree[2].duration ? formatDuration(topThree[2].duration) : '00:00'}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] uppercase tracking-widest text-white/30 font-mono block mb-1">DATE ACHIEVED</span>
                          <div className="text-xs font-mono text-white/60">
                            {topThree[2].endTime instanceof Timestamp
                              ? topThree[2].endTime.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
                              : (topThree[2].endTime?.seconds ? new Date(topThree[2].endTime.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'N/A')}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Roster Leaderboard Table (Remaining/Searched) */}
              <div className="bg-black/50 border border-[#d1a058]/15 rounded-xl overflow-hidden shadow-2xl relative">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#d1a058]/20 bg-black/80">
                        <th className="p-4 font-bold text-white/90 uppercase text-[10px] tracking-widest font-mono">Rank</th>
                        <th className="p-4 font-bold text-white/90 uppercase text-[10px] tracking-widest font-mono">Warrior Name</th>
                        <th className="p-4 font-bold text-white/90 uppercase text-[10px] tracking-widest font-mono">Duration</th>
                        <th className="p-4 font-bold text-white/90 uppercase text-[10px] tracking-widest font-mono text-right">Date Set</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* If searching, render all matching. Else render 4th+ place */}
                      {searchQuery ? (
                        filteredLeaderboard.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-white/40 text-xs">
                              No matching challengers found.
                            </td>
                          </tr>
                        ) : (
                          filteredLeaderboard.map((game, index) => (
                            <tr key={game.id} className="border-b border-white/5 hover:bg-[#d1a058]/5 transition-colors">
                              <td className="p-4 font-mono text-xs font-bold text-[#d1a058]">
                                {index === 0 && '👑 01'}
                                {index === 1 && '🥈 02'}
                                {index === 2 && '🥉 03'}
                                {index > 2 && `${(index + 1).toString().padStart(2, '0')}`}
                              </td>
                              <td className="p-4 text-xs font-semibold text-white tracking-wide">{game.winnerName}</td>
                              <td className="p-4 text-xs font-mono text-[#d1a058] font-bold">
                                {game.duration ? formatDuration(game.duration) : '00:00'}
                              </td>
                              <td className="p-4 text-[10px] font-mono text-white/40 text-right">
                                {game.endTime instanceof Timestamp
                                  ? game.endTime.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
                                  : (game.endTime?.seconds ? new Date(game.endTime.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'N/A')}
                              </td>
                            </tr>
                          ))
                        )
                      ) : (
                        remainingLeaderboard.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-white/30 text-xs tracking-wider font-semibold">
                              All top-ranking legends are highlighted in the banners above.
                            </td>
                          </tr>
                        ) : (
                          remainingLeaderboard.map((game, index) => {
                            const rank = index + 4
                            return (
                              <tr key={game.id} className="border-b border-white/5 hover:bg-[#d1a058]/5 transition-colors">
                                <td className="p-4 font-mono text-xs text-white/60 font-semibold">
                                  #{rank.toString().padStart(2, '0')}
                                </td>
                                <td className="p-4 text-xs font-semibold text-white tracking-wide">{game.winnerName}</td>
                                <td className="p-4 text-xs font-mono text-[#d1a058] font-bold">
                                  {game.duration ? formatDuration(game.duration) : '00:00'}
                                </td>
                                <td className="p-4 text-[10px] font-mono text-white/40 text-right">
                                  {game.endTime instanceof Timestamp
                                    ? game.endTime.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
                                    : (game.endTime?.seconds ? new Date(game.endTime.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'N/A')}
                                </td>
                              </tr>
                            )
                          })
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </section>

      </div>

      {/* Global CSS for Anime Energy Floating Embers & Gold Shimmer Text */}
      <style jsx global>{`
        @keyframes gold-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .gold-shimmer-text {
          background: linear-gradient(90deg, #d1a058 10%, #fef08a 50%, #d1a058 90%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: gold-shimmer 6s infinite linear;
          text-shadow: 0 0 12px rgba(254, 240, 138, 0.1);
        }
        @keyframes float-up-1 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.05; }
          50% { opacity: 0.3; }
          100% { transform: translate(-30px, -150px) scale(0.6); opacity: 0; }
        }
        @keyframes float-up-2 {
          0% { transform: translate(0, 0) scale(0.8); opacity: 0.1; }
          50% { opacity: 0.4; }
          100% { transform: translate(40px, -120px) scale(0.4); opacity: 0; }
        }
        @keyframes float-up-3 {
          0% { transform: translate(0, 0) scale(1.2); opacity: 0.05; }
          50% { opacity: 0.5; }
          100% { transform: translate(-20px, -180px) scale(0.5); opacity: 0; }
        }
        @keyframes float-up-4 {
          0% { transform: translate(0, 0) scale(0.9); opacity: 0.15; }
          50% { opacity: 0.3; }
          100% { transform: translate(30px, -100px) scale(0.6); opacity: 0; }
        }
        .animate-float-slow-1 {
          animation: float-up-1 8s infinite ease-in-out;
        }
        .animate-float-slow-2 {
          animation: float-up-2 9s infinite ease-in-out;
        }
        .animate-float-slow-3 {
          animation: float-up-3 10s infinite ease-in-out;
        }
        .animate-float-slow-4 {
          animation: float-up-4 7s infinite ease-in-out;
        }
      `}</style>
    </main>
  )
}
