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
  const choosingTextRef = useRef<HTMLDivElement>(null)
  const oceanOrbRef = useRef<HTMLDivElement>(null)
  const chosenTextRef = useRef<HTMLDivElement>(null)
  const tribeIconRef = useRef<HTMLDivElement>(null)
  const tribeNameRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [formState, setFormState] = useState<FormState>('loading')
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

  // ── EPIC OCEAN REVEAL ANIMATION ──
  const playRevealAnimation = useCallback(() => {
    if (!revealContainerRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline()

      // Phase 1: Container fades in
      tl.fromTo(revealContainerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      )

      // Phase 2: Ocean orb pulses with mysterious glow
      if (oceanOrbRef.current) {
        tl.fromTo(oceanOrbRef.current,
          { opacity: 0, scale: 0.3 },
          { opacity: 1, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.6)' },
          '-=0.1'
        )
        // Pulsing orb while "choosing"
        tl.to(oceanOrbRef.current, {
          scale: 1.15, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: 3,
        })
      }

      // Phase 3: "The Ocean is choosing ur tribe" text types in
      if (choosingTextRef.current) {
        tl.fromTo(choosingTextRef.current,
          { opacity: 0, y: 20, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' },
          '-=2.4'
        )
        // Fade out choosing text
        tl.to(choosingTextRef.current,
          { opacity: 0, y: -15, filter: 'blur(4px)', duration: 0.5, ease: 'power2.in' },
          '+=0.3'
        )
      }

      // Phase 4: Orb explodes
      if (oceanOrbRef.current) {
        tl.to(oceanOrbRef.current, {
          scale: 2.5, opacity: 0, filter: 'blur(20px)', duration: 0.5, ease: 'power3.out',
        }, '-=0.2')
      }

      // Phase 5: Tribe icon bursts in with explosion effect
      if (tribeIconRef.current) {
        tl.fromTo(tribeIconRef.current,
          { opacity: 0, scale: 0, rotation: -180, filter: 'blur(20px)' },
          { opacity: 1, scale: 1, rotation: 0, filter: 'blur(0px)', duration: 0.9, ease: 'elastic.out(1, 0.5)' },
          '-=0.3'
        )
        // Glow pulse
        tl.to(tribeIconRef.current, {
          scale: 1.2, duration: 0.3, ease: 'power2.out', yoyo: true, repeat: 1,
        })
      }

      // Phase 6: "The Ocean chooses u to be [Tribe]" text
      if (chosenTextRef.current) {
        tl.fromTo(chosenTextRef.current,
          { opacity: 0, y: 30, scale: 1.3, filter: 'blur(10px)' },
          { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.7, ease: 'back.out(1.7)' },
          '-=0.4'
        )
      }

      // Phase 7: Tribe name slams in
      if (tribeNameRef.current) {
        tl.fromTo(tribeNameRef.current,
          { opacity: 0, y: 40, scale: 1.5, filter: 'blur(10px)' },
          { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'back.out(2)' },
          '-=0.3'
        )
      }

      // Phase 8: Card slides up
      if (cardRef.current) {
        tl.fromTo(cardRef.current,
          { opacity: 0, y: 60, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' },
          '-=0.2'
        )
      }

      // Phase 9: Action buttons fade in
      if (actionsRef.current) {
        tl.fromTo(actionsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          '-=0.2'
        )
      }

      // Phase 10: set final state
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
      const t = setTimeout(() => playRevealAnimation(), 100)
      return () => clearTimeout(t)
    }
  }, [formState, playRevealAnimation])

  // ── Generate Instagram Story Card (9:16 aspect ratio) ──
  const generateStoryCard = useCallback((): HTMLCanvasElement | null => {
    const canvas = canvasRef.current
    if (!canvas || !assignedTribe || !result) return null

    const tc = assignedTribe
    const W = 1080
    const H = 1920
    canvas.width = W
    canvas.height = H

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
    bgGrad.addColorStop(0, '#000a14')
    bgGrad.addColorStop(0.3, '#001020')
    bgGrad.addColorStop(0.7, '#000a14')
    bgGrad.addColorStop(1, '#000508')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    // Tribe colored radial glow
    const glowGrad = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, 500)
    glowGrad.addColorStop(0, tc.color + '30')
    glowGrad.addColorStop(0.5, tc.color + '10')
    glowGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = glowGrad
    ctx.fillRect(0, 0, W, H)

    // Top decorative line
    ctx.strokeStyle = tc.color + '40'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(W * 0.2, 120)
    ctx.lineTo(W * 0.8, 120)
    ctx.stroke()

    // "ZAMBAARA" at top
    ctx.fillStyle = '#d1a058'
    ctx.font = '600 36px sans-serif'
    ctx.textAlign = 'center'
    ctx.letterSpacing = '8px'
    ctx.fillText('Z A M B A A R A', W / 2, 100)

    // "BEACH BATTLE" subtitle
    ctx.fillStyle = 'rgba(6,182,212,0.6)'
    ctx.font = '600 22px sans-serif'
    ctx.fillText('B E A C H   B A T T L E', W / 2, 160)

    // Tribe icon - large
    ctx.font = '180px serif'
    ctx.textAlign = 'center'
    ctx.fillText(tc.icon, W / 2, 520)

    // Glowing ring behind icon
    ctx.strokeStyle = tc.color + '35'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(W / 2, 440, 160, 0, Math.PI * 2)
    ctx.stroke()

    // Outer ring
    ctx.strokeStyle = tc.color + '15'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(W / 2, 440, 200, 0, Math.PI * 2)
    ctx.stroke()

    // "The Ocean chose you to be" text
    ctx.fillStyle = 'rgba(148,216,240,0.6)'
    ctx.font = '600 28px sans-serif'
    ctx.fillText('The Ocean chose you to be', W / 2, 640)

    // Tribe name - huge
    ctx.fillStyle = tc.color
    ctx.font = 'bold 100px sans-serif'
    ctx.fillText(tc.name.toUpperCase(), W / 2, 760)

    // Element subtitle
    ctx.fillStyle = tc.color + '80'
    ctx.font = '600 26px sans-serif'
    ctx.fillText(`Element of ${tc.element}`, W / 2, 810)

    // Divider line
    const divGrad = ctx.createLinearGradient(W * 0.25, 0, W * 0.75, 0)
    divGrad.addColorStop(0, 'transparent')
    divGrad.addColorStop(0.5, tc.color + '50')
    divGrad.addColorStop(1, 'transparent')
    ctx.strokeStyle = divGrad
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(W * 0.25, 860)
    ctx.lineTo(W * 0.75, 860)
    ctx.stroke()

    // Card area
    const cardY = 910
    const cardH = 400
    const cardX = 120
    const cardW = W - 240
    const cardR = 24

    // Card background
    const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH)
    cardGrad.addColorStop(0, 'rgba(6,30,50,0.7)')
    cardGrad.addColorStop(1, 'rgba(0,0,0,0.85)')
    ctx.fillStyle = cardGrad
    ctx.beginPath()
    ctx.roundRect(cardX, cardY, cardW, cardH, cardR)
    ctx.fill()

    // Card border
    ctx.strokeStyle = tc.color + '30'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(cardX, cardY, cardW, cardH, cardR)
    ctx.stroke()

    // Corner accents
    const cornerSize = 16
    ctx.strokeStyle = tc.color + '50'
    ctx.lineWidth = 1.5
    const corners = [
      [cardX + 12, cardY + 12],
      [cardX + cardW - 12 - cornerSize, cardY + 12],
      [cardX + 12, cardY + cardH - 12 - cornerSize],
      [cardX + cardW - 12 - cornerSize, cardY + cardH - 12 - cornerSize],
    ]
    corners.forEach(([cx, cy], i) => {
      ctx.beginPath()
      if (i === 0) { ctx.moveTo(cx, cy + cornerSize); ctx.lineTo(cx, cy); ctx.lineTo(cx + cornerSize, cy) }
      if (i === 1) { ctx.moveTo(cx, cy); ctx.lineTo(cx + cornerSize, cy); ctx.moveTo(cx + cornerSize, cy); ctx.lineTo(cx + cornerSize, cy + cornerSize) }
      if (i === 2) { ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + cornerSize); ctx.moveTo(cx, cy + cornerSize); ctx.lineTo(cx + cornerSize, cy + cornerSize) }
      if (i === 3) { ctx.moveTo(cx, cy + cornerSize); ctx.lineTo(cx + cornerSize, cy + cornerSize); ctx.lineTo(cx + cornerSize, cy) }
      ctx.stroke()
    })

    // "Registration Confirmed"
    ctx.fillStyle = tc.color + '70'
    ctx.font = '600 18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('R E G I S T R A T I O N   C O N F I R M E D', W / 2, cardY + 55)

    // Card content
    const items = [
      { label: 'Warrior', value: result.name },
      { label: 'Tribe', value: `${tc.icon} ${tc.name}` },
      { label: 'Player #', value: `${tc.name.substring(0, 1)}${String(result.playerNumber).padStart(2, '0')}` },
    ]

    items.forEach((item, i) => {
      const rowY = cardY + 110 + i * 90
      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = '600 18px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(item.label.toUpperCase(), cardX + 50, rowY)
      // Value
      ctx.fillStyle = '#e2e8f0'
      ctx.font = 'bold 30px sans-serif'
      ctx.fillText(item.value, cardX + 50, rowY + 38)
      // Divider
      if (i < items.length - 1) {
        const dGrad = ctx.createLinearGradient(cardX + 50, 0, cardX + cardW - 50, 0)
        dGrad.addColorStop(0, 'transparent')
        dGrad.addColorStop(0.5, tc.color + '20')
        dGrad.addColorStop(1, 'transparent')
        ctx.strokeStyle = dGrad
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(cardX + 50, rowY + 60)
        ctx.lineTo(cardX + cardW - 50, rowY + 60)
        ctx.stroke()
      }
    })

    // Warrior badge label at bottom of card
    ctx.fillStyle = tc.color + '80'
    ctx.font = '600 20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`\u2726 ${tc.name} Warrior \u2726`, W / 2, cardY + cardH - 30)

    // Bottom decorative elements
    ctx.fillStyle = 'rgba(148,216,240,0.2)'
    ctx.font = '600 20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Where the Elements Clash by the Sea', W / 2, H - 200)

    // Bottom line
    ctx.strokeStyle = 'rgba(209,160,88,0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(W * 0.3, H - 160)
    ctx.lineTo(W * 0.7, H - 160)
    ctx.stroke()

    // Website
    ctx.fillStyle = 'rgba(209,160,88,0.4)'
    ctx.font = '600 22px sans-serif'
    ctx.fillText('zambaara.com', W / 2, H - 120)

    return canvas
  }, [assignedTribe, result])

  // Download card
  const downloadCard = useCallback(() => {
    const canvas = generateStoryCard()
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `zambaara-${assignedTribe?.name.toLowerCase() || 'warrior'}-card.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [generateStoryCard, assignedTribe])

  // Share to Instagram (opens share dialog or downloads)
  const shareToInstagram = useCallback(async () => {
    const canvas = generateStoryCard()
    if (!canvas) return

    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      )
      const file = new File([blob], `zambaara-${assignedTribe?.name.toLowerCase()}-card.png`, { type: 'image/png' })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `I\'m a ${assignedTribe?.name} Warrior!`,
          text: `The Ocean chose me for ${assignedTribe?.name} tribe at Zambaara Beach Battle! \uD83C\uDF0A\u2694\uFE0F`,
        })
      } else {
        // Fallback: download
        downloadCard()
      }
    } catch {
      downloadCard()
    }
  }, [generateStoryCard, assignedTribe, downloadCard])

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
          <p className="text-sm uppercase tracking-widest"
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

          <p className="text-base text-white/50 mb-4 max-w-xs mx-auto"
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
                  <p className="text-xs uppercase tracking-wider font-semibold"
                    style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: displayColor(t) }}>
                    {t.name}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5"
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
            <p className="text-sm text-white/60" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
              {'\uD83D\uDD14'} Check back soon for the next battle slot!
            </p>
          </div>

          <Link href="/beach-battle"
            className="inline-block px-8 py-3.5 rounded-xl text-sm uppercase tracking-wider font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-95"
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
        {/* Hidden canvas for Instagram story generation */}
        <canvas ref={canvasRef} className="hidden" />

        <div ref={revealContainerRef} className="w-full max-w-md text-center" style={{ opacity: 0 }}>
          {/* Background glow */}
          <div className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
            style={{ background: `radial-gradient(circle at 50% 40%, ${tc.color}15, transparent 60%)` }} />

          {/* ── OCEAN CHOOSING PHASE ── */}
          {/* Ocean Orb */}
          <div ref={oceanOrbRef} className="relative z-10 mx-auto mb-4"
            style={{
              width: 120, height: 120,
              opacity: formState === 'success' ? 0 : undefined,
              display: formState === 'success' ? 'none' : 'block',
            }}>
            <div className="w-full h-full rounded-full animate-pulse"
              style={{
                background: 'radial-gradient(circle at 40% 35%, rgba(6,182,212,0.8), rgba(6,182,212,0.3), rgba(6,182,212,0.05))',
                boxShadow: '0 0 60px rgba(6,182,212,0.3), 0 0 120px rgba(6,182,212,0.1)',
              }} />
            <div className="absolute inset-0 flex items-center justify-center text-4xl">
              {'\uD83C\uDF0A'}
            </div>
          </div>

          {/* "The Ocean is choosing ur tribe" text */}
          <div ref={choosingTextRef} className="relative z-10 mb-6"
            style={{
              opacity: formState === 'success' ? 0 : undefined,
              display: formState === 'success' ? 'none' : 'block',
            }}>
            <p className="text-lg sm:text-xl uppercase tracking-[0.15em]"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
                color: 'rgba(148,216,240,0.8)',
                textShadow: '0 0 20px rgba(6,182,212,0.3)',
              }}>
              The Ocean is choosing ur tribe
            </p>
            <div className="flex justify-center gap-1 mt-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-cyan-400/40"
                  style={{ animation: `oceanDotPulse 1.2s ease-in-out ${i * 0.3}s infinite` }} />
              ))}
            </div>
          </div>

          {/* Final tribe icon */}
          <div ref={tribeIconRef} className="relative z-10 text-7xl sm:text-8xl mb-3 inline-block"
            style={{
              opacity: formState === 'success' ? 1 : 0,
              filter: `drop-shadow(0 0 50px ${tc.glowColor})`,
            }}>
            {tc.icon}
          </div>

          {/* "The Ocean chooses u to be their tribe" */}
          <div ref={chosenTextRef} className="relative z-10 mb-2"
            style={{ opacity: formState === 'success' ? 1 : 0 }}>
            <p className="text-base sm:text-lg uppercase tracking-[0.15em]"
              style={{
                fontFamily: "'BlinkerRegular', sans-serif",
                color: 'rgba(148,216,240,0.7)',
                textShadow: '0 0 15px rgba(6,182,212,0.2)',
              }}>
              The Ocean chooses u to be
            </p>
          </div>

          {/* Tribe name */}
          <div ref={tribeNameRef} className="relative z-10"
            style={{ opacity: formState === 'success' ? 1 : 0 }}>
            <h2 className="text-5xl sm:text-7xl font-bold uppercase mb-1"
              style={{
                fontFamily: "'TheWalkyrDemo', serif", color: dc,
                textShadow: `0 0 40px ${tc.glowColor}`,
              }}>
              {tc.name}
            </h2>
            <p className="text-sm uppercase tracking-[0.15em] mb-5"
              style={{ fontFamily: "'BlinkerRegular', sans-serif", color: `${dc}99` }}>
              Element of {tc.element}
            </p>
          </div>

          {/* ── WARRIOR CARD (simple labels, no email/phone) ── */}
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

              <p className="text-xs uppercase tracking-[0.3em] mb-4 text-center"
                style={{ fontFamily: "'BlinkerRegular', sans-serif", color: `${dc}60` }}>
                Registration Confirmed
              </p>

              <div className="space-y-3">
                {[
                  { label: 'Warrior', value: result.name },
                  { label: 'Tribe', value: `${tc.icon} ${tc.name}` },
                  { label: 'Player #', value: `${tc.name.substring(0, 1)}${String(result.playerNumber).padStart(2, '0')}` },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs uppercase tracking-wider"
                        style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.3)' }}>
                        {item.label}
                      </span>
                      <span className="text-base font-bold truncate max-w-[180px]"
                        style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#e2e8f0' }}>
                        {item.value}
                      </span>
                    </div>
                    {i < 2 && (
                      <div className="h-px mt-2"
                        style={{ background: `linear-gradient(90deg, transparent, ${dc}15, transparent)` }} />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-3 text-center">
                <p className="text-xs uppercase tracking-[0.2em]"
                  style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: `${dc}70` }}>
                  {'\u2726'} {tc.name} Warrior {'\u2726'}
                </p>
              </div>
            </div>
          </div>

          {/* ── ACTION BUTTONS ── */}
          <div ref={actionsRef} className="relative z-10 space-y-3"
            style={{ opacity: formState === 'success' ? 1 : 0 }}>
            {/* Download Card button */}
            <button onClick={downloadCard}
              className="w-full max-w-[320px] mx-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm uppercase tracking-wider font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-95"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
                background: `linear-gradient(135deg, ${dc}15 0%, rgba(0,0,0,0.4) 100%)`,
                border: `1.5px solid ${dc}40`,
                color: '#e2e8f0',
                boxShadow: `0 0 25px ${tc.glowColor.replace(/[\d.]+\)$/, '0.08)')}`,
              }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Card
            </button>

            {/* Share to Instagram button */}
            <button onClick={shareToInstagram}
              className="w-full max-w-[320px] mx-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm uppercase tracking-wider font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-95"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
                background: 'linear-gradient(135deg, rgba(225,48,108,0.15) 0%, rgba(131,58,180,0.15) 50%, rgba(252,175,69,0.1) 100%)',
                border: '1.5px solid rgba(225,48,108,0.35)',
                color: '#f0e0f0',
                boxShadow: '0 0 25px rgba(225,48,108,0.08)',
              }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6" />
              </svg>
              Share to Instagram
            </button>

            {/* Preview Story button */}
            <button onClick={() => { generateStoryCard(); setShowBadgePreview(true) }}
              className="w-full max-w-[320px] mx-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 hover:text-cyan-300"
              style={{
                fontFamily: "'BlinkerRegular', sans-serif",
                color: 'rgba(6,182,212,0.5)',
                border: '1px solid rgba(6,182,212,0.15)',
              }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview Story Card
            </button>

            {/* Back to arena */}
            <div className="pt-3">
              <Link href="/beach-battle"
                className="inline-block px-8 py-3.5 rounded-xl text-sm uppercase tracking-wider font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-95"
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
        </div>

        {/* Instagram Story Preview Modal */}
        {showBadgePreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
            onClick={() => setShowBadgePreview(false)}>
            <div className="relative max-w-[320px] w-full" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowBadgePreview(false)}
                className="absolute -top-10 right-0 text-white/50 hover:text-white text-sm uppercase tracking-wider"
                style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                Close {'\u2715'}
              </button>
              <div className="rounded-2xl overflow-hidden border border-white/10"
                style={{ aspectRatio: '9/16' }}>
                <canvas ref={(el) => {
                  if (el && canvasRef.current) {
                    el.width = canvasRef.current.width
                    el.height = canvasRef.current.height
                    const ctx2 = el.getContext('2d')
                    if (ctx2) ctx2.drawImage(canvasRef.current, 0, 0)
                  }
                }}
                  className="w-full h-full object-contain" />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={downloadCard}
                  className="flex-1 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold"
                  style={{
                    fontFamily: "'BlinkerSemiBold', sans-serif",
                    background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)',
                    color: '#e0f2fe',
                  }}>
                  Download
                </button>
                <button onClick={shareToInstagram}
                  className="flex-1 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold"
                  style={{
                    fontFamily: "'BlinkerSemiBold', sans-serif",
                    background: 'linear-gradient(135deg, rgba(225,48,108,0.2) 0%, rgba(131,58,180,0.2) 100%)',
                    border: '1px solid rgba(225,48,108,0.3)',
                    color: '#f0e0f0',
                  }}>
                  Share
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes glowPulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
          @keyframes oceanDotPulse {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 0.8; transform: scale(1.3); }
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
          <p className="text-sm sm:text-base uppercase tracking-[0.35em] mb-2"
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
          <p className="text-base sm:text-lg text-white/40 max-w-xs mx-auto"
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
              <span className="text-xs sm:text-sm uppercase tracking-wider"
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
                <p className="text-xs uppercase tracking-wider"
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

          {/* Fields with simple labels */}
          <div className="space-y-5 relative z-10">
            {/* Name */}
            <div>
              <label htmlFor="reg-name"
                className="block text-xs sm:text-sm uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#ffffff' }}>
                Name
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
                className="block text-xs sm:text-sm uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#ffffff' }}>
                Email
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
                className="block text-xs sm:text-sm uppercase tracking-[0.2em] mb-2"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#ffffff' }}>
                Phone
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
            <div className="mt-4 px-4 py-3 rounded-lg text-sm text-center"
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
          <p className="text-center text-xs sm:text-sm mt-5"
            style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.2)' }}>
            By registering, you agree to receive battle updates via email.
          </p>
        </form>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link href="/beach-battle"
            className="text-xs sm:text-sm uppercase tracking-wider transition-colors duration-300 hover:text-cyan-300"
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
