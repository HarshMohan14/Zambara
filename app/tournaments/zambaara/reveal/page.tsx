'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore'
import {
  CUSTOM_PLAYERS_COLLECTION,
  CUSTOM_TOURNAMENTS_COLLECTION,
  CustomPlayer,
  CustomTournament
} from '@/lib/zambaara-custom'
import TribeRevealMobile, { RevealPlayer, Tribe } from '@/components/tribe-reveal/TribeRevealMobile'

// Web Audio API synthesizer for channeling hold
class MysticSynth {
  ctx: AudioContext | null = null
  osc1: OscillatorNode | null = null
  osc2: OscillatorNode | null = null
  lfo: OscillatorNode | null = null
  lfoGain: GainNode | null = null
  filter: BiquadFilterNode | null = null
  gainNode: GainNode | null = null

  constructor() {
    if (typeof window === 'undefined') return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) this.ctx = new AudioCtx()
    } catch (e) {
      console.error('Web Audio init failed', e)
    }
  }

  start() {
    if (!this.ctx) return
    try {
      this.osc1 = this.ctx.createOscillator()
      this.osc2 = this.ctx.createOscillator()
      this.lfo = this.ctx.createOscillator()
      this.lfoGain = this.ctx.createGain()
      this.filter = this.ctx.createBiquadFilter()
      this.gainNode = this.ctx.createGain()

      this.osc1.type = 'sine'
      this.osc2.type = 'sawtooth'
      this.lfo.type = 'triangle'

      this.osc1.frequency.setValueAtTime(140, this.ctx.currentTime)
      this.osc2.frequency.setValueAtTime(70, this.ctx.currentTime)
      this.lfo.frequency.setValueAtTime(4, this.ctx.currentTime)

      this.filter.type = 'lowpass'
      this.filter.Q.setValueAtTime(8, this.ctx.currentTime)
      this.filter.frequency.setValueAtTime(250, this.ctx.currentTime)

      this.lfoGain.gain.setValueAtTime(10, this.ctx.currentTime)
      this.lfo.connect(this.lfoGain)
      this.lfoGain.connect(this.osc1.frequency)

      this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime)
      this.gainNode.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 0.15)

      this.osc1.connect(this.filter)
      this.osc2.connect(this.filter)
      this.filter.connect(this.gainNode)
      this.gainNode.connect(this.ctx.destination)

      this.osc1.start()
      this.osc2.start()
      this.lfo.start()
    } catch (e) {
      console.error('Error starting synth', e)
    }
  }

  updateProgress(progress: number) {
    if (!this.ctx || !this.osc1 || !this.osc2 || !this.lfo || !this.lfoGain || !this.filter || !this.gainNode) return
    try {
      const now = this.ctx.currentTime
      const t = progress / 100

      const freq1 = 140 + (680 - 140) * Math.pow(t, 1.3)
      const freq2 = 70 + (170 - 70) * Math.pow(t, 1.3)

      this.osc1.frequency.setTargetAtTime(freq1, now, 0.05)
      this.osc2.frequency.setTargetAtTime(freq2, now, 0.05)

      const lfoSpeed = 4 + 20 * t
      this.lfo.frequency.setTargetAtTime(lfoSpeed, now, 0.05)

      const lfoDepth = 10 + 40 * t
      this.lfoGain.gain.setTargetAtTime(lfoDepth, now, 0.05)

      const filterFreq = 250 + (2200 - 250) * Math.pow(t, 1.2)
      this.filter.frequency.setTargetAtTime(filterFreq, now, 0.05)

      const volume = 0.12 + 0.08 * t
      this.gainNode.gain.setTargetAtTime(volume, now, 0.05)
    } catch (e) {}
  }

  stop() {
    if (!this.ctx || !this.gainNode) return
    try {
      const now = this.ctx.currentTime
      this.gainNode.gain.linearRampToValueAtTime(0.001, now + 0.2)
      setTimeout(() => {
        try {
          this.osc1?.stop()
          this.osc2?.stop()
          this.lfo?.stop()
          this.ctx?.close()
        } catch (e) {}
      }, 250)
    } catch (e) {}
  }
}

// Elemental sound burst on card reveal
const playRevealBurstSound = (tribe: Tribe) => {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    const bufferSize = ctx.sampleRate * 2.0
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = 'lowpass'
    noiseFilter.frequency.setValueAtTime(280, now)
    noiseFilter.frequency.exponentialRampToValueAtTime(10, now + 1.0)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.28, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0)

    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start()
    noise.stop(now + 1.0)

    if (tribe === 'lava') {
      const fireOsc = ctx.createOscillator()
      const fireGain = ctx.createGain()
      fireOsc.type = 'triangle'
      fireOsc.frequency.setValueAtTime(110, now)
      fireOsc.frequency.linearRampToValueAtTime(55, now + 1.8)
      fireGain.gain.setValueAtTime(0.15, now)
      fireGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8)
      fireOsc.connect(fireGain)
      fireGain.connect(ctx.destination)
      fireOsc.start()
      fireOsc.stop(now + 1.8)
    } else if (tribe === 'rain') {
      const cascade = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]
      cascade.forEach((freq, idx) => {
        const delay = idx * 0.08
        const osc = ctx.createOscillator()
        const oscGain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + delay)
        oscGain.gain.setValueAtTime(0.001, now + delay)
        oscGain.gain.exponentialRampToValueAtTime(0.08, now + delay + 0.03)
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 1.2)
        osc.connect(oscGain)
        oscGain.connect(ctx.destination)
        osc.start(now + delay)
        osc.stop(now + delay + 1.3)
      })
    } else if (tribe === 'mountain') {
      const lowChimes = [130.81, 196.0, 261.63, 392.0]
      lowChimes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const oscGain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.04)
        oscGain.gain.setValueAtTime(0.12, now + idx * 0.04)
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5)
        osc.connect(oscGain)
        oscGain.connect(ctx.destination)
        osc.start(now + idx * 0.04)
        osc.stop(now + 2.6)
      })
    } else if (tribe === 'wind') {
      const gusts = [440, 554.37, 659.25, 880, 1108.73]
      gusts.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const oscGain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq * 0.8, now + idx * 0.06)
        osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + 1.5)
        oscGain.gain.setValueAtTime(0.05, now + idx * 0.06)
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8)
        osc.connect(oscGain)
        oscGain.connect(ctx.destination)
        osc.start(now + idx * 0.06)
        osc.stop(now + 1.9)
      })
    }

    setTimeout(() => {
      try {
        ctx.close()
      } catch (e) {}
    }, 3000)
  } catch (e) {
    console.error('Audio burst failed', e)
  }
}

export default function ZambaaraRevealPage() {
  const router = useRouter()
  const [tournaments, setTournaments] = useState<CustomTournament[]>([])
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('')
  const [customPlayers, setCustomPlayers] = useState<CustomPlayer[]>([])
  const [generalUsers, setGeneralUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const activeSynthRef = useRef<MysticSynth | null>(null)

  // 1. Listen to custom tournaments
  useEffect(() => {
    const q = query(collection(db, CUSTOM_TOURNAMENTS_COLLECTION), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      snap => {
        const docs = snap.docs.map(d => ({ id: d.id, rounds: [], ...d.data() })) as unknown as CustomTournament[]
        setTournaments(docs)
        if (docs.length > 0) {
          setSelectedTournamentId(prev => (prev && docs.some(d => d.id === prev) ? prev : docs[0].id))
        }
      },
      err => {
        console.error('Error fetching custom tournaments:', err)
        setLoadError('Failed to connect to tournament records.')
      }
    )
    return () => unsubscribe()
  }, [])

  // 2. Listen to custom tournament players for the active tournament
  useEffect(() => {
    if (!selectedTournamentId) return
    const q = query(collection(db, CUSTOM_PLAYERS_COLLECTION), where('tournamentId', '==', selectedTournamentId))
    const unsubscribe = onSnapshot(
      q,
      snap => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as CustomPlayer[]
        setCustomPlayers(docs)
        setLoading(false)
      },
      err => {
        console.error('Error loading custom tournament players:', err)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [selectedTournamentId])

  // 3. Also listen to zambaara_users so general registrations are accessible as well
  useEffect(() => {
    const q = query(collection(db, 'zambaara_users'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      snap => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setGeneralUsers(docs)
        setLoading(false)
      },
      () => setLoading(false)
    )
    return () => unsubscribe()
  }, [])

  // Combine players into a unified RevealPlayer list
  const combinedPlayers = useMemo<RevealPlayer[]>(() => {
    const list: RevealPlayer[] = []
    const seenMobiles = new Set<string>()

    // Priority 1: Custom tournament players
    customPlayers.forEach(cp => {
      const cleanMobile = String(cp.mobile || '').replace(/\D/g, '')
      if (cleanMobile) seenMobiles.add(cleanMobile)
      list.push({
        id: cp.id,
        name: cp.name,
        mobile: cp.mobile,
        tribe: (cp.tribe as Tribe) || null,
        revealedAt: cp.revealedAt || null
      })
    })

    // Priority 2: General users not already in custom tournament
    generalUsers.forEach(gu => {
      const mob = String(gu.mobile || gu.number || '').replace(/\D/g, '')
      if (!seenMobiles.has(mob) && gu.name) {
        list.push({
          id: gu.id,
          name: gu.name,
          mobile: gu.mobile || gu.number || '',
          tribe: (gu.tribe as Tribe) || null,
          revealedAt: gu.revealedAt || null
        })
      }
    })

    return list
  }, [customPlayers, generalUsers])

  // Sound hooks for the 1.6s channelling hold & reveal burst
  const soundHooks = useMemo(() => {
    return {
      start: () => {
        activeSynthRef.current = new MysticSynth()
        activeSynthRef.current.start()
      },
      update: (p: number) => {
        if (activeSynthRef.current) activeSynthRef.current.updateProgress(p)
      },
      stop: () => {
        if (activeSynthRef.current) {
          activeSynthRef.current.stop()
          activeSynthRef.current = null
        }
      },
      burst: (t: Tribe) => {
        playRevealBurstSound(t)
      }
    }
  }, [])

  // Reveal API invocation
  const handleReveal = useCallback(async (player: RevealPlayer): Promise<{ tribe: Tribe }> => {
    // Check if player is from custom tournament
    const isCustom = customPlayers.some(cp => cp.id === player.id)
    const payload = isCustom
      ? { customPlayerId: player.id }
      : { name: player.name, mobile: player.mobile }

    const res = await fetch('/api/zambaara/reveal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to summon tribe.')
    }

    const assignedTribe = data.tribe as Tribe
    return { tribe: assignedTribe }
  }, [customPlayers])

  const activeTourney = tournaments.find(t => t.id === selectedTournamentId)
  const eventTitle = activeTourney ? activeTourney.name.toUpperCase() : 'ZAMBAARA TOURNAMENT'

  return (
    <>
      <Head>
        <title>Zambaara Tribe Reveal — Mobile Kiosk</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Saira:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <TribeRevealMobile
        eventName={eventTitle}
        players={combinedPlayers}
        loading={loading}
        error={loadError}
        onRetry={() => {
          setLoading(true)
          setLoadError(null)
          setTimeout(() => setLoading(false), 900)
        }}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onReveal={handleReveal}
        onRevealSound={soundHooks}
        onBackToArena={() => router.push('/tournaments/zambaara')}
      />
    </>
  )
}
