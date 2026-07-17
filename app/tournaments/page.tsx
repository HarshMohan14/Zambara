'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'

export default function TournamentsPage() {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const firefliesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 1. Entry GSAP animations
  useEffect(() => {
    if (!mounted) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.landing-content-anim', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.15 }
      )
    }, containerRef)
    return () => ctx.revert()
  }, [mounted])

  // 2. Fireflies backdrop effect
  useEffect(() => {
    if (!mounted) return
    if (firefliesRef.current) {
      const fireflies = firefliesRef.current.children
      Array.from(fireflies).forEach((ff) => {
        const floatX = Math.random() * 200 - 100
        const floatY = Math.random() * 200 - 100
        const duration = 6 + Math.random() * 6

        gsap.to(ff, {
          x: floatX,
          y: floatY,
          opacity: 'random(0.1, 0.9)',
          duration: duration,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        })
      })
    }
  }, [mounted])

  return (
    <>
      <div 
        ref={containerRef}
        className="min-h-screen bg-black text-white relative pt-24 pb-16 overflow-hidden font-sans flex flex-col justify-center"
        style={{
          backgroundImage: "url('/magical_forest_bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Darkening overlay */}
        <div className="absolute inset-0 bg-black/75 pointer-events-none z-0"></div>

        {/* Dynamic green/teal aura */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)] z-0" />

        {/* Fireflies floating in the background */}
        <div ref={firefliesRef} className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {mounted && Array.from({ length: 15 }).map((_, index) => {
            const left = `${Math.random() * 100}%`
            const top = `${Math.random() * 100}%`
            const size = 3 + Math.random() * 5
            
            const palettes = [
              { bg: 'bg-[#10b981]/90', glow: '0 0 10px #34d399' },
              { bg: 'bg-[#06b6d4]/90', glow: '0 0 10px #22d3ee' },
              { bg: 'bg-[#d1a058]/90', glow: '0 0 10px #eebb77' }
            ]
            const styleChoice = palettes[index % palettes.length]
            
            return (
              <div 
                key={index} 
                className={`absolute rounded-full pointer-events-none ${styleChoice.bg}`}
                style={{
                  left,
                  top,
                  width: `${size}px`,
                  height: `${size}px`,
                  boxShadow: styleChoice.glow,
                }}
              />
            )
          })}
        </div>

        <div className="relative z-20 container mx-auto px-4 max-w-5xl flex flex-col items-center">
          {/* Header section */}
          <div className="text-center mb-16 landing-content-anim">
            <h1 
              className="text-4xl md:text-6xl font-black uppercase tracking-widest text-[#d1a058] mb-3"
              style={{ fontFamily: "'TheWalkyrDemo', serif", textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
            >
              Zambara Tournaments
            </h1>
            <p className="text-white/60 max-w-lg mx-auto text-sm md:text-base font-sans">
              Witness the clash of legends. Select a tournament arena below to review standings, rosters, and live stats.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto landing-content-anim">
            {/* Beach Battle card */}
            <Link 
              href="/beach-battle"
              className="group rounded-2xl border-2 border-white/10 bg-black/45 p-8 transition-all duration-300 hover:border-[#06b6d4] hover:bg-cyan-950/15 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:scale-[1.03] flex flex-col justify-between min-h-[220px]"
            >
              <div>
                <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform duration-300">🌊</span>
                <span className="text-[10px] tracking-[0.2em] font-black text-[#06b6d4] uppercase block mb-1">COASTAL DUELS</span>
                <h3 className="text-2xl font-black uppercase text-white" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>Beach Battle</h3>
                <p className="text-sm text-white/50 mt-2">32-player single elimination bracket set in the summer sun.</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#06b6d4] group-hover:translate-x-1 transition-transform">
                <span>Enter Coast Arena</span>
                <span>→</span>
              </div>
            </Link>

            {/* TagCon card */}
            <Link 
              href="/tournaments/tagcon"
              className="group rounded-2xl border-2 border-white/10 bg-black/45 p-8 transition-all duration-300 hover:border-[#d1a058] hover:bg-yellow-950/10 hover:shadow-[0_0_30px_rgba(209,160,88,0.2)] hover:scale-[1.03] flex flex-col justify-between min-h-[220px]"
            >
              <div>
                <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform duration-300">👑</span>
                <span className="text-[10px] tracking-[0.2em] font-black text-[#d1a058] uppercase block mb-1">KIOSK ARENA</span>
                <h3 className="text-2xl font-black uppercase text-white" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>TagCon Arena</h3>
                <p className="text-sm text-white/50 mt-2">Tribe battles, live seat bookings, and ultimate Zampions.</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d1a058] group-hover:translate-x-1 transition-transform">
                <span>Enter Kiosk Arena</span>
                <span>→</span>
              </div>
            </Link>

            {/* Zambaara card */}
            <Link 
              href="/tournaments/zambaara"
              className="group rounded-2xl border-2 border-white/10 bg-black/45 p-8 transition-all duration-300 hover:border-[#ff4400] hover:bg-red-950/10 hover:shadow-[0_0_30px_rgba(255,68,0,0.2)] hover:scale-[1.03] flex flex-col justify-between min-h-[220px]"
            >
              <div>
                <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform duration-300">⚔</span>
                <span className="text-[10px] tracking-[0.2em] font-black text-[#ff4400] uppercase block mb-1">ELEMENTAL ARENA</span>
                <h3 className="text-2xl font-black uppercase text-white" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>Zambaara Arena</h3>
                <p className="text-sm text-white/50 mt-2">Double-verified tribe rosters, seating, and live brackets.</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ff4400] group-hover:translate-x-1 transition-transform">
                <span>Enter Zambaara Arena</span>
                <span>→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
