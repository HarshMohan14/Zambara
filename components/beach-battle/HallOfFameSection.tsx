'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { TribeIcon, CrownIcon, TrophyIcon, ShieldIcon, OceanIcon, getDisplayColor, TRIBES } from './TribeIcons'

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface CompletedGame {
  id: string
  slotNumber: number
  tribe: string
  status: string
  warrior?: string
  warriorId?: string
  zampion?: string
  zampionId?: string
  zampionTribe?: string
}

interface SlotData {
  slotNumber: number
  warriors: { name: string; tribe: string }[]
  zampion?: { name: string; tribe: string }
}

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function HallOfFameSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [slots, setSlots] = useState<SlotData[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/beach-battle/live')
        const json = await res.json()
        if (json.success && json.data) {
          const completed: CompletedGame[] = json.data.completed || []
          // Group by slot
          const slotMap: Record<number, SlotData> = {}
          for (const g of completed) {
            if (!slotMap[g.slotNumber]) {
              slotMap[g.slotNumber] = { slotNumber: g.slotNumber, warriors: [] }
            }
            if (g.warrior) {
              slotMap[g.slotNumber].warriors.push({ name: g.warrior, tribe: g.tribe })
            }
            if (g.zampion && g.zampionTribe) {
              slotMap[g.slotNumber].zampion = { name: g.zampion, tribe: g.zampionTribe }
            }
          }
          setSlots(Object.values(slotMap).sort((a, b) => b.slotNumber - a.slotNumber))
        }
      } catch { /* silent */ }
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 50, filter: 'blur(8px)' },
          {
            opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out',
            scrollTrigger: { trigger: titleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' }
          }
        )
      }
      if (gridRef.current) {
        gsap.fromTo(Array.from(gridRef.current.children),
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.15, ease: 'back.out(1.2)',
            scrollTrigger: { trigger: gridRef.current, start: 'top 82%', toggleActions: 'play none none reverse' }
          }
        )
      }
    }, sectionRef)
    return () => { ctx.revert() }
  }, [])

  if (slots.length === 0) return null

  return (
    <section
      ref={sectionRef}
      id="hall-of-fame"
      aria-label="Hall of Fame"
      className="relative w-full py-14 sm:py-20 md:py-28 lg:py-32 overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.5]"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.5) 100%)' }} />
        {/* Golden ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.4), transparent 60%)', filter: 'blur(100px)' }} />
        {/* Ocean teal accent */}
        <div className="absolute bottom-1/3 left-1/4 w-[200px] h-[200px] md:w-[350px] md:h-[350px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.4), transparent 60%)', filter: 'blur(80px)' }} />
        {/* Borders */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.15), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.15), transparent)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* ── HEADER ── */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <CrownIcon size={16} />
            <span className="text-xs uppercase tracking-[0.25em] font-semibold"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(251,191,36,0.7)' }}>
              Warriors & Zampions
            </span>
          </div>

          <h2 ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase mb-3 opacity-0"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#fbbf24',
              textShadow: '0 0 40px rgba(251,191,36,0.2), 0 0 80px rgba(251,191,36,0.08), 2px 4px 8px rgba(0,0,0,0.6)',
            }}>
            Hall of Fame
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/40 max-w-xs sm:max-w-md lg:max-w-lg mx-auto"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            The warriors who conquered the arena and the Zampions who claimed ultimate glory.
          </p>
          <div className="flex justify-center mt-4">
            <div className="w-20 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)' }} />
          </div>
        </div>

        {/* ── SLOTS ── */}
        <div ref={gridRef} className="space-y-8 max-w-4xl mx-auto">
          {slots.map(slot => (
            <div key={slot.slotNumber}
              className="rounded-2xl overflow-hidden relative"
              style={{
                background: 'linear-gradient(160deg, rgba(6,30,50,0.3) 0%, rgba(0,0,0,0.75) 100%)',
                border: '1px solid rgba(251,191,36,0.1)',
                opacity: 0,
              }}>
              {/* Decorative pattern for zampion slots */}
              {slot.zampion && (
                <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fbbf24' fill-opacity='0.5'%3E%3Cpath d='M30 8l6 12 14 2-10 10 2 14-12-6-12 6 2-14L10 22l14-2z'/%3E%3C/g%3E%3C/svg%3E")`,
                  }} />
              )}

              {/* Slot Header */}
              <div className="p-5 sm:p-6 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: 'linear-gradient(145deg, rgba(251,191,36,0.12), rgba(0,0,0,0.5))',
                      border: '1.5px solid rgba(251,191,36,0.25)',
                      color: '#fbbf24',
                      fontFamily: "'TheWalkyrDemo', serif",
                      boxShadow: '0 0 15px rgba(251,191,36,0.08)',
                    }}>
                    #{slot.slotNumber}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold uppercase"
                      style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#e2e8f0' }}>
                      Battle Slot {slot.slotNumber}
                    </h3>
                    <p className="text-xs text-white/25 uppercase tracking-wider" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                      {slot.warriors.length} warrior{slot.warriors.length !== 1 ? 's' : ''} qualified
                      {slot.zampion ? ' \u00b7 Zampion crowned' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warriors (Round 1 Qualifiers) */}
              {slot.warriors.length > 0 && (
                <div className="px-5 sm:px-6">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldIcon size={16} />
                    <p className="text-xs uppercase tracking-[0.2em] text-white/35"
                      style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                      Tribe Warriors (Round 1 Qualifiers)
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {slot.warriors.map((w, i) => {
                      const color = getDisplayColor(w.tribe)
                      const isZampion = slot.zampion?.name === w.name
                      return (
                        <div key={i} className="rounded-xl p-3 sm:p-4 text-center relative overflow-hidden transition-all duration-300"
                          style={{
                            background: isZampion
                              ? `linear-gradient(160deg, rgba(251,191,36,0.08), ${color}06, rgba(0,0,0,0.5))`
                              : `linear-gradient(160deg, ${color}08, rgba(0,0,0,0.4))`,
                            border: `1px solid ${isZampion ? 'rgba(251,191,36,0.3)' : `${color}20`}`,
                            boxShadow: isZampion ? '0 0 20px rgba(251,191,36,0.06)' : 'none',
                          }}>
                          {isZampion && (
                            <div className="absolute top-1 right-1">
                              <CrownIcon size={14} />
                            </div>
                          )}
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                            style={{
                              background: `radial-gradient(circle, ${color}25, ${color}08)`,
                              border: `1px solid ${color}25`,
                            }}>
                            <TribeIcon tribe={w.tribe} size={22} />
                          </div>
                          <p className="text-xs sm:text-sm font-bold truncate"
                            style={{
                              fontFamily: "'BlinkerSemiBold', sans-serif",
                              color: isZampion ? '#fbbf24' : color,
                            }}>
                            {w.name}
                          </p>
                          <p className="text-[10px] text-white/25 uppercase tracking-wider"
                            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                            {w.tribe}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Zampion (Ultimate Winner) */}
              {slot.zampion && (
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 mt-4">
                  <div className="rounded-xl p-5 sm:p-6 text-center relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(160deg, rgba(251,191,36,0.08) 0%, rgba(0,0,0,0.5) 100%)',
                      border: '1.5px solid rgba(251,191,36,0.25)',
                      boxShadow: '0 0 40px rgba(251,191,36,0.06), 0 0 80px rgba(251,191,36,0.02)',
                    }}>
                    <CrownIcon size={36} className="mx-auto mb-3" />

                    <p className="text-[10px] uppercase tracking-[0.3em] mb-1"
                      style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(251,191,36,0.5)' }}>
                      Zampion of the Tides
                    </p>

                    <p className="text-xl sm:text-2xl md:text-3xl font-bold uppercase mb-2"
                      style={{
                        fontFamily: "'TheWalkyrDemo', serif",
                        color: '#fbbf24',
                        textShadow: '0 0 20px rgba(251,191,36,0.3), 0 0 40px rgba(251,191,36,0.1)',
                      }}>
                      {slot.zampion.name}
                    </p>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                      style={{
                        background: `${getDisplayColor(slot.zampion.tribe)}10`,
                        border: `1px solid ${getDisplayColor(slot.zampion.tribe)}25`,
                      }}>
                      <TribeIcon tribe={slot.zampion.tribe} size={16} />
                      <span className="text-xs uppercase tracking-wider font-bold"
                        style={{ color: getDisplayColor(slot.zampion.tribe) }}>
                        {slot.zampion.tribe} Tribe
                      </span>
                    </div>

                    {/* Decorative glow */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px]"
                      style={{ background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)', opacity: 0.3 }} />
                  </div>
                </div>
              )}

              {/* No zampion yet */}
              {!slot.zampion && slot.warriors.length > 0 && (
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 mt-4">
                  <div className="rounded-xl p-4 text-center"
                    style={{ background: 'rgba(0,0,0,0.25)', border: '1px dashed rgba(251,191,36,0.12)' }}>
                    <OceanIcon size={24} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs text-white/20 uppercase tracking-wider"
                      style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                      Zampion to be crowned...
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom decorative line */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{ background: slot.zampion ? 'linear-gradient(90deg, transparent, rgba(251,191,36,0.2), transparent)' : 'transparent' }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
