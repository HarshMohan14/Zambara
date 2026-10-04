'use client'

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'

export type Tribe = 'lava' | 'rain' | 'wind' | 'mountain'

export interface RevealPlayer {
  id: string
  name: string
  mobile: string
  tribe: Tribe | null
  revealedAt?: string | Date | null
}

export interface TribeRevealMobileProps {
  eventName?: string
  tournaments?: Array<{ id: string; name: string }>
  selectedTournamentId?: string
  onSelectTournament?: (id: string) => void
  players: RevealPlayer[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  query?: string
  onQueryChange?: (q: string) => void
  onReveal: (player: RevealPlayer) => Promise<{ tribe: Tribe }>
  onRevealSound?: {
    start: () => void
    update: (progress: number) => void
    stop: () => void
    burst: (t: Tribe) => void
  }
  onBackToArena?: () => void
}

const TR: Array<{
  n: string
  key: Tribe
  src: string
  icon: string
  traits: string
  br: string
  c: string
  fg: string
  tint: string
}> = [
  {
    n: 'LAVA',
    key: 'lava',
    src: '/tribe-reveal/cards/reveal/reveal-lava.webp',
    icon: '/tribe-reveal/icons/lava.png',
    traits: 'FIERCE · RELENTLESS · UNSTOPPABLE',
    br: '/tribe-reveal/bracelets/bracelet-lava.webp',
    c: 'rgba(224,65,47,.9)',
    fg: '#F59A6E',
    tint: 'rgba(170,40,20,.6)'
  },
  {
    n: 'RAIN',
    key: 'rain',
    src: '/tribe-reveal/cards/reveal/reveal-rain.webp',
    icon: '/tribe-reveal/icons/rain.png',
    traits: 'CALM · CLEVER · UNSHAKEN',
    br: '/tribe-reveal/bracelets/bracelet-rain.webp',
    c: 'rgba(47,143,216,.9)',
    fg: '#8EC3EC',
    tint: 'rgba(20,80,170,.6)'
  },
  {
    n: 'WIND',
    key: 'wind',
    src: '/tribe-reveal/cards/reveal/reveal-wind.webp',
    icon: '/tribe-reveal/icons/wind.png',
    traits: 'FAST · FEARLESS · UNBOUND',
    br: '/tribe-reveal/bracelets/bracelet-wind.webp',
    c: 'rgba(230,235,245,.85)',
    fg: '#EDEDED',
    tint: 'rgba(140,150,180,.5)'
  },
  {
    n: 'MOUNTAIN',
    key: 'mountain',
    src: '/tribe-reveal/cards/reveal/reveal-mountain.webp',
    icon: '/tribe-reveal/icons/mountain.png',
    traits: 'STRONG · STEADY · UNBREAKABLE',
    br: '/tribe-reveal/bracelets/bracelet-mountain.webp',
    c: 'rgba(190,180,170,.8)',
    fg: '#C9BFB4',
    tint: 'rgba(110,100,90,.55)'
  }
]

const TI: Record<Tribe, number> = { lava: 0, rain: 1, wind: 2, mountain: 3 }

const maskPhone = (m: string) => {
  const d = String(m || '').replace(/\D/g, '')
  return '•••••• ' + (d.slice(-4) || '••••')
}

export default function TribeRevealMobile({
  eventName = 'ZAMBAARA TOURNAMENT',
  tournaments,
  selectedTournamentId,
  onSelectTournament,
  players,
  loading = false,
  error = null,
  onRetry,
  query: controlledQuery,
  onQueryChange,
  onReveal,
  onRevealSound,
  onBackToArena
}: TribeRevealMobileProps) {
  // Navigation & interaction state
  const [internalQ, setInternalQ] = useState('')
  const q = controlledQuery !== undefined ? controlledQuery : internalQ
  const handleQuery = (val: string) => {
    if (onQueryChange) onQueryChange(val)
    else setInternalQ(val)
  }

  const [filterIdx, setFilterIdx] = useState<0 | 1 | 2>(0) // 0: ALL, 1: TO REVEAL, 2: REVEALED
  const [selectedPlayer, setSelectedPlayer] = useState<RevealPlayer | null>(null)
  const [view, setView] = useState<'search' | 'stage'>('search')
  const [phase, setPhase] = useState<'idle' | 'holding' | 'reveal' | 'done'>('idle')
  const [progress, setProgress] = useState(0)
  const [time, setTime] = useState(0)
  const [assignedTribeIdx, setAssignedTribeIdx] = useState<number>(0)
  const [isResolved, setIsResolved] = useState(false)
  const [isAlreadyRevealed, setIsAlreadyRevealed] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [sw, setSw] = useState(390)
  const [sh, setSh] = useState(844)

  const rootRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const holdStartRef = useRef<number>(0)
  const animStartRef = useRef<number>(0)
  const extraWaitRef = useRef<number>(0)
  const burstFiredRef = useRef<boolean>(false)

  // 46 fixed seed stars
  const stars = useMemo(() => {
    let seed = 11
    const rnd = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    return Array.from({ length: 46 }).map(() => ({
      x: (rnd() * 100).toFixed(2),
      y: (rnd() * 100).toFixed(2),
      d: (rnd() * 3).toFixed(2)
    }))
  }, [])

  // Responsive scaling measurement
  const measure = useCallback(() => {
    if (rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect()
      setSw(rect.width || window.innerWidth)
      setSh(rect.height || window.innerHeight)
    }
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  // Preload cards & bracelets on stage open
  const preloadAssets = useCallback(() => {
    const paths = [
      '/tribe-reveal/cards/back.webp',
      ...TR.map(t => t.src),
      ...TR.map(t => t.br),
      ...TR.map(t => t.icon)
    ]
    paths.forEach(src => {
      if (typeof window !== 'undefined') {
        const img = new Image()
        img.src = src
      }
    })
  }, [])

  // Selection handler
  const handleSelect = (p: RevealPlayer) => {
    preloadAssets()
    setSelectedPlayer(p)
    if (p.tribe) {
      const idx = TI[p.tribe] ?? 0
      setAssignedTribeIdx(idx)
      setIsAlreadyRevealed(true)
      setIsResolved(true)
      setView('stage')
      setPhase('done')
      setTime(6.2)
      return
    }

    setIsAlreadyRevealed(false)
    setIsResolved(false)
    setView('stage')
    setPhase('idle')
    setProgress(0)
    setTime(0)
  }

  // Hold initiation
  const startHold = () => {
    if (phase !== 'idle') return
    holdStartRef.current = performance.now()
    setPhase('holding')
    setProgress(0)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15)
    }
    if (onRevealSound) onRevealSound.start()
  }

  const cancelHold = () => {
    if (phase === 'holding') {
      setPhase('idle')
      setProgress(0)
      if (onRevealSound) onRevealSound.stop()
    }
  }

  // Begin reveal timeline
  const beginReveal = (ts: number) => {
    if (!selectedPlayer) return
    animStartRef.current = ts
    extraWaitRef.current = 0
    burstFiredRef.current = false
    setPhase('reveal')
    setProgress(1)
    setTime(0)
    setIsResolved(false)

    // Trigger API call
    onReveal(selectedPlayer)
      .then(res => {
        const tribeKey = res.tribe
        const idx = TI[tribeKey] !== undefined ? TI[tribeKey] : 0
        setAssignedTribeIdx(idx)
        setIsResolved(true)
      })
      .catch(err => {
        console.error('Reveal API failure:', err)
        if (onRevealSound) onRevealSound.stop()
        setToastMessage('The elements are restless — the reveal didn’t go through. Hold the sigil to try again.')
        setPhase('idle')
        setProgress(0)
        setTime(0)
        setTimeout(() => setToastMessage(''), 3800)
      })
  }

  // Animation frame loop
  useEffect(() => {
    const tick = (ts: number) => {
      rafRef.current = requestAnimationFrame(tick)

      if (phase === 'holding') {
        const p = Math.min(1, (ts - holdStartRef.current) / 1600)
        setProgress(p)
        if (onRevealSound) onRevealSound.update(p * 100)

        // Subtle milestone haptics during charging
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          if (p >= 0.33 && p < 0.36 && Math.random() < 0.15) navigator.vibrate(10)
          if (p >= 0.66 && p < 0.69 && Math.random() < 0.15) navigator.vibrate(15)
        }

        if (p >= 1) {
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(40)
          }
          beginReveal(ts)
        }
      } else if (phase === 'reveal') {
        let t = (ts - animStartRef.current) / 1000

        // If API hasn't resolved by t=2.9, freeze card transition and accumulate orbit wait
        if (!isResolved && t > 2.9) {
          const over = t - 2.9
          animStartRef.current += over * 1000
          extraWaitRef.current = (extraWaitRef.current || 0) + over
          t = 2.9
        }

        // Trigger burst sound once when t crosses 4.2
        if (t >= 4.2 && !burstFiredRef.current && isResolved && !isAlreadyRevealed) {
          burstFiredRef.current = true
          if (onRevealSound) {
            const tribeKey = TR[assignedTribeIdx]?.key || 'lava'
            onRevealSound.burst(tribeKey)
          }
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([100, 50, 200])
          }
        }

        setTime(t)
        if (t > 6.2) {
          setPhase('done')
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase, isResolved, isAlreadyRevealed, assignedTribeIdx, onRevealSound, selectedPlayer])

  // Navigation callbacks
  const returnToSearch = (clearSearch = false) => {
    if (onRevealSound) onRevealSound.stop()
    setView('search')
    setPhase('idle')
    setProgress(0)
    setTime(0)
    setSelectedPlayer(null)
    if (clearSearch) handleQuery('')
  }

  const replayReveal = () => {
    animStartRef.current = performance.now()
    extraWaitRef.current = 0
    burstFiredRef.current = false
    setIsAlreadyRevealed(false)
    setIsResolved(true)
    setPhase('reveal')
    setTime(0)
  }

  // Math helpers from reference prototype
  const cl = (x: number) => Math.min(1, Math.max(0, x))
  const ss = (a: number, b: number) => {
    const x = cl((time - a) / (b - a))
    return x * x * (3 - 2 * x)
  }
  const L = (a: number, b: number, k: number) => a + (b - a) * k

  const isStage = view === 'stage'
  const isConfirm = isStage && (phase === 'idle' || phase === 'holding')
  const isRev = isStage && (phase === 'reveal' || phase === 'done')
  const activeTribe = TR[assignedTribeIdx] || TR[0]
  const scaleCanvas = Math.min(sw / 390, sh / 844).toFixed(4)

  // Search filtering
  const queryLower = q.trim().toLowerCase()
  const digitsOnly = queryLower.replace(/\D/g, '')

  const counts = useMemo(() => {
    return [
      players.length,
      players.filter(p => !p.tribe).length,
      players.filter(p => p.tribe).length
    ]
  }, [players])

  const filteredRows = useMemo(() => {
    return players
      .filter(p => {
        if (filterIdx === 1 && p.tribe) return false
        if (filterIdx === 2 && !p.tribe) return false

        if (!queryLower) return true
        const nameMatch = p.name.toLowerCase().includes(queryLower)
        const phoneMatch = digitsOnly.length >= 3 && p.mobile.includes(digitsOnly)
        return nameMatch || phoneMatch
      })
      .map(p => {
        const tx = p.tribe ? TR[TI[p.tribe]] : null
        const nameLower = p.name.toLowerCase()
        const at = queryLower ? nameLower.indexOf(queryLower) : -1
        const len = queryLower.length

        const pre = at >= 0 ? p.name.slice(0, at) : p.name
        const mid = at >= 0 ? p.name.slice(at, at + len) : ''
        const post = at >= 0 ? p.name.slice(at + len) : ''
        const ini = p.name
          .split(/\s+/)
          .map(w => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()

        return {
          player: p,
          pre,
          mid,
          post,
          phone: maskPhone(p.mobile),
          ini,
          tx,
          lab: `${p.name}, ${tx ? `revealed: ${tx.n}` : 'ready to reveal'}`
        }
      })
  }, [players, filterIdx, queryLower, digitsOnly])

  // Reveal orbit cards calculations
  const CX = 195
  const CY = 250
  const ang = (u: number) => {
    const a1 = Math.min(u, 2.4)
    return 140 * a1 * a1 + (u > 2.4 ? 672 * (u - 2.4) - 120 * (u - 2.4) * (u - 2.4) : 0)
  }

  const emerge = ss(0.2, 0.9)
  const pick = ss(3.0, 3.7)
  const flip = ss(3.7, 4.4)
  const plq = ss(4.6, 5.1)

  const cards = isRev
    ? TR.map((c, i) => {
        const isC = i === assignedTribeIdx
        const a = ((ang(Math.min(time, 3.0)) + (extraWaitRef.current || 0) * 528 + i * 90) * Math.PI) / 180
        const rad = L(0, 140, emerge) * (1 + 0.1 * Math.sin(time * 6))
        let x = CX + Math.cos(a) * rad
        let y = CY + 70 + Math.sin(a) * rad * 0.42
        let s = L(0.16, 0.4, emerge) * (0.85 + 0.15 * Math.sin(a))
        let r = Math.cos(a) * 14
        let o = emerge
        let z = Math.round(10 + 10 * Math.sin(a))

        if (isC) {
          x = L(x, CX, pick)
          y = L(y, CY, pick) - 50 * Math.sin(Math.PI * pick)
          s = L(s, 0.62, pick)
          r = L(r, 0, pick)
          z = pick > 0 ? 40 : z
        } else {
          const out = pick
          x = L(x, CX + (x - CX) * 3.2, out)
          y = L(y, y + 120, out)
          o = o * (1 - out)
          s = s * (1 - 0.3 * out)
        }

        const f = isC ? 180 * (1 - flip) : 180
        return {
          isC,
          src: c.src,
          alt: `${c.n} tribe card`,
          x: x.toFixed(1),
          y: y.toFixed(1),
          s: s.toFixed(3),
          r: r.toFixed(2),
          o: o.toFixed(3),
          z,
          f: f.toFixed(1),
          g: isC ? (60 * flip).toFixed(0) : 0,
          gc: c.c,
          pl: isC ? plq.toFixed(3) : 0,
          py: (14 * (1 - plq)).toFixed(1)
        }
      })
    : []

  // Particle burst dots
  const burst =
    isRev && time > 4.2 && !isAlreadyRevealed
      ? Array.from({ length: 18 }).map((_, k) => {
          const u = cl((time - 4.2) / 1.2)
          const a = (k / 18) * Math.PI * 2
          const d = 50 + 190 * (1 - Math.pow(1 - u, 3))
          const sz = 4 + (k % 3) * 2
          return {
            x: (Math.cos(a) * d).toFixed(1),
            y: (Math.sin(a) * d).toFixed(1),
            o: (1 - u).toFixed(3),
            c: activeTribe.c,
            s: sz,
            m: -sz / 2
          }
        })
      : []

  const waveU = cl((time - 4.15) / 1.0)
  const waveSize = 160 + 520 * waveU
  const waveOpacity = isRev && time > 4.15 && !isAlreadyRevealed ? (0.9 * (1 - waveU)).toFixed(3) : '0'

  // Gamified Subtle Effects:
  // 1. Hold Button micro-jitter / rumble while charging
  const holdJitterX = phase === 'holding' ? (Math.sin(progress * 65) * progress * 2.2).toFixed(1) : '0'
  const holdJitterY = phase === 'holding' ? (Math.cos(progress * 80) * progress * 2.2).toFixed(1) : '0'

  // 2. Subtle camera kick on reveal burst at t = 4.18s - 4.40s
  const screenShake =
    isRev && !isAlreadyRevealed && time >= 4.18 && time <= 4.40
      ? (Math.sin((time - 4.18) * 55) * (1 - (time - 4.18) / 0.22) * 2.8).toFixed(1)
      : '0'

  // 3. Subtle floating elemental sparkle stars
  const sparkleStars = useMemo(() => [
    { x: -75, y: -45, delay: 0.08, sz: 12 },
    { x: 80, y: -50, delay: 0.22, sz: 14 },
    { x: -95, y: 35, delay: 0.38, sz: 11 },
    { x: 90, y: 40, delay: 0.15, sz: 13 },
    { x: -40, y: -90, delay: 0.32, sz: 12 },
    { x: 50, y: -85, delay: 0.28, sz: 10 }
  ], [])

  const flashOpacity =
    isRev && !isAlreadyRevealed
      ? (0.55 * Math.max(Math.sin(Math.PI * ss(0, 0.35)), Math.sin(Math.PI * ss(4.05, 4.45)))).toFixed(3)
      : '0'

  const tintOpacity = isRev
    ? ss(3.6, 4.6).toFixed(3)
    : phase === 'holding'
    ? (0.3 * progress).toFixed(3)
    : '0'

  const bgScale = (1.04 + 0.04 * ss(0, 3)).toFixed(4)
  const bgBrightness = isStage ? '0.85' : '0.7'

  return (
    <>
      {/* Styles per design spec */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .tw { position: absolute; width: 2px; height: 2px; border-radius: 50%; background: #FFF5DE; box-shadow: 0 0 6px rgba(232,201,137,.9); animation: twk 3s ease-in-out infinite alternate; }
            @keyframes twk { from { opacity: .15; } to { opacity: 1; } }
            .spin { animation: spin 40s linear infinite; }
            .spinr { animation: spin 26s linear infinite reverse; }
            @keyframes spin { to { transform: rotate(360deg); } }
            .scr { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }
            .wrap { max-width: 480px; margin: 0 auto; padding: 0 16px 40px; }
            .sbar { position: sticky; top: 0; z-index: 5; padding: 10px 0 12px; background: linear-gradient(#04050A 70%, rgba(4,5,10,0)); }
            .field { position: relative; display: flex; align-items: center; height: 56px; border-radius: 999px; border: 1px solid rgba(201,160,99,.55); background: rgba(10,8,6,.88); box-shadow: 0 10px 30px rgba(0,0,0,.5), inset 0 0 0 1px rgba(0,0,0,.4); }
            .field:focus-within { border-color: #E8C989; box-shadow: 0 0 0 3px rgba(201,160,99,.25), 0 10px 30px rgba(0,0,0,.5); }
            .mag { position: relative; flex: none; width: 18px; height: 18px; margin: 0 12px 0 20px; }
            .mag:before { content:''; position: absolute; left: 0; top: 0; width: 11px; height: 11px; border: 2px solid #C9A063; border-radius: 50%; }
            .mag:after { content:''; position: absolute; left: 12px; top: 12px; width: 7px; height: 2px; background: #C9A063; transform: rotate(45deg); transform-origin: 0 50%; }
            .sin { flex: 1; min-width: 0; height: 100%; border: 0; background: transparent; color: #F3D594; font: 500 17px 'Saira', sans-serif; letter-spacing: .04em; outline: none; }
            .sin::placeholder { color: #8F8372; }
            .clr { flex: none; width: 44px; height: 44px; margin-right: 6px; border: 0; border-radius: 50%; background: rgba(201,160,99,.12); color: #E8C989; font-size: 16px; cursor: pointer; }
            .chips { display: flex; gap: 8px; overflow-x: auto; padding: 2px 0 4px; scrollbar-width: none; }
            .chips::-webkit-scrollbar { display: none; }
            .chip { flex: 1 0 auto; min-height: 38px; padding: 0 12px; border-radius: 999px; border: 1px solid rgba(201,160,99,.35); background: rgba(10,8,6,.6); color: #CFC4B3; font: 500 12px 'Saira', sans-serif; letter-spacing: .1em; white-space: nowrap; cursor: pointer; transition: all .2s; }
            .chip.on { background: #C9A063; border-color: #C9A063; color: #0B0907; }
            .row { display: flex; align-items: center; gap: 14px; width: 100%; min-height: 72px; padding: 12px 14px; margin-top: 10px; border-radius: 14px; border: 1px solid rgba(201,160,99,.22); background: linear-gradient(135deg, rgba(16,12,9,.92), rgba(10,8,6,.78)); color: inherit; font: inherit; text-align: left; cursor: pointer; box-sizing: border-box; -webkit-tap-highlight-color: transparent; touch-action: manipulation; transition: border-color .2s, transform .2s; }
            .row:active { transform: scale(.985); }
            .row:focus-visible { outline: 2px solid #E8C989; outline-offset: 3px; }
            .sig { flex: none; position: relative; width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Cinzel', serif; font-weight: 700; font-size: 18px; }
            .mk { background: none; color: #FFE7A8; text-shadow: 0 0 10px rgba(232,190,110,.7); }
            .st { flex: none; padding: 7px 12px; border-radius: 999px; font: 600 11px 'Saira', sans-serif; letter-spacing: .16em; white-space: nowrap; }
            .skel { height: 72px; margin-top: 10px; border-radius: 14px; background: linear-gradient(100deg, rgba(30,24,18,.7) 30%, rgba(60,48,34,.7) 50%, rgba(30,24,18,.7) 70%); background-size: 300% 100%; animation: sk 1.4s linear infinite; }
            @keyframes sk { to { background-position: -150% 0; } }
            .hold { position: absolute; left: 110px; top: 285px; width: 170px; height: 170px; border-radius: 50%; border: 0; padding: 0; cursor: pointer; background: radial-gradient(circle at 50% 40%, #1A140C, #07060A 70%); box-shadow: 0 0 0 2px rgba(201,160,99,.5), 0 0 60px rgba(232,190,110,.25), inset 0 0 40px rgba(0,0,0,.8); touch-action: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; transition: transform .2s; }
            .hold:active { transform: scale(.97); }
            .hold:focus-visible { outline: 2px solid #E8C989; outline-offset: 8px; }
            .card { position: absolute; left: 0; top: 0; width: 254px; height: 336px; margin: -168px 0 0 -127px; perspective: 1300px; will-change: transform; }
            .flip { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; }
            .flip img { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: 14px; backface-visibility: hidden; -webkit-backface-visibility: hidden; box-shadow: 0 30px 70px rgba(0,0,0,.7); }
            .flip .bk { transform: rotateY(180deg); left: 12px; width: 230px; }
            .flip .fr { box-shadow: none; border-radius: 0; }
            .cta { display: inline-flex; align-items: center; justify-content: center; min-height: 50px; padding: 0 20px; border: 1.5px solid #C9A063; border-radius: 6px; color: #E8C989; text-decoration: none; font: 500 13px 'Saira', sans-serif; letter-spacing: .16em; background: rgba(20,15,10,.75); cursor: pointer; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
            .ctaf { background: #C9A063; color: #0B0907; font-weight: 700; }
            .back { position: absolute; left: 12px; top: 64px; z-index: 6; display: flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 14px; border-radius: 999px; border: 1px solid rgba(201,160,99,.4); background: rgba(10,8,6,.7); color: #E8C989; font: 500 12px 'Saira', sans-serif; letter-spacing: .18em; cursor: pointer; }
            .pill { animation: pl 2.4s ease-in-out infinite; }
            @keyframes pl { 0%,100% { box-shadow: 0 0 0 rgba(232,190,110,0); } 50% { box-shadow: 0 0 26px rgba(232,190,110,.45); } }
            .toast { animation: tin .35s cubic-bezier(.22,1,.36,1); }
            @keyframes tin { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }
            @media (hover:hover) { .row:hover { border-color: rgba(232,201,137,.6); } .cta:hover { background: #C9A063; color: #0B0907; } .chip:hover { border-color: #E8C989; } }
            @media (prefers-reduced-motion:reduce) { .spin, .spinr, .tw, .pill, .skel { animation: none; } }
          `
        }}
      />

      <div
        ref={rootRef}
        style={{
          position: 'relative',
          height: '100dvh',
          minHeight: '560px',
          overflow: 'hidden',
          background: '#04050A',
          color: '#EDE6DA',
          fontFamily: "'Saira', sans-serif"
        }}
      >
        {/* Layer 1: Universe Background */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-4%',
            backgroundImage: 'url(/tribe-reveal/backgrounds/universe-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `scale(${bgScale})`,
            filter: `brightness(${bgBrightness})`,
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Layer 2: Smoke Overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/tribe-reveal/backgrounds/smoke.webp)',
            backgroundSize: 'cover',
            mixBlendMode: 'screen',
            opacity: 0.14,
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Layer 3: 46 Twinkling Stars */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
          {stars.map((s, idx) => (
            <i key={idx} className="tw" style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }} />
          ))}
        </div>

        {/* Layer 4: Tribe Radial Glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 50% 38%, ${activeTribe.tint}, rgba(0,0,0,0) 58%)`,
            opacity: Number(tintOpacity),
            pointerEvents: 'none',
            zIndex: 3
          }}
        />

        {/* Layer 5: Vignette */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,.78) 100%)',
            pointerEvents: 'none',
            zIndex: 4
          }}
        />

        {/* Layer 6: Screen Flash */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: '#FFF3D6',
            opacity: Number(flashOpacity),
            pointerEvents: 'none',
            zIndex: 20
          }}
        />

        {/* Top Header */}
        <header
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            zIndex: 8,
            height: '56px',
            padding: 'env(safe-area-inset-top, 0px) 16px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(rgba(4,5,10,.95), rgba(4,5,10,0))'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/tribe-reveal/brand/logo.png" alt="Zambaara Logo" style={{ width: '28px' }} />
            <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '15px', letterSpacing: '.22em', color: '#E8C989' }}>
              ZAMBAARA
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onBackToArena && (
              <button
                type="button"
                onClick={onBackToArena}
                style={{
                  padding: '5px 10px',
                  borderRadius: '999px',
                  border: '1px solid rgba(201,160,99,.25)',
                  background: 'rgba(10,8,6,.6)',
                  color: '#A89A86',
                  fontSize: '9px',
                  letterSpacing: '.12em',
                  cursor: 'pointer'
                }}
              >
                ← ARENA
              </button>
            )}
            {tournaments && tournaments.length > 1 ? (
              <select
                value={selectedTournamentId}
                onChange={e => onSelectTournament?.(e.target.value)}
                aria-label="Select custom tournament"
                style={{
                  maxWidth: '46vw',
                  padding: '5px 10px',
                  borderRadius: '999px',
                  border: '1px solid rgba(201,160,99,.5)',
                  background: 'rgba(10,8,6,.88)',
                  color: '#C9A063',
                  fontSize: '10px',
                  letterSpacing: '.14em',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {tournaments.map(t => (
                  <option key={t.id} value={t.id} style={{ background: '#0B0907', color: '#E8C989' }}>
                    {t.name.toUpperCase()}
                  </option>
                ))}
              </select>
            ) : (
              <span
                style={{
                  maxWidth: '44vw',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  border: '1px solid rgba(201,160,99,.4)',
                  fontSize: '10px',
                  letterSpacing: '.16em',
                  color: '#C9A063'
                }}
              >
                {eventName}
              </span>
            )}
          </div>
        </header>

        {/* SCREEN A: SEARCH */}
        {!isStage && (
          <div className="scr">
            <div className="wrap" style={{ paddingTop: '70px' }}>
              {/* Intro Hero */}
              <div style={{ textAlign: 'center', padding: '8px 0 14px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '.38em', color: '#C9A063', textTransform: 'uppercase' }}>
                  THE ELEMENTS ARE WAITING
                </div>
                <h1
                  style={{
                    margin: '10px 0 0',
                    fontFamily: "'Cinzel', serif",
                    fontWeight: 700,
                    fontSize: '32px',
                    lineHeight: 1.05,
                    letterSpacing: '.1em',
                    color: '#F3D594',
                    textShadow: '0 0 40px rgba(232,190,110,.35)'
                  }}
                >
                  SUMMON<br />YOUR TRIBE
                </h1>
                <p style={{ margin: '10px 0 0', fontSize: '14px', lineHeight: 1.5, color: '#A89A86' }}>
                  Find your name, then hold the sigil to reveal your tribe.
                </p>
              </div>

              {/* Sticky Search Bar */}
              <div className="sbar">
                <div className="field">
                  <span className="mag" aria-hidden="true" />
                  <label htmlFor="psearch" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                    Search registered players
                  </label>
                  <input
                    id="psearch"
                    className="sin"
                    type="search"
                    enterKeyHint="search"
                    autoComplete="off"
                    autoCapitalize="words"
                    spellCheck="false"
                    placeholder="Search name or last 4 digits"
                    value={q}
                    onChange={e => handleQuery(e.target.value)}
                  />
                  {q.length > 0 && (
                    <button type="button" className="clr" aria-label="Clear search" onClick={() => handleQuery('')}>
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter chips with counts */}
                <div className="chips" role="tablist" aria-label="Filter players" style={{ marginTop: '12px' }}>
                  {[
                    { idx: 0 as const, label: 'ALL', count: counts[0] },
                    { idx: 1 as const, label: 'TO REVEAL', count: counts[1] },
                    { idx: 2 as const, label: 'REVEALED', count: counts[2] }
                  ].map(f => (
                    <button
                      key={f.idx}
                      type="button"
                      role="tab"
                      aria-selected={filterIdx === f.idx}
                      className={`chip ${filterIdx === f.idx ? 'on' : ''}`}
                      onClick={() => setFilterIdx(f.idx)}
                    >
                      {f.label} · {f.count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Count Line */}
              <div
                aria-live="polite"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  letterSpacing: '.18em',
                  color: '#8F8372',
                  padding: '2px 4px 0'
                }}
              >
                <span>{q ? `${filteredRows.length} MATCH${filteredRows.length === 1 ? '' : 'ES'}` : `${counts[0]} REGISTERED`}</span>
                <span>{counts[2]} REVEALED</span>
              </div>

              {/* Loading skeletons */}
              {loading && (
                <div aria-label="Loading players">
                  <div className="skel" />
                  <div className="skel" style={{ opacity: 0.8 }} />
                  <div className="skel" style={{ opacity: 0.6 }} />
                  <div className="skel" style={{ opacity: 0.4 }} />
                </div>
              )}

              {/* Load error */}
              {!loading && error && (
                <div
                  role="alert"
                  style={{
                    marginTop: '26px',
                    padding: '22px 20px',
                    borderRadius: '16px',
                    border: '1px solid rgba(224,90,70,.5)',
                    textAlign: 'center',
                    background: 'rgba(60,14,10,.5)'
                  }}
                >
                  <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '18px', color: '#F2B8AE' }}>
                    The elements are restless
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#E4C4BC' }}>
                    {error || 'We couldn’t load the player list. Check the connection and try again.'}
                  </p>
                  {onRetry && (
                    <button type="button" className="cta" style={{ marginTop: '14px' }} onClick={onRetry}>
                      TRY AGAIN
                    </button>
                  )}
                </div>
              )}

              {/* Player Rows */}
              {!loading && !error && filteredRows.length > 0 && (
                <div role="list" style={{ marginTop: '4px' }}>
                  {filteredRows.map(({ player, pre, mid, post, phone, ini, tx, lab }) => {
                    const borderColor = tx ? 'rgba(201,160,99,.18)' : 'rgba(201,160,99,.32)'
                    const sigilBg = tx ? 'radial-gradient(circle, rgba(0,0,0,.2), rgba(0,0,0,.7))' : 'radial-gradient(circle at 50% 35%, #2A2013, #0B0907)'
                    const sigilRing = tx ? tx.c : 'rgba(201,160,99,.7)'
                    const sigilGlow = tx ? tx.c.replace(/[\d.]+\)$/, '.35)') : 'rgba(232,190,110,.15)'

                    return (
                      <button
                        key={player.id}
                        type="button"
                        role="listitem"
                        className="row"
                        onClick={() => handleSelect(player)}
                        aria-label={lab}
                        style={{ borderColor }}
                      >
                        <span
                          className="sig"
                          aria-hidden="true"
                          style={{
                            background: sigilBg,
                            boxShadow: `0 0 0 1.5px ${sigilRing}, 0 0 18px ${sigilGlow}`,
                            color: '#E8C989'
                          }}
                        >
                          {tx ? (
                            <img src={tx.icon} alt="" style={{ width: '30px', height: '30px' }} />
                          ) : (
                            <span>{ini}</span>
                          )}
                        </span>

                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span
                            style={{
                              display: 'block',
                              fontSize: '17px',
                              fontWeight: 500,
                              color: '#EDE6DA',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {pre}
                            {mid && <mark className="mk">{mid}</mark>}
                            {post}
                          </span>
                          <span style={{ display: 'block', marginTop: '3px', fontSize: '12px', letterSpacing: '.12em', color: '#8F8372' }}>
                            {phone}
                          </span>
                        </span>

                        {tx ? (
                          <span
                            className="st"
                            style={{
                              background: 'rgba(0,0,0,.35)',
                              color: tx.fg,
                              border: `1px solid ${tx.c.replace(/[\d.]+\)$/, '.6)')}`
                            }}
                          >
                            {tx.n}
                          </span>
                        ) : (
                          <span
                            className="st"
                            style={{
                              background: '#C9A063',
                              color: '#0B0907',
                              border: '1px solid #C9A063'
                            }}
                          >
                            REVEAL
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* No players registered in this custom tournament yet */}
              {!loading && !error && players.length === 0 && (
                <div
                  style={{
                    marginTop: '26px',
                    padding: '28px 20px',
                    borderRadius: '16px',
                    border: '1px dashed rgba(201,160,99,.4)',
                    textAlign: 'center',
                    background: 'rgba(10,8,6,.75)'
                  }}
                >
                  <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '20px', color: '#E8C989' }}>
                    No Players Registered
                  </div>
                  <p style={{ margin: '10px 0 0', fontSize: '14px', lineHeight: 1.55, color: '#A89A86' }}>
                    There are no players registered in <strong style={{ color: '#F3D594' }}>{eventName}</strong> yet.
                  </p>
                  <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#8F8372' }}>
                    Register players in the Admin Panel to reveal their tribes.
                  </p>
                  {onBackToArena && (
                    <button type="button" className="cta" style={{ marginTop: '16px' }} onClick={onBackToArena}>
                      ← TOURNAMENT ARENA
                    </button>
                  )}
                </div>
              )}

              {/* No results search query card */}
              {!loading && !error && players.length > 0 && filteredRows.length === 0 && (
                <div
                  style={{
                    marginTop: '26px',
                    padding: '26px 20px',
                    borderRadius: '16px',
                    border: '1px dashed rgba(201,160,99,.35)',
                    textAlign: 'center',
                    background: 'rgba(10,8,6,.6)'
                  }}
                >
                  <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '20px', color: '#E8C989' }}>
                    No Zampion found
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: '14px', lineHeight: 1.55, color: '#A89A86' }}>
                    Nothing matches “{q}”. Check the spelling or search by the last 4 digits of your mobile number.
                  </p>
                  <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#8F8372' }}>
                    Only players registered in {eventName} are available to reveal.
                  </p>
                  <button type="button" className="cta" style={{ marginTop: '16px' }} onClick={() => handleQuery('')}>
                    CLEAR SEARCH
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STAGE SCREENS (B: Confirm, C: Reveal, D: Result) */}
        {isStage && (
          <>
            {/* Back button */}
            <button
              type="button"
              className="back"
              onClick={() => returnToSearch(false)}
              aria-label="Back to search"
            >
              ‹ SEARCH
            </button>

            {/* 390 x 844 Design Canvas with subtle screen impact shake */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '390px',
                height: '844px',
                transform: `translate(calc(-50% + ${screenShake}px), -50%) scale(${scaleCanvas})`,
                transformOrigin: 'center center'
              }}
            >
              {/* Spinning Element Rings */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '195px',
                  top: '370px',
                  width: '300px',
                  height: '300px',
                  margin: '-150px 0 0 -150px',
                  opacity: isRev ? (1 - ss(0.1, 0.8) * 0.75 - 0.25 * ss(4.4, 5.2)).toFixed(3) : '1',
                  transform: `scale(${isRev ? (1 + 0.25 * ss(0, 1) - 0.1 * ss(3, 4)).toFixed(3) : (1 + 0.04 * progress).toFixed(3)})`
                }}
              >
                <div className="spin" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(201,160,99,.4)' }}>
                  <i style={{ position: 'absolute', left: '50%', top: '-5px', width: '10px', height: '10px', marginLeft: '-5px', borderRadius: '50%', background: '#E8C989', boxShadow: '0 0 14px #E8C989' }} />
                  <i style={{ position: 'absolute', left: '50%', bottom: '-4px', width: '8px', height: '8px', marginLeft: '-4px', borderRadius: '50%', background: '#E8C989' }} />
                </div>
                <div className="spinr" style={{ position: 'absolute', inset: '34px', borderRadius: '50%', border: '1px dashed rgba(201,160,99,.35)' }} />
                <img src="/tribe-reveal/icons/lava.png" alt="" style={{ position: 'absolute', left: '130px', top: '-20px', width: '40px', opacity: 0.9 }} />
                <img src="/tribe-reveal/icons/rain.png" alt="" style={{ position: 'absolute', left: '280px', top: '130px', width: '40px', opacity: 0.9 }} />
                <img src="/tribe-reveal/icons/wind.png" alt="" style={{ position: 'absolute', left: '130px', top: '280px', width: '40px', opacity: 0.9 }} />
                <img src="/tribe-reveal/icons/mountain.png" alt="" style={{ position: 'absolute', left: '-20px', top: '130px', width: '40px', opacity: 0.9 }} />
              </div>

              {/* SCREEN B: CONFIRM ("IS THIS YOU?") */}
              {isConfirm && selectedPlayer && (
                <>
                  <div style={{ position: 'absolute', left: '20px', right: '20px', top: '100px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', letterSpacing: '.36em', color: '#C9A063' }}>IS THIS YOU?</div>
                    <div
                      style={{
                        margin: '10px auto 0',
                        display: 'inline-block',
                        maxWidth: '330px',
                        padding: '10px 22px',
                        borderRadius: '10px',
                        background: 'linear-gradient(90deg, rgba(169,122,52,.18), rgba(243,213,148,.22), rgba(169,122,52,.18))',
                        border: '1px solid rgba(232,201,137,.55)'
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontWeight: 700,
                          fontSize: '24px',
                          letterSpacing: '.08em',
                          lineHeight: 1.15,
                          color: '#F3D594',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {selectedPlayer.name}
                      </div>
                      <div style={{ marginTop: '4px', fontSize: '12px', letterSpacing: '.16em', color: '#A89A86' }}>
                        {maskPhone(selectedPlayer.mobile)}
                      </div>
                    </div>
                  </div>

                  {/* 1.6s Hold Sigil Button with subtle micro-rumble */}
                  <button
                    type="button"
                    className="hold"
                    aria-label="Press and hold to reveal your tribe"
                    onPointerDown={startHold}
                    onPointerUp={cancelHold}
                    onPointerLeave={cancelHold}
                    onPointerCancel={cancelHold}
                    onKeyDown={e => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault()
                        if (!e.repeat) startHold()
                      }
                    }}
                    onKeyUp={cancelHold}
                    onContextMenu={e => e.preventDefault()}
                    style={{
                      transform: `translate(${holdJitterX}px, ${holdJitterY}px)`
                    }}
                  >
                    {/* Channeling Pulse Aura */}
                    {phase === 'holding' && (
                      <div
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          inset: '-16px',
                          borderRadius: '50%',
                          border: '1.5px solid rgba(232, 201, 137, 0.55)',
                          boxShadow: '0 0 25px rgba(232, 190, 110, 0.45)',
                          transform: `scale(${1 + 0.12 * Math.sin(progress * Math.PI * 5)})`,
                          opacity: 0.6 + 0.4 * Math.sin(progress * Math.PI * 5),
                          pointerEvents: 'none'
                        }}
                      />
                    )}

                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: '-12px',
                        borderRadius: '50%',
                        background: `conic-gradient(#E8C989 ${(360 * progress).toFixed(1)}deg, rgba(201,160,99,.12) 0deg)`,
                        WebkitMaskImage: 'radial-gradient(circle, transparent 69%, #000 70%)',
                        maskImage: 'radial-gradient(circle, transparent 69%, #000 70%)'
                      }}
                    />
                    <img
                      src="/tribe-reveal/brand/logo.png"
                      alt=""
                      style={{
                        width: '74px',
                        transform: `scale(${(1 + 0.12 * progress).toFixed(3)})`,
                        filter: `drop-shadow(0 0 ${(10 + 30 * progress).toFixed(0)}px rgba(232,190,110,.9))`
                      }}
                    />

                    {/* Gamified Channeling Percentage Display */}
                    {phase === 'holding' && (
                      <div
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          bottom: '18px',
                          left: 0,
                          right: 0,
                          textAlign: 'center',
                          fontFamily: "'Cinzel', serif",
                          fontWeight: 700,
                          fontSize: '13px',
                          letterSpacing: '.16em',
                          color: '#F3D594',
                          textShadow: '0 0 10px rgba(232,190,110,0.95)',
                          pointerEvents: 'none'
                        }}
                      >
                        {Math.floor(progress * 100)}%
                      </div>
                    )}
                  </button>

                  {/* Pulse Pill with dynamic percentage */}
                  <div
                    className="pill"
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '556px',
                      transform: 'translateX(-50%)',
                      padding: '11px 24px',
                      borderRadius: '999px',
                      border: '1px solid rgba(201,160,99,.55)',
                      background: 'rgba(10,8,6,.85)',
                      textAlign: 'center',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '13px', letterSpacing: '.3em', color: '#E8C989' }}>
                      {phase === 'holding' ? `CHANNELLING ${Math.floor(progress * 100)}%` : 'HOLD TO REVEAL'}
                    </div>
                    <div style={{ marginTop: '3px', fontSize: '10px', letterSpacing: '.26em', color: '#A89A86' }}>
                      YOUR TRIBE
                    </div>
                  </div>

                  <p style={{ position: 'absolute', left: '30px', right: '30px', top: '628px', margin: 0, textAlign: 'center', fontSize: '14px', lineHeight: 1.5, color: '#8F8372' }}>
                    Press and hold the sigil for two breaths.
                  </p>

                  <button
                    type="button"
                    onClick={() => returnToSearch(false)}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '676px',
                      transform: 'translateX(-50%)',
                      minHeight: '44px',
                      padding: '0 16px',
                      whiteSpace: 'nowrap',
                      border: 0,
                      background: 'none',
                      color: '#A89A86',
                      font: "500 13px 'Saira', sans-serif",
                      letterSpacing: '.14em',
                      textDecoration: 'underline',
                      textUnderlineOffset: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    NOT YOU? SEARCH AGAIN
                  </button>
                </>
              )}

              {/* SCREEN C: ORBITING CARDS & 3D FLIP */}
              {cards.map((c, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    transform: `translate3d(${c.x}px, ${c.y}px, 0) rotate(${c.r}deg) scale(${c.s})`,
                    opacity: Number(c.o),
                    zIndex: c.z
                  }}
                >
                  <div className="flip" style={{ transform: `rotateY(${c.f}deg)` }}>
                    <div className="fr" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                      <img
                        src={c.src}
                        alt={c.alt}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '14px',
                          filter: `drop-shadow(0 30px 40px rgba(0,0,0,.7)) drop-shadow(0 0 ${c.g}px ${c.gc})`
                        }}
                      />
                      {/* Subtle Holographic Foil Gleam Sweep across front of revealed card */}
                      {c.isC && time >= 3.9 && (
                        <div
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '14px',
                            pointerEvents: 'none',
                            background: 'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.48) 50%, rgba(243,213,148,0.35) 55%, transparent 70%)',
                            backgroundSize: '220% 220%',
                            backgroundPosition: `${L(180, -60, ss(3.9, 4.8))}% 0%`,
                            opacity: Number((ss(3.9, 4.2) * (1 - ss(4.8, 5.3))).toFixed(3)),
                            mixBlendMode: 'color-dodge'
                          }}
                        />
                      )}
                    </div>
                    <img className="bk" src="/tribe-reveal/cards/back.webp" alt="" />
                  </div>
                  {/* Gold Name Plaque Under Card */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '6%',
                      right: '6%',
                      bottom: '-26px',
                      height: '50px',
                      borderRadius: '6px',
                      background: 'linear-gradient(90deg, #A97A34, #F3D594 50%, #A97A34)',
                      boxShadow: '0 10px 24px rgba(0,0,0,.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 10px',
                      fontFamily: "'Cinzel', serif",
                      fontWeight: 700,
                      fontSize: '22px',
                      letterSpacing: '.1em',
                      color: '#1A1208',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      opacity: Number(c.pl),
                      transform: `translateY(${c.py}px)`
                    }}
                  >
                    {selectedPlayer ? selectedPlayer.name.toUpperCase() : ''}
                  </div>
                </div>
              ))}

              {/* Gamified "✦ TRIBE UNLOCKED ✦" Badge */}
              {isRev && time > 4.25 && (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '68px',
                    transform: `translateX(-50%) scale(${(0.75 + 0.25 * ss(4.25, 4.65)).toFixed(3)})`,
                    opacity: Number(ss(4.25, 4.55).toFixed(3)),
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 18px',
                    borderRadius: '999px',
                    border: `1px solid ${activeTribe.c}`,
                    background: 'rgba(10,8,6,0.92)',
                    boxShadow: `0 0 24px ${activeTribe.c}, inset 0 0 10px rgba(0,0,0,0.6)`,
                    zIndex: 50,
                    pointerEvents: 'none'
                  }}
                >
                  <span style={{ color: activeTribe.fg, fontSize: '10px' }}>✦</span>
                  <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '11px', letterSpacing: '.24em', color: '#F3D594' }}>
                    TRIBE UNLOCKED
                  </span>
                  <span style={{ color: activeTribe.fg, fontSize: '10px' }}>✦</span>
                </div>
              )}

              {/* Subtle Floating Sparkle Stars */}
              {isRev && time > 4.18 && !isAlreadyRevealed && sparkleStars.map((sp, idx) => {
                const tRel = time - 4.18 - sp.delay
                if (tRel < 0 || tRel > 1.8) return null
                const u = tRel / 1.8
                const driftY = -55 * u
                const op = u < 0.2 ? u / 0.2 : (1 - u)
                return (
                  <div
                    key={`spark-${idx}`}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: `calc(195px + ${sp.x}px)`,
                      top: `calc(250px + ${sp.y}px + ${driftY}px)`,
                      fontSize: `${sp.sz}px`,
                      color: activeTribe.fg,
                      opacity: op,
                      textShadow: `0 0 8px ${activeTribe.c}`,
                      transform: `rotate(${u * 90}deg) scale(${1 - u * 0.3})`,
                      pointerEvents: 'none',
                      zIndex: 45
                    }}
                  >
                    ✦
                  </div>
                )
              })}

              {/* Particle Burst Dots */}
              {burst.map((b, idx) => (
                <i
                  key={idx}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '195px',
                    top: '250px',
                    width: `${b.s}px`,
                    height: `${b.s}px`,
                    margin: `${b.m}px`,
                    borderRadius: '50%',
                    background: b.c,
                    boxShadow: `0 0 12px ${b.c}`,
                    transform: `translate3d(${b.x}px, ${b.y}px, 0)`,
                    opacity: Number(b.o)
                  }}
                />
              ))}

              {/* Shockwave Expanding Ring */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '195px',
                  top: '250px',
                  width: `${waveSize.toFixed(0)}px`,
                  height: `${waveSize.toFixed(0)}px`,
                  margin: `${(-waveSize / 2).toFixed(0)}px 0 0 ${(-waveSize / 2).toFixed(0)}px`,
                  borderRadius: '50%',
                  border: `2px solid ${activeTribe.c}`,
                  opacity: Number(waveOpacity)
                }}
              />

              {/* Slow API Consultation status */}
              {phase === 'reveal' && !isResolved && time >= 2.9 && (
                <div
                  role="status"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '560px',
                    textAlign: 'center',
                    fontSize: '12px',
                    letterSpacing: '.32em',
                    color: '#C9A063'
                  }}
                >
                  CONSULTING THE ELEMENTS…
                </div>
              )}

              {/* SCREEN D: RESULT */}
              {isRev && time > 4.8 && selectedPlayer && (
                <div
                  role="status"
                  style={{
                    position: 'absolute',
                    left: '18px',
                    right: '18px',
                    top: '408px',
                    textAlign: 'center'
                  }}
                >
                  {/* Eyebrow */}
                  <div
                    style={{
                      fontSize: '11px',
                      letterSpacing: '.34em',
                      color: activeTribe.fg,
                      opacity: Number(ss(4.8, 5.3).toFixed(3)),
                      transform: `translateY(${(16 * (1 - ss(4.8, 5.3))).toFixed(1)}px)`
                    }}
                  >
                    {isAlreadyRevealed ? 'YOUR TRIBE' : 'THE ELEMENTS HAVE SPOKEN'}
                  </div>

                  {/* Welcome Name */}
                  <div
                    style={{
                      marginTop: '8px',
                      fontFamily: "'Cinzel', serif",
                      fontWeight: 900,
                      fontSize: '26px',
                      lineHeight: 1.12,
                      letterSpacing: '.08em',
                      color: '#F3D594',
                      textShadow: `0 0 40px ${activeTribe.c}`,
                      opacity: Number(ss(4.95, 5.5).toFixed(3)),
                      transform: `translateY(${(20 * (1 - ss(4.95, 5.5))).toFixed(1)}px)`
                    }}
                  >
                    WELCOME,<br />
                    {selectedPlayer.name.toUpperCase()}
                  </div>

                  {/* Traits & Line */}
                  <div
                    style={{
                      marginTop: '10px',
                      fontSize: '12px',
                      letterSpacing: '.22em',
                      color: activeTribe.fg,
                      opacity: Number(ss(5.2, 5.7).toFixed(3))
                    }}
                  >
                    {activeTribe.traits}
                  </div>
                  <p
                    style={{
                      margin: '6px auto 0',
                      maxWidth: '320px',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      color: '#D9CFC0',
                      opacity: Number(ss(5.2, 5.7).toFixed(3))
                    }}
                  >
                    Your {activeTribe.n.charAt(0) + activeTribe.n.slice(1).toLowerCase()} bracelet waits for you in the arena.
                  </p>

                  {/* Bracelet image */}
                  <img
                    src={activeTribe.br}
                    alt={`${activeTribe.n} tribe bracelet`}
                    style={{
                      display: 'block',
                      margin: '8px auto 0',
                      width: '150px',
                      height: 'auto',
                      opacity: Number(ss(5.35, 6.0).toFixed(3)),
                      transform: `translateY(${(40 * (1 - ss(5.35, 6.0))).toFixed(1)}px) scale(${(0.8 + 0.2 * ss(5.35, 6.0)).toFixed(3)})`,
                      filter: `drop-shadow(0 0 20px ${activeTribe.c})`
                    }}
                  />

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      justifyContent: 'center',
                      marginTop: '12px',
                      opacity: Number(ss(5.7, 6.2).toFixed(3))
                    }}
                  >
                    <button type="button" className="cta ctaf" onClick={() => returnToSearch(true)} style={{ flex: 1, maxWidth: '200px' }}>
                      NEXT ZAMPION
                    </button>
                    <button type="button" className="cta" onClick={replayReveal} style={{ flex: 'none' }}>
                      REPLAY
                    </button>
                  </div>

                  {/* Revealed timestamp if already known */}
                  {isAlreadyRevealed && selectedPlayer.revealedAt && (
                    <div style={{ marginTop: '10px', fontSize: '12px', letterSpacing: '.1em', color: '#8F8372', opacity: Number(ss(5.7, 6.2).toFixed(3)) }}>
                      {typeof selectedPlayer.revealedAt === 'string'
                        ? selectedPlayer.revealedAt.includes('T')
                          ? `Revealed · ${new Date(selectedPlayer.revealedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : selectedPlayer.revealedAt
                        : 'Revealed today'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Toast Alert */}
        {toastMessage && (
          <div
            className="toast"
            role="alert"
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
              transform: 'translateX(-50%)',
              zIndex: 25,
              width: 'min(340px, 90vw)',
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(224,90,70,.5)',
              background: 'rgba(40,10,8,.95)',
              color: '#F2B8AE',
              fontSize: '14px',
              textAlign: 'center'
            }}
          >
            {toastMessage}
          </div>
        )}
      </div>
    </>
  )
}
