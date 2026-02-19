'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { TribeIcon, getDisplayColor } from './TribeIcons'

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

export function HallOfFameSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
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
          { opacity: 0, y: 40, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: titleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' } }
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
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.45]"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.5) 100%)' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 md:w-[500px] md:h-[500px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.3), transparent 60%)', filter: 'blur(80px)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] mb-2"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(251,191,36,0.55)' }}>
            Warriors & Zampions
          </p>
          <h2 ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase mb-3 opacity-0"
            style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#fbbf24', textShadow: '0 0 40px rgba(251,191,36,0.15)' }}>
            Hall of Fame
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/40 max-w-xs sm:max-w-md lg:max-w-lg mx-auto"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            The warriors who conquered the arena and the Zampions who claimed ultimate glory.
          </p>
        </div>

        {/* Slots */}
        <div className="space-y-8 max-w-4xl mx-auto">
          {slots.map(slot => (
            <div key={slot.slotNumber} className="rounded-xl p-5 sm:p-6"
              style={{
                background: 'linear-gradient(145deg, rgba(6,30,50,0.3) 0%, rgba(0,0,0,0.7) 100%)',
                border: '1px solid rgba(251,191,36,0.1)',
              }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
                  #{slot.slotNumber}
                </div>
                <h3 className="text-lg sm:text-xl font-bold uppercase"
                  style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#e2e8f0' }}>
                  Slot {slot.slotNumber}
                </h3>
              </div>

              {/* Warriors (Round 1 qualifiers) */}
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/30 mb-2"
                  style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                  Tribe Warriors (Round 1 Qualifiers)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {slot.warriors.map((w, i) => {
                    const color = getDisplayColor(w.tribe)
                    return (
                      <div key={i} className="rounded-lg p-3 text-center"
                        style={{
                          background: `linear-gradient(145deg, ${color}08, rgba(0,0,0,0.4))`,
                          border: `1px solid ${color}20`,
                        }}>
                        <TribeIcon tribe={w.tribe} size={20} className="mx-auto mb-1.5" />
                        <p className="text-xs font-bold truncate" style={{ color }}>{w.name}</p>
                        <p className="text-[10px] text-white/25 uppercase">{w.tribe}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Zampion */}
              {slot.zampion && (
                <div className="rounded-lg p-4 text-center"
                  style={{
                    background: 'linear-gradient(145deg, rgba(251,191,36,0.08) 0%, rgba(0,0,0,0.5) 100%)',
                    border: '1.5px solid rgba(251,191,36,0.25)',
                    boxShadow: '0 0 30px rgba(251,191,36,0.05)',
                  }}>
                  <svg className="w-6 h-6 mx-auto mb-2" viewBox="0 0 24 24" fill="#fbbf24">
                    <path d="M2 20h20v2H2v-2zm1-7l4 3V8l5 6 5-6v8l4-3-1 7H4l-1-7zm9-11l3 4h-6l3-4z" />
                  </svg>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-yellow-400/50 mb-1"
                    style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                    Zampion of the Tides
                  </p>
                  <p className="text-lg sm:text-xl font-bold uppercase"
                    style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#fbbf24', textShadow: '0 0 15px rgba(251,191,36,0.2)' }}>
                    {slot.zampion.name}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <TribeIcon tribe={slot.zampion.tribe} size={14} />
                    <span className="text-xs uppercase" style={{ color: getDisplayColor(slot.zampion.tribe) }}>
                      {slot.zampion.tribe}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
