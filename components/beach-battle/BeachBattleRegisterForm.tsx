'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TribeIcon, TRIBES as TRIBE_DATA } from './TribeIcons'

const TRIBES = TRIBE_DATA.map(t => ({
  name: t.name,
  color: t.color,
  element: t.element,
  glowColor: t.glowColor,
}))

type FormState = 'loading' | 'idle' | 'submitting' | 'revealing' | 'success' | 'error' | 'closed'
type RevealPhase = 'init' | 'choosing' | 'tribe' | 'card'

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
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [formState, setFormState] = useState<FormState>('loading')
  const [revealPhase, setRevealPhase] = useState<RevealPhase>('init')
  const [errorMsg, setErrorMsg] = useState('')
  const [slotStatus, setSlotStatus] = useState<SlotStatus | null>(null)
  const [result, setResult] = useState<RegistrationResult | null>(null)
  const [assignedTribe, setAssignedTribe] = useState<(typeof TRIBES)[0] | null>(null)
  const [showBadgePreview, setShowBadgePreview] = useState(false)

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
        setFormState(data.data.isFull ? 'closed' : 'idle')
      } else {
        setFormState('idle')
      }
    } catch {
      setFormState('idle')
    }
  }

  // ── SIMPLE REVEAL: purely state-driven with CSS transitions ──
  // Phase 0: "init" (50ms) → Phase 1: "choosing" (2.5s) → Phase 2: "tribe" (1.5s) → Phase 3: "card"
  useEffect(() => {
    if (formState !== 'revealing') return
    // Reset to init first so CSS transition actually triggers when we go to 'choosing'
    setRevealPhase('init')

    const t0 = setTimeout(() => setRevealPhase('choosing'), 50)
    const t1 = setTimeout(() => setRevealPhase('tribe'), 2800)
    const t2 = setTimeout(() => {
      setRevealPhase('card')
      setFormState('success')
    }, 4500)

    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2) }
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
        if (res.status === 409) { setFormState('closed'); return }
        setFormState('error')
        setErrorMsg(data.error || 'Something went wrong. Please try again.')
        return
      }

      const reg = data.data as RegistrationResult
      setResult(reg)
      setAssignedTribe(TRIBES.find((t) => t.name === reg.tribe) || TRIBES[0])
      setFormState('revealing')
    } catch {
      setFormState('error')
      setErrorMsg('Network error. Please check your connection and try again.')
    }
  }

  // ── Generate Instagram Story Card ──
  const generateStoryCard = useCallback((): HTMLCanvasElement | null => {
    const canvas = canvasRef.current
    if (!canvas || !assignedTribe || !result) return null
    const tc = assignedTribe
    const W = 1080, H = 1920
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
    bgGrad.addColorStop(0, '#000a14'); bgGrad.addColorStop(0.3, '#001020')
    bgGrad.addColorStop(0.7, '#000a14'); bgGrad.addColorStop(1, '#000508')
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H)

    const glowGrad = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, 500)
    glowGrad.addColorStop(0, tc.color + '30'); glowGrad.addColorStop(0.5, tc.color + '10'); glowGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = glowGrad; ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = tc.color + '40'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(W * 0.2, 120); ctx.lineTo(W * 0.8, 120); ctx.stroke()

    ctx.fillStyle = '#d1a058'; ctx.font = '600 36px sans-serif'; ctx.textAlign = 'center'
    ctx.letterSpacing = '8px'; ctx.fillText('Z A M B A A R A', W / 2, 100)
    ctx.fillStyle = 'rgba(6,182,212,0.6)'; ctx.font = '600 22px sans-serif'
    ctx.fillText('B E A C H   B A T T L E', W / 2, 160)

    ctx.font = '180px serif'; ctx.fillText(tc.name[0], W / 2, 520)
    ctx.strokeStyle = tc.color + '35'; ctx.lineWidth = 3
    ctx.beginPath(); ctx.arc(W / 2, 440, 160, 0, Math.PI * 2); ctx.stroke()
    ctx.strokeStyle = tc.color + '15'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(W / 2, 440, 200, 0, Math.PI * 2); ctx.stroke()

    ctx.fillStyle = 'rgba(148,216,240,0.6)'; ctx.font = '600 28px sans-serif'
    ctx.fillText('Summoned by the Tides', W / 2, 640)
    ctx.fillStyle = tc.color; ctx.font = 'bold 100px sans-serif'
    ctx.fillText(tc.name.toUpperCase(), W / 2, 760)
    ctx.fillStyle = tc.color + '80'; ctx.font = '600 26px sans-serif'
    ctx.fillText(`Element of ${tc.element}`, W / 2, 810)

    const divGrad = ctx.createLinearGradient(W * 0.25, 0, W * 0.75, 0)
    divGrad.addColorStop(0, 'transparent'); divGrad.addColorStop(0.5, tc.color + '50'); divGrad.addColorStop(1, 'transparent')
    ctx.strokeStyle = divGrad; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(W * 0.25, 860); ctx.lineTo(W * 0.75, 860); ctx.stroke()

    const cardY = 910, cardH = 400, cardX = 120, cardW = W - 240, cardR = 24
    const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH)
    cardGrad.addColorStop(0, 'rgba(6,30,50,0.7)'); cardGrad.addColorStop(1, 'rgba(0,0,0,0.85)')
    ctx.fillStyle = cardGrad; ctx.beginPath(); ctx.roundRect(cardX, cardY, cardW, cardH, cardR); ctx.fill()
    ctx.strokeStyle = tc.color + '30'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.roundRect(cardX, cardY, cardW, cardH, cardR); ctx.stroke()

    ctx.fillStyle = tc.color + '70'; ctx.font = '600 18px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('R E G I S T R A T I O N   C O N F I R M E D', W / 2, cardY + 55)

    const items = [
      { label: 'Warrior', value: result.name },
      { label: 'Tribe', value: `${tc.name}` },
      { label: 'Player #', value: `${tc.name.substring(0, 1)}${String(result.playerNumber).padStart(2, '0')}` },
    ]
    items.forEach((item, i) => {
      const rowY = cardY + 110 + i * 90
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '600 18px sans-serif'; ctx.textAlign = 'left'
      ctx.fillText(item.label.toUpperCase(), cardX + 50, rowY)
      ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 30px sans-serif'
      ctx.fillText(item.value, cardX + 50, rowY + 38)
      if (i < items.length - 1) {
        const dGrad = ctx.createLinearGradient(cardX + 50, 0, cardX + cardW - 50, 0)
        dGrad.addColorStop(0, 'transparent'); dGrad.addColorStop(0.5, tc.color + '20'); dGrad.addColorStop(1, 'transparent')
        ctx.strokeStyle = dGrad; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(cardX + 50, rowY + 60); ctx.lineTo(cardX + cardW - 50, rowY + 60); ctx.stroke()
      }
    })

    ctx.fillStyle = tc.color + '80'; ctx.font = '600 20px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(`\u2726 ${tc.name} Warrior \u2726`, W / 2, cardY + cardH - 30)
    ctx.fillStyle = 'rgba(148,216,240,0.2)'; ctx.font = '600 20px sans-serif'
    ctx.fillText('Where the Elements Clash by the Sea', W / 2, H - 200)
    ctx.strokeStyle = 'rgba(209,160,88,0.2)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(W * 0.3, H - 160); ctx.lineTo(W * 0.7, H - 160); ctx.stroke()
    ctx.fillStyle = 'rgba(209,160,88,0.4)'; ctx.font = '600 22px sans-serif'
    ctx.fillText('zambaara.com', W / 2, H - 120)

    return canvas
  }, [assignedTribe, result])

  const downloadCard = useCallback(() => {
    const canvas = generateStoryCard()
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `zambaara-${assignedTribe?.name.toLowerCase() || 'warrior'}-card.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [generateStoryCard, assignedTribe])

  const shareToInstagram = useCallback(async () => {
    const canvas = generateStoryCard()
    if (!canvas) return
    try {
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'))
      const file = new File([blob], `zambaara-${assignedTribe?.name.toLowerCase()}-card.png`, { type: 'image/png' })
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `I'm a ${assignedTribe?.name} Warrior!`, text: `The tides summoned me to ${assignedTribe?.name} tribe! \uD83C\uDF0A\u2694\uFE0F` })
      } else { downloadCard() }
    } catch { downloadCard() }
  }, [generateStoryCard, assignedTribe, downloadCard])

  const isDark = (n: string) => n === 'Mountain'
  const displayColor = (t: (typeof TRIBES)[0]) => isDark(t.name) ? '#c4b5fd' : t.color

  // ──────────── Loading ────────────
  if (formState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">{'\uD83C\uDF0A'}</div>
          </div>
          <p className="text-sm uppercase tracking-widest" style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(6,182,212,0.5)' }}>
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
        <div ref={formRef} className="w-full max-w-md md:max-w-2xl text-center animate-fadeInUp">
          <div className="text-6xl sm:text-7xl mb-5 inline-block" style={{ filter: 'drop-shadow(0 0 30px rgba(239,68,68,0.3))' }}>{'\u2694\uFE0F'}</div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase mb-3"
            style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#ef4444', textShadow: '0 0 40px rgba(239,68,68,0.2), 2px 4px 8px rgba(0,0,0,0.6)' }}>
            Battle Closed
          </h1>
          <p className="text-base md:text-lg text-white/50 mb-4 max-w-xs md:max-w-md mx-auto" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            All <span className="text-white/80 font-semibold">16 warrior slots</span> have been claimed.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-xs md:max-w-lg mx-auto">
            {TRIBES.map((t) => {
              const count = slotStatus?.tribes.find((s) => s.tribe === t.name)?.count ?? 4
              return (
                <div key={t.name} className="rounded-xl p-3 md:p-4 text-center"
                  style={{ background: 'linear-gradient(145deg, rgba(6,30,50,0.5) 0%, rgba(0,0,0,0.7) 100%)', border: `1px solid ${displayColor(t)}25` }}>
                  <div className="text-2xl md:text-3xl mb-1"><TribeIcon tribe={t.name} size={32} /></div>
                  <p className="text-xs md:text-sm uppercase tracking-wider font-semibold" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: displayColor(t) }}>{t.name}</p>
                  <p className="text-xs text-white/40 mt-0.5" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>{count}/4 warriors</p>
                </div>
              )
            })}
          </div>
          <Link href="/beach-battle" className="inline-block px-8 py-3.5 rounded-xl text-sm uppercase tracking-wider font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-95"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", background: 'linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(14,116,144,0.3) 100%)', border: '1.5px solid rgba(6,182,212,0.4)', color: '#e0f2fe' }}>
            {'\u2190'} Back to Beach Battle
          </Link>
        </div>
      </div>
    )
  }

  // ──────────── REVEAL ANIMATION + SUCCESS (100% CSS, no GSAP) ────────────
  if ((formState === 'revealing' || formState === 'success') && assignedTribe && result) {
    const tc = assignedTribe
    const dc = displayColor(tc)
    const showChoosing = revealPhase === 'choosing'
    const showTribe = revealPhase === 'tribe' || revealPhase === 'card'
    const showCard = revealPhase === 'card'
    const isInit = revealPhase === 'init'

    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <canvas ref={canvasRef} className="hidden" />

        <div className="w-full max-w-md md:max-w-3xl lg:max-w-4xl text-center">
          {/* Background glow */}
          <div className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
            style={{ background: `radial-gradient(circle at 50% 40%, ${tc.color}15, transparent 60%)` }} />

          {/* ── PHASE 1: "The tides are turning..." ── */}
          <div className="relative z-10"
            style={{
              opacity: showChoosing ? 1 : 0,
              transform: showChoosing ? 'translateY(0) scale(1)' : (isInit ? 'translateY(30px) scale(0.9)' : 'translateY(-30px) scale(0.9)'),
              maxHeight: showChoosing ? '400px' : '0px',
              overflow: 'hidden',
              pointerEvents: showChoosing ? 'auto' : 'none',
              transition: isInit ? 'none' : 'all 0.7s ease-out',
            }}>
            <div className="py-8">
              <div className="text-6xl sm:text-7xl md:text-8xl mb-6 animate-pulse">{'\uD83C\uDF0A'}</div>
              <p className="text-xl sm:text-2xl md:text-3xl uppercase tracking-[0.15em] mb-4"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(148,216,240,0.9)', textShadow: '0 0 20px rgba(6,182,212,0.3)' }}>
                The tides are turning...
              </p>
              <div className="flex justify-center gap-2 mt-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(34,211,238,0.6)', animation: `revealDotPulse 1.2s ease-in-out ${i * 0.3}s infinite` }} />
                ))}
              </div>
            </div>
          </div>

          {/* ── PHASE 2: Tribe icon + name ── */}
          <div className="relative z-10"
            style={{
              opacity: showTribe ? 1 : 0,
              transform: showTribe ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.8)',
              transition: isInit ? 'none' : 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}>
            <div className="md:flex md:items-center md:justify-center md:gap-8 mb-6">
              <div className="text-8xl sm:text-9xl md:text-[10rem] lg:text-[12rem] mb-4 md:mb-0 inline-block transition-all duration-700"
                style={{ filter: `drop-shadow(0 0 40px ${tc.glowColor})` }}>
                <TribeIcon tribe={tc.name} size={140} />
              </div>
              <div className="text-center md:text-left">
                <p className="text-base sm:text-lg md:text-xl uppercase tracking-[0.12em] mb-2"
                  style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(148,216,240,0.7)', textShadow: '0 0 15px rgba(6,182,212,0.2)' }}>
                  Summoned by the Tides — You are now
                </p>
                <h2 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold uppercase mb-1"
                  style={{ fontFamily: "'TheWalkyrDemo', serif", color: dc, textShadow: `0 0 40px ${tc.glowColor}` }}>
                  {tc.name}
                </h2>
                <p className="text-sm md:text-base uppercase tracking-[0.15em]"
                  style={{ fontFamily: "'BlinkerRegular', sans-serif", color: `${dc}99` }}>
                  Element of {tc.element}
                </p>
              </div>
            </div>
          </div>

          {/* ── PHASE 3: Card + actions ── */}
          <div className="relative z-10"
            style={{
              opacity: showCard ? 1 : 0,
              transform: showCard ? 'translateY(0)' : 'translateY(40px)',
              transition: isInit ? 'none' : 'all 0.8s ease-out 0.2s',
            }}>
            <div className="md:flex md:items-start md:justify-center md:gap-8">
              {/* Warrior Card */}
              <div className="inline-block rounded-xl p-5 sm:p-6 mb-6 md:mb-0 min-w-[280px] sm:min-w-[320px] md:min-w-[380px] text-left relative overflow-hidden"
                style={{ background: 'linear-gradient(145deg, rgba(6,30,50,0.6) 0%, rgba(0,0,0,0.75) 100%)', border: `1.5px solid ${dc}30`, boxShadow: `0 0 40px ${tc.glowColor.replace(/[\d.]+\)$/, '0.1)')}` }}>
                {[['top-2 left-2', 'border-t border-l'], ['top-2 right-2', 'border-t border-r'], ['bottom-2 left-2', 'border-b border-l'], ['bottom-2 right-2', 'border-b border-r']].map(([pos, border], i) => (
                  <div key={i} className={`absolute ${pos} w-3 h-3 ${border}`} style={{ borderColor: `${dc}40` }} />
                ))}
                <p className="text-xs uppercase tracking-[0.3em] mb-4 text-center" style={{ fontFamily: "'BlinkerRegular', sans-serif", color: `${dc}60` }}>Registration Confirmed</p>
                <div className="space-y-3">
                  {[
                    { label: 'Warrior', value: result.name },
                    { label: 'Tribe', value: tc.name },
                    { label: 'Player #', value: `${tc.name.substring(0, 1)}${String(result.playerNumber).padStart(2, '0')}` },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center">
                        <span className="text-xs md:text-sm uppercase tracking-wider" style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.3)' }}>{item.label}</span>
                        <span className="text-base md:text-lg font-bold truncate max-w-[180px] md:max-w-[220px]" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#e2e8f0' }}>{item.value}</span>
                      </div>
                      {i < 2 && <div className="h-px mt-2" style={{ background: `linear-gradient(90deg, transparent, ${dc}15, transparent)` }} />}
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-3 text-center">
                  <p className="text-xs uppercase tracking-[0.2em]" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: `${dc}70` }}>{'\u2726'} {tc.name} Warrior {'\u2726'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 md:min-w-[260px]">
                <button onClick={downloadCard}
                  className="w-full max-w-[320px] md:max-w-none mx-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm uppercase tracking-wider font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-95"
                  style={{ fontFamily: "'BlinkerSemiBold', sans-serif", background: `linear-gradient(135deg, ${dc}15 0%, rgba(0,0,0,0.4) 100%)`, border: `1.5px solid ${dc}40`, color: '#e2e8f0' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Card
                </button>
                <button onClick={shareToInstagram}
                  className="w-full max-w-[320px] md:max-w-none mx-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm uppercase tracking-wider font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-95"
                  style={{ fontFamily: "'BlinkerSemiBold', sans-serif", background: 'linear-gradient(135deg, rgba(225,48,108,0.15) 0%, rgba(131,58,180,0.15) 50%, rgba(252,175,69,0.1) 100%)', border: '1.5px solid rgba(225,48,108,0.35)', color: '#f0e0f0' }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6" /></svg>
                  Share to Instagram
                </button>
                <button onClick={() => { generateStoryCard(); setShowBadgePreview(true) }}
                  className="w-full max-w-[320px] md:max-w-none mx-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 hover:text-cyan-300"
                  style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(6,182,212,0.5)', border: '1px solid rgba(6,182,212,0.15)' }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  Preview Story Card
                </button>
                <div className="pt-2">
                  <Link href="/beach-battle" className="inline-block w-full text-center px-8 py-3.5 rounded-xl text-sm uppercase tracking-wider font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-95"
                    style={{ fontFamily: "'BlinkerSemiBold', sans-serif", background: 'linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(14,116,144,0.3) 100%)', border: '1.5px solid rgba(6,182,212,0.4)', color: '#e0f2fe' }}>
                    Explore the Arena
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instagram Story Preview Modal */}
        {showBadgePreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" onClick={() => setShowBadgePreview(false)}>
            <div className="relative max-w-[320px] w-full" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowBadgePreview(false)} className="absolute -top-10 right-0 text-white/50 hover:text-white text-sm uppercase tracking-wider" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>Close {'\u2715'}</button>
              <div className="rounded-2xl overflow-hidden border border-white/10" style={{ aspectRatio: '9/16' }}>
                <canvas ref={(el) => { if (el && canvasRef.current) { el.width = canvasRef.current.width; el.height = canvasRef.current.height; const ctx2 = el.getContext('2d'); if (ctx2) ctx2.drawImage(canvasRef.current, 0, 0) } }} className="w-full h-full object-contain" />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={downloadCard} className="flex-1 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', color: '#e0f2fe' }}>Download</button>
                <button onClick={shareToInstagram} className="flex-1 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", background: 'linear-gradient(135deg, rgba(225,48,108,0.2) 0%, rgba(131,58,180,0.2) 100%)', border: '1px solid rgba(225,48,108,0.3)', color: '#f0e0f0' }}>Share</button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes revealDotPulse {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.4); }
          }
        `}</style>
      </div>
    )
  }

  // ──────────── FORM STATE ────────────
  const slotsLeft = slotStatus ? slotStatus.maxPlayers - slotStatus.total : null

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 sm:py-20 lg:py-24">
      <div ref={formRef} className="w-full max-w-md md:max-w-4xl lg:max-w-5xl animate-fadeInUp">
        <div className="md:flex md:items-start md:gap-12">
          {/* LEFT COLUMN: Header + tribe info */}
          <div className="md:flex-1 md:sticky md:top-24">
            <div className="text-center md:text-left mb-6">
              <Link href="/beach-battle" className="inline-block">
                <Image src="/Zambaara.png" alt="Zambaara" width={120} height={40} className="mx-auto md:mx-0 opacity-70 hover:opacity-100 transition-opacity" />
              </Link>
            </div>
            <div className="text-center md:text-left mb-8">
              <p className="text-sm sm:text-base uppercase tracking-[0.35em] mb-2" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6,182,212,0.6)' }}>Beach Battle Registration</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase mb-3"
                style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#e2e8f0', textShadow: '0 0 40px rgba(6,182,212,0.2), 2px 4px 8px rgba(0,0,0,0.6)' }}>
                Enter The Arena
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/40 max-w-xs md:max-w-sm lg:max-w-md mx-auto md:mx-0" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                Register to join the mythic tournament. The Ocean will decide your tribe.
              </p>
            </div>
            {slotsLeft !== null && (
              <div className="text-center md:text-left mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ background: slotsLeft <= 4 ? 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(0,0,0,0.3) 100%)' : 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(0,0,0,0.3) 100%)', border: `1px solid ${slotsLeft <= 4 ? 'rgba(239,68,68,0.25)' : 'rgba(6,182,212,0.2)'}` }}>
                  <div className={`w-2 h-2 rounded-full ${slotsLeft <= 4 ? 'bg-red-500' : 'bg-cyan-500'} animate-pulse`} />
                  <span className="text-xs sm:text-sm uppercase tracking-wider" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: slotsLeft <= 4 ? '#fca5a5' : 'rgba(6,182,212,0.7)' }}>
                    {slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} remaining
                  </span>
                </div>
              </div>
            )}
            <div className="flex justify-center md:justify-start gap-3 mb-8">
              {TRIBES.map((t) => {
                const count = slotStatus?.tribes.find((s) => s.tribe === t.name)?.count ?? 0
                const full = count >= 4
                return (
                  <div key={t.name} className="text-center">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center text-lg md:text-2xl mx-auto mb-1 transition-all ${full ? 'opacity-30 grayscale' : ''}`}
                      style={{ background: `radial-gradient(circle at 40% 35%, ${displayColor(t)}55, ${displayColor(t)}20)`, border: `1px solid ${displayColor(t)}30`, boxShadow: full ? 'none' : `0 0 12px ${displayColor(t)}15` }} title={t.name}>
                      <TribeIcon tribe={t.name} size={22} />
                    </div>
                    <p className="text-xs md:text-sm uppercase tracking-wider" style={{ fontFamily: "'BlinkerRegular', sans-serif", color: full ? 'rgba(255,255,255,0.2)' : `${displayColor(t)}80` }}>{count}/4</p>
                    <p className="hidden md:block text-xs uppercase tracking-wider mt-0.5" style={{ fontFamily: "'BlinkerRegular', sans-serif", color: full ? 'rgba(255,255,255,0.15)' : `${displayColor(t)}50` }}>{t.name}</p>
                  </div>
                )
              })}
            </div>
            <div className="hidden md:block mb-6">
              <div className="rounded-xl p-4" style={{ background: 'linear-gradient(145deg, rgba(6,30,50,0.3) 0%, rgba(0,0,0,0.4) 100%)', border: '1px solid rgba(6,182,212,0.1)' }}>
                <p className="text-sm text-white/30 italic" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                  &ldquo;Where the elements clash by the sea, only the bravest survive. Choose wisely — or let the tides choose for you.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Form card */}
          <div className="md:flex-1 md:max-w-md">
            <form onSubmit={handleSubmit} className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
              style={{ background: 'linear-gradient(145deg, rgba(6,30,50,0.5) 0%, rgba(0,0,0,0.7) 100%)', border: '1px solid rgba(6,182,212,0.15)', boxShadow: '0 0 60px rgba(6,182,212,0.04)' }}>
              {[['top-3 left-3', 'border-t border-l'], ['top-3 right-3', 'border-t border-r'], ['bottom-3 left-3', 'border-b border-l'], ['bottom-3 right-3', 'border-b border-r']].map(([pos, border], i) => (
                <div key={i} className={`absolute ${pos} w-4 h-4 ${border}`} style={{ borderColor: 'rgba(6,182,212,0.2)' }} />
              ))}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.06), transparent 70%)', filter: 'blur(40px)' }} />

              <div className="space-y-5 relative z-10">
                {[{ id: 'reg-name', label: 'Name', type: 'text', value: name, set: setName, ph: 'Enter your name' },
                  { id: 'reg-email', label: 'Email', type: 'email', value: email, set: setEmail, ph: 'you@example.com' },
                  { id: 'reg-phone', label: 'Phone', type: 'tel', value: phone, set: setPhone, ph: '+91 98765 43210' }].map((f) => (
                  <div key={f.id}>
                    <label htmlFor={f.id} className="block text-xs sm:text-sm uppercase tracking-[0.2em] mb-2" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#ffffff' }}>{f.label}</label>
                    <input id={f.id} type={f.type} required value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.ph}
                      className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-300 focus:ring-1"
                      style={{ fontFamily: "'BlinkerRegular', sans-serif", background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(6,182,212,0.15)', color: '#e2e8f0', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.45)'; e.currentTarget.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3), 0 0 15px rgba(6,182,212,0.08)' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.15)'; e.currentTarget.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.3)' }} />
                  </div>
                ))}
              </div>

              {formState === 'error' && errorMsg && (
                <div className="mt-4 px-4 py-3 rounded-lg text-sm text-center"
                  style={{ fontFamily: "'BlinkerRegular', sans-serif", background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>{errorMsg}</div>
              )}

              <div className="flex items-center gap-3 my-6"><div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.15), transparent)' }} /></div>

              <button type="submit" disabled={formState === 'submitting'}
                className="w-full px-6 py-4 rounded-xl font-semibold uppercase tracking-wider text-sm transition-all duration-500 relative overflow-hidden group active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif", background: 'linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(14,116,144,0.35) 100%)', border: '1.5px solid rgba(6,182,212,0.4)', color: '#e0f2fe', boxShadow: '0 0 35px rgba(6,182,212,0.1)', minHeight: '52px' }}
                onMouseEnter={(e) => { if (formState !== 'submitting') e.currentTarget.style.boxShadow = '0 0 55px rgba(6,182,212,0.25)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 35px rgba(6,182,212,0.1)' }}>
                <span className="relative z-10">
                  {formState === 'submitting' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      The Ocean is Deciding...
                    </span>
                  ) : '\u2726 Join The Battle'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>

              <p className="text-center text-xs sm:text-sm mt-5" style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.2)' }}>
                By registering, you agree to receive battle updates via email.
              </p>
            </form>
            <div className="text-center mt-6">
              <Link href="/beach-battle" className="text-xs sm:text-sm uppercase tracking-wider transition-colors duration-300 hover:text-cyan-300" style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(6,182,212,0.4)' }}>
                {'\u2190'} Back to Beach Battle
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        input::placeholder { color: rgba(255, 255, 255, 0.15); font-family: 'BlinkerRegular', sans-serif; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.7s ease-out forwards; }
      `}</style>
    </div>
  )
}
