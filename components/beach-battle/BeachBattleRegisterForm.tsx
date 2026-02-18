'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { gsap } from '@/lib/gsap'
import Link from 'next/link'
import Image from 'next/image'

const TRIBES = [
  { name: 'Lava', color: '#ef4444', element: 'Fire', icon: '\uD83D\uDD25', glowColor: 'rgba(239,68,68,0.5)' },
  { name: 'Rain', color: '#3b82f6', element: 'Water', icon: '\uD83C\uDF27\uFE0F', glowColor: 'rgba(59,130,246,0.5)' },
  { name: 'Wind', color: '#e0e0e0', element: 'Air', icon: '\uD83C\uDF2C\uFE0F', glowColor: 'rgba(224,224,224,0.4)' },
  { name: 'Mountain', color: '#a78bfa', element: 'Earth', icon: '\uD83C\uDFD4\uFE0F', glowColor: 'rgba(167,139,250,0.5)' },
]

type FormState = 'loading' | 'idle' | 'submitting' | 'revealing' | 'success' | 'error' | 'closed'

interface SlotStatus {
  total: number
  maxPlayers: number
  isFull: boolean
  tribes: { tribe: string; count: number; maxPerTribe: number }[]
}

interface RegistrationResult {
  id: string
  name: string
  email: string
  phone: string
  tribe: string
  playerNumber: number
}

export function BeachBattleRegisterForm() {
  const formRef = useRef<HTMLDivElement>(null)
  const revealContainerRef = useRef<HTMLDivElement>(null)
  const tribeIconRef = useRef<HTMLDivElement>(null)
  const tribeNameRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const spinnerRef = useRef<HTMLDivElement>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [formState, setFormState] = useState<FormState>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [slotStatus, setSlotStatus] = useState<SlotStatus | null>(null)
  const [result, setResult] = useState<RegistrationResult | null>(null)
  const [assignedTribe, setAssignedTribe] = useState<(typeof TRIBES)[0] | null>(null)

  // Fetch slot status on mount
  useEffect(() => {
    fetchSlotStatus()
  }, [])

  const fetchSlotStatus = async () => {
    try {
      const res = await fetch('/api/beach-battle/register?status=true')
      const data = await res.json()
      if (data.success && data.data) {
        setSlotStatus(data.data)
        if (data.data.isFull) {
          setFormState('closed')
        } else {
          setFormState('idle')
        }
      } else {
        setFormState('idle')
      }
    } catch {
      setFormState('idle')
    }
  }

  // Entrance animation
  useEffect(() => {
    if (formState !== 'idle' && formState !== 'closed') return
    if (!formRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 40, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', delay: 0.15 }
      )
    })
    return () => { ctx.revert() }
  }, [formState])

  // Epic tribe reveal animation sequence
  const playRevealAnimation = useCallback(() => {
    if (!revealContainerRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline()

      // Phase 1: Container fades in with scale
      tl.fromTo(revealContainerRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
      )

      // Phase 2: Spinner cycles through tribes rapidly
      if (spinnerRef.current) {
        const icons = spinnerRef.current.querySelectorAll('.tribe-spin-icon')
        // Fast cycle animation
        icons.forEach((icon, i) => {
          tl.fromTo(icon,
            { opacity: 0, scale: 0.5, y: 30 },
            { opacity: 1, scale: 1.2, y: 0, duration: 0.15, ease: 'power2.out' },
            `-=${i === 0 ? 0 : 0.05}`
          )
          tl.to(icon,
            { opacity: 0, scale: 0.5, y: -30, duration: 0.15, ease: 'power2.in' },
            '+=0.1'
          )
        })
        // Repeat faster
        icons.forEach((icon) => {
          tl.fromTo(icon,
            { opacity: 0, scale: 0.5, y: 20 },
            { opacity: 1, scale: 1.3, y: 0, duration: 0.1, ease: 'power2.out' }
          )
          tl.to(icon,
            { opacity: 0, scale: 0.5, y: -20, duration: 0.1, ease: 'power2.in' },
            '+=0.05'
          )
        })
      }

      // Phase 3: Hide spinner, reveal the chosen tribe icon with an explosion
      if (spinnerRef.current) {
        tl.to(spinnerRef.current, { opacity: 0, scale: 0.3, duration: 0.3 })
      }

      if (tribeIconRef.current) {
        tl.fromTo(tribeIconRef.current,
          { opacity: 0, scale: 0, filter: 'blur(20px)', rotation: -180 },
          { opacity: 1, scale: 1, filter: 'blur(0px)', rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' },
          '-=0.1'
        )
        // Pulse glow
        tl.to(tribeIconRef.current, {
          scale: 1.15, duration: 0.3, ease: 'power2.out',
          yoyo: true, repeat: 1,
        })
      }

      // Phase 4: Tribe name slams in
      if (tribeNameRef.current) {
        tl.fromTo(tribeNameRef.current,
          { opacity: 0, y: 40, scale: 1.5, filter: 'blur(10px)' },
          { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'back.out(1.7)' },
          '-=0.4'
        )
      }

      // Phase 5: Card slides up
      if (cardRef.current) {
        tl.fromTo(cardRef.current,
          { opacity: 0, y: 60, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' },
          '-=0.2'
        )
      }

      // Phase 6: set final state
      tl.call(() => setFormState('success'))
    })

    return () => { ctx.revert() }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setFormState('submitting')

    try {
      const res = await fetch('/api/beach-battle/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        if (res.status === 409) {
          setFormState('closed')
          return
        }
        setFormState('error')
        setErrorMsg(data.error || 'Something went wrong. Please try again.')
        return
      }

      // Store result from server (includes auto-assigned tribe)
      const reg = data.data as RegistrationResult
      setResult(reg)
      const tribeData = TRIBES.find((t) => t.name === reg.tribe) || TRIBES[0]
      setAssignedTribe(tribeData)

      // Enter reveal phase — animation will transition to success
      setFormState('revealing')
    } catch {
      setFormState('error')
      setErrorMsg('Network error. Please check your connection and try again.')
    }
  }

  // Trigger reveal animation when state becomes 'revealing'
  useEffect(() => {
    if (formState === 'revealing') {
      // Small delay to let DOM render
      const t = setTimeout(() => playRevealAnimation(), 100)
      return () => clearTimeout(t)
    }
  }, [formState, playRevealAnimation])

  const isDark = (tribeName: string) => tribeName === 'Mountain'
  const displayColor = (t: (typeof TRIBES)[0]) => isDark(t.name) ? '#c4b5fd' : t.color

  // ──────────── Loading ────────────
  if (formState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">
              {'\uD83C\uDF0A'}
            </div>
          </div>
          <p className="text-xs uppercase tracking-widest"
            style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(6,182,212,0.5)' }}>
            Consulting the Ocean...
          </p>
        </div>
      </div>
    )
  }

  // ──────────── Battle Closed ────────────
  if (formState === 'closed') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div ref={formRef} className="w-full max-w-md text-center opacity-0">
          <div className="text-6xl sm:text-7xl mb-5 inline-block" style={{ filter: 'drop-shadow(0 0 30px rgba(239,68,68,0.3))' }}>
            {'\u2694\uFE0F'}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase mb-3"
            style={{
              fontFamily: "'TheWalkyrDemo', serif", color: '#ef4444',
              textShadow: '0 0 40px rgba(239,68,68,0.2), 2px 4px 8px rgba(0,0,0,0.6)',
            }}>
            Battle Closed
          </h1>

          <p className="text-sm text-white/50 mb-4 max-w-xs mx-auto"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            All <span className="text-white/80 font-semibold">16 warrior slots</span> have been claimed.
            The arena is at full capacity.
          </p>

          {/* Tribe slots visual */}
          <div className="grid grid-cols-2 gap-3 mb-8 max-w-xs mx-auto">
            {TRIBES.map((t) => {
              const count = slotStatus?.tribes.find((s) => s.tribe === t.name)?.count ?? 4
              return (
                <div key={t.name} className="rounded-xl p-3 text-center"
                  style={{
                    background: 'linear-gradient(145deg, rgba(6,30,50,0.5) 0%, rgba(0,0,0,0.7) 100%)',
                    border: `1px solid ${displayColor(t)}25`,
                  }}>
                  <div className="text-2xl mb-1">{t.icon}</div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold"
                    style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: displayColor(t) }}>
                    {t.name}
                  </p>
                  <p className="text-[9px] text-white/40 mt-0.5"
                    style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                    {count}/4 warriors
                  </p>
                </div>
              )
            })}
          </div>

          <div className="rounded-xl p-4 mb-6"
            style={{
              background: 'linear-gradient(145deg, rgba(239,68,68,0.05) 0%, rgba(0,0,0,0.4) 100%)',
              border: '1px solid rgba(239,68,68,0.15)',
            }}>
            <p className="text-xs text-white/60" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
              {'\uD83D\uDD14'} Check back soon for the next battle slot!
            </p>
          </div>

          <Link href="/beach-battle"
            className="inline-block px-8 py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-95"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              background: 'linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(14,116,144,0.3) 100%)',
              border: '1.5px solid rgba(6,182,212,0.4)', color: '#e0f2fe',
              boxShadow: '0 0 35px rgba(6,182,212,0.1)',
            }}>
            {'\u2190'} Back to Beach Battle
          </Link>
        </div>
      </div>
    )
  }

  // ──────────── Reveal Animation + Success ────────────
  if ((formState === 'revealing' || formState === 'success') && assignedTribe && result) {
    const tc = assignedTribe
    const dc = displayColor(tc)

    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div ref={revealContainerRef} className="w-full max-w-md text-center" style={{ opacity: 0 }}>
          {/* Background glow */}
          <div className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
            style={{ background: `radial-gradient(circle at 50% 40%, ${tc.color}10, transparent 60%)` }} />

          {/* Tribe cycle spinner (shows during animation, hidden after) */}
          <div ref={spinnerRef} className="relative z-10 h-28 flex items-center justify-center mb-2"
            style={{ display: formState === 'success' ? 'none' : 'flex' }}>
            {TRIBES.map((t, i) => (
              <div key={i} className="tribe-spin-icon absolute text-6xl" style={{ opacity: 0 }}>
                {t.icon}
              </div>
            ))}
          </div>

          {/* Final tribe icon */}
          <div ref={tribeIconRef} className="relative z-10 text-7xl sm:text-8xl mb-3 inline-block"
            style={{
              opacity: formState === 'success' ? 1 : 0,
              filter: `drop-shadow(0 0 40px ${tc.glowColor})`,
            }}>
            {tc.icon}
          </div>

          {/* Tribe name */}
          <div ref={tribeNameRef} className="relative z-10"
            style={{ opacity: formState === 'success' ? 1 : 0 }}>
            <p className="text-[10px] uppercase tracking-[0.25em] mb-1"
              style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(148,216,240,0.5)' }}>
              The Ocean has chosen
            </p>
            <h2 className="text-4xl sm:text-6xl font-bold uppercase mb-1"
              style={{
                fontFamily: "'TheWalkyrDemo', serif", color: dc,
                textShadow: `0 0 30px ${tc.glowColor}`,
              }}>
              {tc.name}
            </h2>
            <p className="text-[11px] uppercase tracking-[0.15em] mb-5"
              style={{ fontFamily: "'BlinkerRegular', sans-serif", color: `${dc}99` }}>
              Element of {tc.element}
            </p>
          </div>

          {/* Warrior Card */}
          <div ref={cardRef} className="relative z-10"
            style={{ opacity: formState === 'success' ? 1 : 0 }}>
            <div className="inline-block rounded-xl p-5 sm:p-6 mb-6 min-w-[280px] sm:min-w-[320px] text-left relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(6,30,50,0.6) 0%, rgba(0,0,0,0.75) 100%)',
                border: `1.5px solid ${dc}30`,
                boxShadow: `0 0 40px ${tc.glowColor.replace(/[\d.]+\)$/, '0.1)')}`,
              }}>
              {/* Corner accents */}
              {[['top-2 left-2', 'border-t border-l'], ['top-2 right-2', 'border-t border-r'],
                ['bottom-2 left-2', 'border-b border-l'], ['bottom-2 right-2', 'border-b border-r']].map(([pos, border], i) => (
                <div key={i} className={`absolute ${pos} w-3 h-3 ${border}`}
                  style={{ borderColor: `${dc}40` }} />
              ))}

              <p className="text-[8px] uppercase tracking-[0.3em] mb-4 text-center"
                style={{ fontFamily: "'BlinkerRegular', sans-serif", color: `${dc}60` }}>
                Registration Confirmed
              </p>

              <div className="space-y-3">
                {[
                  { label: 'Warrior', value: result.name },
                  { label: 'Tribe', value: `${tc.icon} ${tc.name}` },
                  { label: 'Player #', value: `${tc.name.substring(0, 1)}${String(result.playerNumber).padStart(2, '0')}` },
                  { label: 'Email', value: result.email },
                  { label: 'Phone', value: result.phone },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase tracking-wider"
                        style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.3)' }}>
                        {item.label}
                      </span>
                      <span className="text-sm font-bold truncate max-w-[180px]"
                        style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#e2e8f0' }}>
                        {item.value}
                      </span>
                    </div>
                    {i < 4 && (
                      <div className="h-px mt-2"
                        style={{ background: `linear-gradient(90deg, transparent, ${dc}15, transparent)` }} />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-3 text-center">
                <p className="text-[8px] uppercase tracking-[0.2em]"
                  style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: `${dc}70` }}>
                  {'\u2726'} {tc.name} Warrior {'\u2726'}
                </p>
              </div>
            </div>

            {/* CTA */}
            <Link href="/beach-battle"
              className="inline-block px-8 py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-95"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
                background: 'linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(14,116,144,0.3) 100%)',
                border: '1.5px solid rgba(6,182,212,0.4)', color: '#e0f2fe',
                boxShadow: '0 0 35px rgba(6,182,212,0.1)',
              }}>
              Explore the Arena
            </Link>
          </div>
        </div>

        <style jsx>{`
          @keyframes glowPulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  // ──────────── Form State ────────────
  const slotsLeft = slotStatus ? slotStatus.maxPlayers - slotStatus.total : null

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 sm:py-20">
      <div ref={formRef} className="w-full max-w-md opacity-0">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/beach-battle" className="inline-block">
            <Image src="/Zambaara.png" alt="Zambaara" width={120} height={40}
              className="mx-auto opacity-70 hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] mb-2"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6,182,212,0.6)' }}>
            Beach Battle Registration
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase mb-3"
            style={{
              fontFamily: "'TheWalkyrDemo', serif", color: '#e2e8f0',
              textShadow: '0 0 40px rgba(6,182,212,0.2), 2px 4px 8px rgba(0,0,0,0.6)',
            }}>
            Enter The Arena
          </h1>
          <p className="text-xs sm:text-sm text-white/40 max-w-xs mx-auto"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            Register to join the mythic tournament. The Ocean will decide your tribe.
          </p>
        </div>

        {/* Slot indicator */}
        {slotsLeft !== null && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: slotsLeft <= 4
                  ? 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(0,0,0,0.3) 100%)'
                  : 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(0,0,0,0.3) 100%)',
                border: `1px solid ${slotsLeft <= 4 ? 'rgba(239,68,68,0.25)' : 'rgba(6,182,212,0.2)'}`,
              }}>
              <div className={`w-2 h-2 rounded-full ${slotsLeft <= 4 ? 'bg-red-500' : 'bg-cyan-500'} animate-pulse`} />
              <span className="text-[10px] sm:text-xs uppercase tracking-wider"
                style={{
                  fontFamily: "'BlinkerSemiBold', sans-serif",
                  color: slotsLeft <= 4 ? '#fca5a5' : 'rgba(6,182,212,0.7)',
                }}>
                {slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} remaining
              </span>
            </div>
          </div>
        )}

        {/* Tribe orbs with live counts */}
        <div className="flex justify-center gap-3 mb-8">
          {TRIBES.map((t) => {
            const count = slotStatus?.tribes.find((s) => s.tribe === t.name)?.count ?? 0
            const full = count >= 4
            return (
              <div key={t.name} className="text-center">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg mx-auto mb-1 transition-all ${full ? 'opacity-30 grayscale' : ''}`}
                  style={{
                    background: `radial-gradient(circle at 40% 35%, ${displayColor(t)}55, ${displayColor(t)}20)`,
                    border: `1px solid ${displayColor(t)}30`,
                    boxShadow: full ? 'none' : `0 0 12px ${displayColor(t)}15`,
                  }} title={t.name}>
                  {t.icon}
                </div>
                <p className="text-[8px] uppercase tracking-wider"
                  style={{ fontFamily: "'BlinkerRegular', sans-serif", color: full ? 'rgba(255,255,255,0.2)' : `${displayColor(t)}80` }}>
                  {count}/4
                </p>
              </div>
            )
          })}
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit}
          className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(6,30,50,0.5) 0%, rgba(0,0,0,0.7) 100%)',
            border: '1px solid rgba(6,182,212,0.15)',
            boxShadow: '0 0 60px rgba(6,182,212,0.04)',
          }}>
          {/* Corner accents */}
          {[['top-3 left-3', 'border-t border-l'], ['top-3 right-3', 'border-t border-r'],
            ['bottom-3 left-3', 'border-b border-l'], ['bottom-3 right-3', 'border-b border-r'],
          ].map(([pos, border], i) => (
            <div key={i} className={`absolute ${pos} w-4 h-4 ${border}`}
              style={{ borderColor: 'rgba(6,182,212,0.2)' }} />
          ))}

          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.06), transparent 70%)', filter: 'blur(40px)' }} />

          {/* Fields */}
          <div className="space-y-5 relative z-10">
            {/* Name */}
            <div>
              <label htmlFor="reg-name"
                className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#ffffff' }}>
                Warrior Name
              </label>
              <input id="reg-name" type="text" required value={name}
                onChange={(e) => setName(e.target.value)} placeholder="Enter your name"
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-300 focus:ring-1"
                style={{
                  fontFamily: "'BlinkerRegular', sans-serif", background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(6,182,212,0.15)', color: '#e2e8f0',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.45)'; e.currentTarget.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3), 0 0 15px rgba(6,182,212,0.08)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.15)'; e.currentTarget.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3)' }} />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email"
                className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#ffffff' }}>
                Battle Scroll (Email)
              </label>
              <input id="reg-email" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-300 focus:ring-1"
                style={{
                  fontFamily: "'BlinkerRegular', sans-serif", background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(6,182,212,0.15)', color: '#e2e8f0',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.45)'; e.currentTarget.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3), 0 0 15px rgba(6,182,212,0.08)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.15)'; e.currentTarget.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3)' }} />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="reg-phone"
                className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#ffffff' }}>
                Signal Line (Phone)
              </label>
              <input id="reg-phone" type="tel" required value={phone}
                onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210"
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-300 focus:ring-1"
                style={{
                  fontFamily: "'BlinkerRegular', sans-serif", background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(6,182,212,0.15)', color: '#e2e8f0',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.45)'; e.currentTarget.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3), 0 0 15px rgba(6,182,212,0.08)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.15)'; e.currentTarget.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3)' }} />
            </div>
          </div>

          {/* Error message */}
          {formState === 'error' && errorMsg && (
            <div className="mt-4 px-4 py-3 rounded-lg text-xs text-center"
              style={{
                fontFamily: "'BlinkerRegular', sans-serif",
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5',
              }}>
              {errorMsg}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.15), transparent)' }} />
          </div>

          {/* Submit button */}
          <button type="submit" disabled={formState === 'submitting'}
            className="w-full px-6 py-4 rounded-xl font-semibold uppercase tracking-wider text-sm transition-all duration-500 relative overflow-hidden group active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              background: 'linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(14,116,144,0.35) 100%)',
              border: '1.5px solid rgba(6,182,212,0.4)', color: '#e0f2fe',
              boxShadow: '0 0 35px rgba(6,182,212,0.1)', minHeight: '52px',
            }}
            onMouseEnter={(e) => { if (formState !== 'submitting') e.currentTarget.style.boxShadow = '0 0 55px rgba(6,182,212,0.25)' }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 35px rgba(6,182,212,0.1)' }}>
            <span className="relative z-10">
              {formState === 'submitting' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  The Ocean is Deciding...
                </span>
              ) : (
                '\u2726 Join The Battle'
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>

          {/* Footer note */}
          <p className="text-center text-[9px] sm:text-[10px] mt-5"
            style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.2)' }}>
            By registering, you agree to receive battle updates via email.
          </p>
        </form>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link href="/beach-battle"
            className="text-[10px] sm:text-xs uppercase tracking-wider transition-colors duration-300 hover:text-cyan-300"
            style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(6,182,212,0.4)' }}>
            {'\u2190'} Back to Beach Battle
          </Link>
        </div>
      </div>

      <style jsx>{`
        input::placeholder {
          color: rgba(255, 255, 255, 0.15);
          font-family: 'BlinkerRegular', sans-serif;
        }
        input:focus {
          ring-color: rgba(6, 182, 212, 0.3);
        }
      `}</style>
    </div>
  )
}
