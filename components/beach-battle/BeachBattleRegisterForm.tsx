'use client'

import { useState, useRef, useEffect } from 'react'
import { gsap } from '@/lib/gsap'
import Link from 'next/link'
import Image from 'next/image'

const TRIBES = [
  { name: 'Lava', color: '#ef4444', icon: '🔥' },
  { name: 'Rain', color: '#3b82f6', icon: '🌧️' },
  { name: 'Wind', color: '#e0e0e0', icon: '🌬️' },
  { name: 'Mountain', color: '#555', icon: '🏔️' },
]

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function BeachBattleRegisterForm() {
  const formRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [tribe, setTribe] = useState<(typeof TRIBES)[0] | null>(null)

  // Entrance animation
  useEffect(() => {
    if (!formRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 40, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', delay: 0.15 }
      )
    })
    return () => { ctx.revert() }
  }, [])

  // Success reveal animation
  useEffect(() => {
    if (formState !== 'success' || !successRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        successRef.current,
        { opacity: 0, scale: 0.88, filter: 'blur(12px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }
      )
    })
    return () => { ctx.revert() }
  }, [formState])

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
        setFormState('error')
        setErrorMsg(data.error || 'Something went wrong. Please try again.')
        return
      }

      // Assign a random tribe on success
      setTribe(TRIBES[Math.floor(Math.random() * TRIBES.length)])
      setFormState('success')
    } catch {
      setFormState('error')
      setErrorMsg('Network error. Please check your connection and try again.')
    }
  }

  // ──────────────── Success State ────────────────
  if (formState === 'success' && tribe) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div ref={successRef} className="w-full max-w-md text-center">
          {/* Glow orb */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 40%, ${tribe.color}18, transparent 55%)`,
            }}
          />

          {/* Tribe icon */}
          <div
            className="text-7xl sm:text-8xl mb-4 inline-block"
            style={{ filter: `drop-shadow(0 0 35px ${tribe.color}80)` }}
          >
            {tribe.icon}
          </div>

          <p
            className="text-[10px] uppercase tracking-[0.25em] mb-1"
            style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(148,216,240,0.5)' }}
          >
            The Ocean has chosen
          </p>

          <h2
            className="text-3xl sm:text-5xl font-bold uppercase mb-2"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: tribe.name === 'Mountain' ? '#c8c8c8' : tribe.color,
              textShadow: `0 0 30px ${tribe.color}80`,
            }}
          >
            {tribe.name} Tribe
          </h2>

          <p
            className="text-sm text-white/50 mb-8 max-w-xs mx-auto"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
          >
            Welcome, <span className="text-white/80 font-semibold">{name}</span>. You&apos;ve been
            registered for the Zambaara Beach Battle.
          </p>

          {/* Warrior card */}
          <div
            className="inline-block rounded-xl p-6 mb-8 min-w-[280px] text-left relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(6,30,50,0.6) 0%, rgba(0,0,0,0.75) 100%)',
              border: `1.5px solid ${tribe.name === 'Mountain' ? 'rgba(100,100,100,0.3)' : `${tribe.color}30`}`,
              boxShadow: `0 0 40px ${tribe.color}10`,
            }}
          >
            {/* Corner accents */}
            {[
              ['top-2 left-2', 'border-t border-l'],
              ['top-2 right-2', 'border-t border-r'],
              ['bottom-2 left-2', 'border-b border-l'],
              ['bottom-2 right-2', 'border-b border-r'],
            ].map(([pos, border], i) => (
              <div
                key={i}
                className={`absolute ${pos} w-3 h-3 ${border}`}
                style={{ borderColor: tribe.name === 'Mountain' ? '#555' : `${tribe.color}40` }}
              />
            ))}

            <p
              className="text-[8px] uppercase tracking-[0.3em] mb-4 text-center"
              style={{
                fontFamily: "'BlinkerRegular', sans-serif",
                color: tribe.name === 'Mountain' ? 'rgba(150,150,150,0.5)' : `${tribe.color}60`,
              }}
            >
              Registration Confirmed
            </p>

            <div className="space-y-3">
              {[
                { label: 'Warrior', value: name },
                { label: 'Email', value: email },
                { label: 'Phone', value: phone },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center">
                    <span
                      className="text-[9px] uppercase tracking-wider"
                      style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.3)' }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="text-sm font-bold truncate max-w-[180px]"
                      style={{
                        fontFamily: "'BlinkerSemiBold', sans-serif",
                        color: '#e2e8f0',
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      className="h-px mt-2"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${tribe.name === 'Mountain' ? 'rgba(100,100,100,0.1)' : `${tribe.color}15`}, transparent)`,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 text-center">
              <p
                className="text-[8px] uppercase tracking-[0.2em]"
                style={{
                  fontFamily: "'BlinkerSemiBold', sans-serif",
                  color: tribe.name === 'Mountain' ? 'rgba(150,150,150,0.6)' : `${tribe.color}70`,
                }}
              >
                ✦ {tribe.name} Warrior ✦
              </p>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/beach-battle"
            className="inline-block px-8 py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-95"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              background: 'linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(14,116,144,0.3) 100%)',
              border: '1.5px solid rgba(6,182,212,0.4)',
              color: '#e0f2fe',
              boxShadow: '0 0 35px rgba(6,182,212,0.1)',
            }}
          >
            Explore the Arena
          </Link>
        </div>
      </div>
    )
  }

  // ──────────────── Form State ────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 sm:py-20">
      <div ref={formRef} className="w-full max-w-md opacity-0">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/beach-battle" className="inline-block">
            <Image
              src="/Zambaara.png"
              alt="Zambaara"
              width={120}
              height={40}
              className="mx-auto opacity-70 hover:opacity-100 transition-opacity"
            />
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <p
            className="text-[10px] sm:text-xs uppercase tracking-[0.35em] mb-2"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6,182,212,0.6)' }}
          >
            Beach Battle Registration
          </p>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase mb-3"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#e2e8f0',
              textShadow: '0 0 40px rgba(6,182,212,0.2), 2px 4px 8px rgba(0,0,0,0.6)',
            }}
          >
            Enter The Arena
          </h1>
          <p
            className="text-xs sm:text-sm text-white/40 max-w-xs mx-auto"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
          >
            Register to join the mythic tournament. The Ocean will decide your tribe.
          </p>
        </div>

        {/* Tribe orbs decoration */}
        <div className="flex justify-center gap-3 mb-8">
          {TRIBES.map((t) => (
            <div
              key={t.name}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm"
              style={{
                background: `radial-gradient(circle at 40% 35%, ${t.color}55, ${t.color}20)`,
                border: `1px solid ${t.color}30`,
                boxShadow: `0 0 12px ${t.color}15`,
              }}
              title={t.name}
            >
              {t.icon}
            </div>
          ))}
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(6,30,50,0.5) 0%, rgba(0,0,0,0.7) 100%)',
            border: '1px solid rgba(6,182,212,0.15)',
            boxShadow: '0 0 60px rgba(6,182,212,0.04)',
          }}
        >
          {/* Corner accents */}
          {[
            ['top-3 left-3', 'border-t border-l'],
            ['top-3 right-3', 'border-t border-r'],
            ['bottom-3 left-3', 'border-b border-l'],
            ['bottom-3 right-3', 'border-b border-r'],
          ].map(([pos, border], i) => (
            <div
              key={i}
              className={`absolute ${pos} w-4 h-4 ${border}`}
              style={{ borderColor: 'rgba(6,182,212,0.2)' }}
            />
          ))}

          {/* Ambient glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(6,182,212,0.06), transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Fields */}
          <div className="space-y-5 relative z-10">
            {/* Name */}
            <div>
              <label
                htmlFor="reg-name"
                className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6,182,212,0.5)' }}
              >
                Warrior Name
              </label>
              <input
                id="reg-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-300 focus:ring-1"
                style={{
                  fontFamily: "'BlinkerRegular', sans-serif",
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(6,182,212,0.15)',
                  color: '#e2e8f0',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(6,182,212,0.45)'
                  e.currentTarget.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3), 0 0 15px rgba(6,182,212,0.08)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(6,182,212,0.15)'
                  e.currentTarget.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3)'
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="reg-email"
                className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6,182,212,0.5)' }}
              >
                Battle Scroll (Email)
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-300 focus:ring-1"
                style={{
                  fontFamily: "'BlinkerRegular', sans-serif",
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(6,182,212,0.15)',
                  color: '#e2e8f0',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(6,182,212,0.45)'
                  e.currentTarget.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3), 0 0 15px rgba(6,182,212,0.08)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(6,182,212,0.15)'
                  e.currentTarget.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3)'
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="reg-phone"
                className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6,182,212,0.5)' }}
              >
                Signal Line (Phone)
              </label>
              <input
                id="reg-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-300 focus:ring-1"
                style={{
                  fontFamily: "'BlinkerRegular', sans-serif",
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(6,182,212,0.15)',
                  color: '#e2e8f0',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(6,182,212,0.45)'
                  e.currentTarget.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3), 0 0 15px rgba(6,182,212,0.08)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(6,182,212,0.15)'
                  e.currentTarget.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3)'
                }}
              />
            </div>
          </div>

          {/* Error message */}
          {formState === 'error' && errorMsg && (
            <div
              className="mt-4 px-4 py-3 rounded-lg text-xs text-center"
              style={{
                fontFamily: "'BlinkerRegular', sans-serif",
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#fca5a5',
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div
              className="flex-1 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.15), transparent)' }}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={formState === 'submitting'}
            className="w-full px-6 py-4 rounded-xl font-semibold uppercase tracking-wider text-sm transition-all duration-500 relative overflow-hidden group active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              background: 'linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(14,116,144,0.35) 100%)',
              border: '1.5px solid rgba(6,182,212,0.4)',
              color: '#e0f2fe',
              boxShadow: '0 0 35px rgba(6,182,212,0.1)',
              minHeight: '52px',
            }}
            onMouseEnter={(e) => {
              if (formState !== 'submitting')
                e.currentTarget.style.boxShadow = '0 0 55px rgba(6,182,212,0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 35px rgba(6,182,212,0.1)'
            }}
          >
            <span className="relative z-10">
              {formState === 'submitting' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  The Ocean is Deciding...
                </span>
              ) : (
                '✦ Join The Battle'
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>

          {/* Footer note */}
          <p
            className="text-center text-[9px] sm:text-[10px] mt-5"
            style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.2)' }}
          >
            By registering, you agree to receive battle updates via email.
          </p>
        </form>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link
            href="/beach-battle"
            className="text-[10px] sm:text-xs uppercase tracking-wider transition-colors duration-300 hover:text-cyan-300"
            style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(6,182,212,0.4)' }}
          >
            ← Back to Beach Battle
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
