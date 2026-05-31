'use client'

import React, { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'

interface ThumbScannerProps {
  onScanStart: () => void
  onScanComplete: () => void
  onScanCancel: () => void
  onScanProgress: (progress: number) => void
}

export default function ThumbScanner({ onScanStart, onScanComplete, onScanCancel, onScanProgress }: ThumbScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const progressRef = useRef(0)
  const animationRef = useRef<number | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const runeRef = useRef<SVGSVGElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)
  const sparksRef = useRef<HTMLDivElement>(null)
  const spinnerRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    // Subtle breathing magic forest energy effect
    gsap.to(runeRef.current, {
      opacity: 0.6,
      scale: 0.93,
      filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.5))',
      duration: 2.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    })
  }, [])

  // Create sparks floating from edges towards center (implosion effect during scan) or bursting outward
  const createSparks = (isStarting = false) => {
    if (!sparksRef.current) return
    const spark = document.createElement('div')
    spark.className = 'absolute w-1.5 h-1.5 rounded-full pointer-events-none'
    
    // Magical forest theme neon colors (Emerald, Teal, Gold, Mint, Purple, Indigo, Pink)
    const colors = ['#10b981', '#06b6d4', '#d1a058', '#34d399', '#a855f7', '#6366f1', '#ec4899']
    spark.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    spark.style.boxShadow = `0 0 10px ${spark.style.backgroundColor}, 0 0 3px #fff`
    
    // Position randomly on the perimeter of the scanner
    const angle = Math.random() * Math.PI * 2
    const radius = 110 // ring radius
    const startX = 128 + Math.cos(angle) * radius
    const startY = 128 + Math.sin(angle) * radius
    
    spark.style.left = `${startX}px`
    spark.style.top = `${startY}px`
    sparksRef.current.appendChild(spark)

    // Pull particles INWARD towards the rune center (imbue energy)
    gsap.to(spark, {
      left: 128,
      top: 128,
      opacity: 0.9,
      scale: 1.8,
      duration: 0.5 + Math.random() * 0.3,
      ease: 'power2.in',
      onComplete: () => {
        // Minor burst from center
        gsap.to(spark, {
          x: (Math.random() - 0.5) * 50,
          y: (Math.random() - 0.5) * 50,
          opacity: 0,
          scale: 0,
          duration: 0.3,
          ease: 'power2.out',
          onComplete: () => {
            if (sparksRef.current && sparksRef.current.contains(spark)) {
              sparksRef.current.removeChild(spark)
            }
          }
        })
      }
    })
  }

  const startScan = () => {
    setIsScanning(true)
    onScanStart()
    onScanProgress(0)
    
    // Animate intense magic charge
    gsap.killTweensOf(runeRef.current)
    gsap.to(runeRef.current, {
      opacity: 1,
      scale: 1.15,
      filter: 'drop-shadow(0 0 25px rgba(6,182,212,0.9))',
      duration: 1.5,
      ease: 'power2.out'
    })

    // Spin the progress ring container
    if (spinnerRef.current) {
      gsap.to(spinnerRef.current, {
        rotation: 360,
        duration: 2,
        repeat: -1,
        ease: 'none',
        transformOrigin: '50% 50%'
      })
    }

    const animate = () => {
      progressRef.current += 1.0 // Incremental speed
      
      // Spawn spirit particles rapidly
      createSparks()
      if (Math.random() > 0.4) {
        createSparks()
      }

      if (progressRef.current >= 100) {
        progressRef.current = 100
        setScanProgress(100)
        onScanProgress(100)
        setIsScanning(false)
        onScanComplete()
        cancelAnimationFrame(animationRef.current!)
      } else {
        setScanProgress(progressRef.current)
        onScanProgress(progressRef.current)
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }

  const cancelScan = () => {
    if (progressRef.current >= 100) return 
    
    setIsScanning(false)
    progressRef.current = 0
    setScanProgress(0)
    onScanProgress(0)
    onScanCancel()
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Stop progress ring spin and return to 0
    if (spinnerRef.current) {
      gsap.killTweensOf(spinnerRef.current)
      gsap.to(spinnerRef.current, {
        rotation: 0,
        duration: 0.8,
        ease: 'power2.out'
      })
    }

    // Revert magic state to gentle breathing
    gsap.killTweensOf(runeRef.current)
    gsap.to(runeRef.current, {
      opacity: 0.6,
      scale: 0.93,
      filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.5))',
      duration: 0.8,
      onComplete: () => {
        gsap.to(runeRef.current, {
          opacity: 0.6,
          scale: 0.93,
          filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.5))',
          duration: 2.5,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        })
      }
    })
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanline {
          0% { transform: translate(-50%, -75px); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translate(-50%, 75px); opacity: 0; }
        }
        @keyframes ripple {
          0% { width: 230px; height: 230px; opacity: 1; filter: blur(1px); }
          50% { opacity: 0.65; }
          100% { width: 350px; height: 350px; opacity: 0; filter: blur(3px); }
        }
        @keyframes ambientBreathe {
          0%, 100% { transform: scale(1.0); opacity: 0.4; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
        @keyframes flowTrail {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -45; }
        }
        .ripple-ring {
          animation: ripple 3.6s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      `}} />

      <div 
        ref={containerRef}
        className="relative flex items-center justify-center w-64 h-64 mx-auto cursor-pointer select-none touch-none group"
        onPointerDown={startScan}
        onPointerUp={cancelScan}
        onPointerLeave={cancelScan}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Breathing Ambient Halo behind scanner (Attention Effect) */}
        <div 
          className="absolute inset-[-15px] rounded-full blur-xl pointer-events-none transition-all duration-1000 z-0 mix-blend-screen"
          style={{
            background: isScanning 
              ? 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
            animation: 'ambientBreathe 4s ease-in-out infinite'
          }}
        />

        {/* Circular Radar Ripples radiating out (Attention Effect) */}
        {!isScanning && (
          <>
            <div className="absolute rounded-full border-2 border-[#10b981]/20 pointer-events-none z-0 ripple-ring" style={{ animationDelay: '0s' }} />
            <div className="absolute rounded-full border-2 border-[#06b6d4]/20 pointer-events-none z-0 ripple-ring" style={{ animationDelay: '1.2s' }} />
            <div className="absolute rounded-full border-2 border-[#d1a058]/20 pointer-events-none z-0 ripple-ring" style={{ animationDelay: '2.4s' }} />
          </>
        )}

        {/* Ancient Mossy Stone Ring Background */}
        <div 
          className="absolute inset-0 rounded-full border-4 border-[#2d3a2f] shadow-[inset_0_0_25px_rgba(0,0,0,0.9),0_0_15px_rgba(16,185,129,0.15)] bg-[#0c120d] transition-all duration-300 group-hover:border-[#38533b] z-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #0e1711 0%, #050806 100%)'
          }}
        ></div>
        
        {/* Magic Progress Ring Wrapper */}
        <div ref={spinnerRef} className="absolute inset-0 pointer-events-none z-10">
          <svg className="w-full h-full -rotate-90">
            <circle 
              cx="128" cy="128" r="110" 
              stroke="rgba(0,0,0,0.6)" 
              strokeWidth="8" 
              fill="none" 
            />
            <circle 
              ref={ringRef}
              cx="128" cy="128" r="110" 
              stroke="url(#magicalForestGradient)" 
              strokeWidth="8" 
              fill="none" 
              strokeDasharray="691"
              strokeDashoffset={691 - (691 * scanProgress) / 100}
              strokeLinecap="round"
              className="transition-all duration-75 ease-linear"
              style={{
                filter: isScanning ? 'drop-shadow(0 0 10px #22d3ee)' : 'none'
              }}
            />
            <defs>
              <linearGradient id="magicalForestGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />   {/* Emerald */}
                <stop offset="50%" stopColor="#06b6d4" />  {/* Mint Teal */}
                <stop offset="100%" stopColor="#d1a058" /> {/* Gold */}
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {/* Sparks Container */}
        <div ref={sparksRef} className="absolute inset-0 z-25 pointer-events-none mix-blend-screen"></div>

        {/* Dynamic Sweeping Neon Laser Scanline */}
        {isScanning && (
          <div 
            className="absolute left-1/2 w-[72%] h-[2.5px] bg-[#06b6d4] z-20 shadow-[0_0_10px_#22d3ee,0_0_20px_#06b6d4,0_0_4px_#fff] pointer-events-none rounded-full"
            style={{
              top: '50%',
              animation: 'scanline 1.4s ease-in-out infinite'
            }}
          />
        )}

        {/* Center Progress Text / Status Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none select-none">
          {!isScanning ? (
            <span className="text-[10px] tracking-[0.25em] text-[#34d399]/40 font-bold uppercase animate-pulse mt-0.5">
              HOLD
            </span>
          ) : (
            <span className="text-base font-black tracking-wider text-[#22d3ee] font-mono drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]">
              {Math.floor(scanProgress)}%
            </span>
          )}
        </div>

        {/* Ancient Magic Rune SVG (Glowing runes layout) */}
        <svg 
          ref={runeRef}
          className="w-24 h-24 text-[#38bdf8] z-10 filter drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-colors duration-300"
          style={{ color: isScanning ? '#22d3ee' : '#34d399' }}
          viewBox="0 0 100 100" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* Outer Hexagon with Flowing Light Trail */}
          <path 
            d="M50 8 L88 28 L88 72 L50 92 L12 72 L12 28 Z" 
            strokeWidth="2.5" 
            strokeOpacity={isScanning ? "0.9" : "0.4"} 
            strokeDasharray={isScanning ? "none" : "15 30"}
            style={{
              animation: isScanning ? 'none' : 'flowTrail 3.5s linear infinite'
            }}
          />
          {/* Inner Star/Rune Lines with Flowing Light Trail */}
          <path 
            d="M50 18 L78 34 L78 66 L50 82 L22 66 L22 34 Z" 
            strokeDasharray={isScanning ? "none" : "12 24"}
            style={{
              animation: isScanning ? 'none' : 'flowTrail 3s linear reverse infinite'
            }}
          />
          <circle cx="50" cy="50" r={isScanning ? "16" : "14"} strokeWidth="3" className="transition-all duration-300" fill={isScanning ? "rgba(6,182,212,0.12)" : "none"} />
          <path d="M50 34 L50 8" />
          <path d="M50 66 L50 92" />
          <path d="M37 42.5 L12 28" />
          <path d="M63 57.5 L88 72" />
          <path d="M63 42.5 L88 28" />
          <path d="M37 57.5 L12 72" />
          {/* Ancient dots */}
          <circle cx="50" cy="27" r="2" fill="currentColor" />
          <circle cx="50" cy="73" r="2" fill="currentColor" />
          <circle cx="29" cy="38" r="2" fill="currentColor" />
          <circle cx="71" cy="62" r="2" fill="currentColor" />
        </svg>
        
        {/* Ambient background glow for the scanner */}
        <div className={`absolute inset-0 bg-[#10b981]/15 rounded-full blur-2xl transition-all duration-1000 pointer-events-none mix-blend-screen z-10 ${isScanning ? 'scale-135 opacity-100 bg-[#06b6d4]/20' : 'scale-100 opacity-0'}`}></div>
      </div>
    </>
  )
}
