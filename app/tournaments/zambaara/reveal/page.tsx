'use client'

import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import ThumbScanner from '@/components/tagcon/ThumbScanner'

type Tribe = 'lava' | 'rain' | 'mountain' | 'wind'

// Sound effects synthesizer using Web Audio API
class MysticSynth {
  ctx: AudioContext | null = null;
  osc1: OscillatorNode | null = null;
  osc2: OscillatorNode | null = null;
  lfo: OscillatorNode | null = null;
  lfoGain: GainNode | null = null;
  filter: BiquadFilterNode | null = null;
  gainNode: GainNode | null = null;

  constructor() {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      console.error("Web Audio initialization failed", e);
    }
  }

  start() {
    if (!this.ctx) return;
    try {
      this.osc1 = this.ctx.createOscillator();
      this.osc2 = this.ctx.createOscillator();
      this.lfo = this.ctx.createOscillator();
      this.lfoGain = this.ctx.createGain();
      this.filter = this.ctx.createBiquadFilter();
      this.gainNode = this.ctx.createGain();

      this.osc1.type = 'sine';
      this.osc2.type = 'sawtooth';
      this.lfo.type = 'triangle';

      this.osc1.frequency.setValueAtTime(140, this.ctx.currentTime);
      this.osc2.frequency.setValueAtTime(70, this.ctx.currentTime);
      this.lfo.frequency.setValueAtTime(4, this.ctx.currentTime);

      this.filter.type = 'lowpass';
      this.filter.Q.setValueAtTime(8, this.ctx.currentTime);
      this.filter.frequency.setValueAtTime(250, this.ctx.currentTime);

      this.lfoGain.gain.setValueAtTime(10, this.ctx.currentTime);
      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.osc1.frequency);

      this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 0.15);

      this.osc1.connect(this.filter);
      this.osc2.connect(this.filter);
      this.filter.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.osc1.start();
      this.osc2.start();
      this.lfo.start();
    } catch(e) {
      console.error("Error starting synth", e);
    }
  }

  updateProgress(progress: number) {
    if (!this.ctx || !this.osc1 || !this.osc2 || !this.lfo || !this.lfoGain || !this.filter || !this.gainNode) return;
    try {
      const now = this.ctx.currentTime;
      const t = progress / 100;

      const freq1 = 140 + (680 - 140) * Math.pow(t, 1.3);
      const freq2 = 70 + (170 - 70) * Math.pow(t, 1.3);

      this.osc1.frequency.setTargetAtTime(freq1, now, 0.05);
      this.osc2.frequency.setTargetAtTime(freq2, now, 0.05);

      const lfoSpeed = 4 + 20 * t;
      this.lfo.frequency.setTargetAtTime(lfoSpeed, now, 0.05);

      const lfoDepth = 10 + 40 * t;
      this.lfoGain.gain.setTargetAtTime(lfoDepth, now, 0.05);

      const filterFreq = 250 + (2200 - 250) * Math.pow(t, 1.2);
      this.filter.frequency.setTargetAtTime(filterFreq, now, 0.05);

      const volume = 0.12 + 0.08 * t;
      this.gainNode.gain.setTargetAtTime(volume, now, 0.05);
    } catch(e) {}
  }

  stop() {
    if (!this.ctx || !this.gainNode) return;
    try {
      const now = this.ctx.currentTime;
      this.gainNode.gain.linearRampToValueAtTime(0.001, now + 0.2);
      setTimeout(() => {
        try {
          this.osc1?.stop();
          this.osc2?.stop();
          this.lfo?.stop();
          this.ctx?.close();
        } catch(e) {}
      }, 250);
    } catch(e) {}
  }
}

// Sound for revealing burst
const playRevealBurstSound = (tribe: Tribe) => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 2.0;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(280, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(10, now + 1.0);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.28, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start();
    noise.stop(now + 1.0);

    if (tribe === 'lava') {
      const fireOsc = ctx.createOscillator();
      const fireGain = ctx.createGain();
      fireOsc.type = 'triangle';
      fireOsc.frequency.setValueAtTime(110, now);
      fireOsc.frequency.linearRampToValueAtTime(55, now + 1.8);
      
      fireGain.gain.setValueAtTime(0.15, now);
      fireGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      fireOsc.connect(fireGain);
      fireGain.connect(ctx.destination);
      fireOsc.start();
      fireOsc.stop(now + 1.8);

      const freqs = [164.81, 207.65, 246.94, 329.63];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(5, now);
        lfoGain.gain.setValueAtTime(2, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, now);
        filter.frequency.exponentialRampToValueAtTime(70, now + 2.0);

        gain.gain.setValueAtTime(0.06, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        lfo.start();
        osc.start();
        lfo.stop(now + 2.2);
        osc.stop(now + 2.2);
      });
    } 
    else if (tribe === 'rain') {
      const cascade = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      cascade.forEach((freq, idx) => {
        const delay = idx * 0.08;
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc2.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);
        osc2.frequency.setValueAtTime(freq * 2.01, now + delay);

        gain.gain.setValueAtTime(0.001, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.08, now + delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 1.2);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc2.start(now + delay);
        osc.stop(now + delay + 1.3);
        osc2.stop(now + delay + 1.3);
      });
    } 
    else if (tribe === 'mountain') {
      const lowChimes = [130.81, 196.00, 261.63, 392.00];
      lowChimes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        gain.gain.setValueAtTime(0.12, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + 2.6);
      });
    } 
    else if (tribe === 'wind') {
      const gusts = [440, 554.37, 659.25, 880, 1108.73];
      gusts.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 0.8, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + 1.5);

        gain.gain.setValueAtTime(0.05, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + 1.9);
      });
    }

    setTimeout(() => ctx.close(), 3000);
  } catch (e) {
    console.error("Audio burst failed", e);
  }
};

const playRevealingSound = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(8, now);
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 1.2);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 1.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
    noise.stop(now + 1.2);

    const pitches = [220, 275, 330, 440];
    pitches.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 2.2, now + 1.2);

      oscGain.gain.setValueAtTime(0.01, now);
      oscGain.gain.exponentialRampToValueAtTime(0.06, now + 1.0);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 1.2);
    });

    setTimeout(() => ctx.close(), 1500);
  } catch (e) {
    console.error("Failed to play revealing sound", e);
  }
};

const getTribeColorGlow = (t: Tribe) => {
  switch (t) {
    case 'lava': return 'rgba(239, 68, 68, 0.3)'
    case 'rain': return 'rgba(59, 130, 246, 0.3)'
    case 'mountain': return 'rgba(209, 160, 88, 0.25)'
    case 'wind': return 'rgba(16, 185, 129, 0.3)'
    default: return 'rgba(0, 0, 0, 0)'
  }
}

const getTribeDetails = (tribeName: Tribe | null) => {
  switch (tribeName) {
    case 'lava':
      return { 
        title: 'LAVA', 
        image: '/new_LAVA.png',
        traits: 'AGGRESSIVE ◈ CHAOTIC ◈ OFFENSIVE',
        color: '#ff4400',
        borderColor: '#882200'
      }
    case 'rain':
      return { 
        title: 'RAIN', 
        image: '/new_Rain.png',
        traits: 'ADAPTIVE ◈ COOLING ◈ TACTICAL',
        color: '#00aaff',
        borderColor: '#004488'
      }
    case 'mountain':
      return { 
        title: 'MOUNTAIN', 
        image: '/new_Mountain.png',
        traits: 'DEFENSIVE ◈ STABLE ◈ POWERFUL',
        color: '#eebb77',
        borderColor: '#664422'
      }
    case 'wind':
      return { 
        title: 'WIND', 
        image: '/new_Wind.png',
        traits: 'FAST ◈ UNPREDICTABLE ◈ DISRUPTIVE',
        color: '#00ff88',
        borderColor: '#006622'
      }
    default:
      return { title: '', image: '', traits: '', color: '', borderColor: '' }
  }
}

export default function RevealPage() {
  // Kiosk step: 'input' (enter seeker name & phone) -> 'scan' (thumb scanner) -> 'revealed'
  const [kioskStep, setKioskStep] = useState<'input' | 'scan' | 'revealed'>('input')
  const [inputName, setInputName] = useState('')
  const [inputMobile, setInputMobile] = useState('')
  const [validationError, setValidationError] = useState('')

  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle')
  const [tribe, setTribe] = useState<Tribe | null>(null)
  const [userData, setUserData] = useState<{name: string, number: string} | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [mounted, setMounted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const details = getTribeDetails(tribe)
  
  const titleRef = useRef<HTMLHeadingElement>(null)
  const inputCardRef = useRef<HTMLDivElement>(null)
  const scannerContainerRef = useRef<HTMLDivElement>(null)
  const revealContainerRef = useRef<HTMLDivElement>(null)
  const bgOverlayRef = useRef<HTMLDivElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const firefliesRef = useRef<HTMLDivElement>(null)
  const cardWrapperRef = useRef<HTMLDivElement>(null)
  const cardFrontRef = useRef<HTMLDivElement>(null)
  const plaqueRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null)

  const activeSynthRef = useRef<MysticSynth | null>(null)
  const lastVibrateRef = useRef(0)
  const prefetchedDataRef = useRef<any>(null)
  const fetchPromiseRef = useRef<Promise<any> | null>(null)

  useEffect(() => {
    setMounted(true)
    
    // Preload the card assets
    const imagePaths = ['/new_LAVA.png', '/new_Rain.png', '/new_Mountain.png', '/new_Wind.png']
    imagePaths.forEach((path) => {
      const img = new window.Image()
      img.src = path
    })

    const timer = setTimeout(() => {
      if (inputCardRef.current) {
        gsap.fromTo(
          inputCardRef.current,
          { opacity: 0, scale: 0.92, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power2.out', overwrite: 'auto' }
        )
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (firefliesRef.current) {
      const fireflies = firefliesRef.current.children
      Array.from(fireflies).forEach((ff) => {
        const floatX = Math.random() * 200 - 100
        const floatY = Math.random() * 200 - 100
        const duration = 5 + Math.random() * 6

        gsap.to(ff, {
          x: floatX,
          y: floatY,
          opacity: 'random(0.1, 0.85)',
          duration: duration,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        })
      })
    }
  }, [mounted])

  // Shared Animation: Proceed from Input Card to Thumb Scanner
  const handleProceedToScan = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    const trimmedName = inputName.trim()
    const trimmedMobile = inputMobile.trim().replace(/\D/g, '')

    if (!trimmedName) {
      setValidationError('Please enter your seeker name.')
      return
    }

    if (trimmedMobile.length < 7) {
      setValidationError('Please enter a valid phone number (at least 7 digits).')
      return
    }

    setUserData({ name: trimmedName, number: trimmedMobile })

    // Execute morphing shared element transition
    if (inputCardRef.current && scannerContainerRef.current) {
      gsap.to(inputCardRef.current, {
        opacity: 0,
        scale: 0.85,
        y: -25,
        duration: 0.45,
        ease: 'power2.in',
        onComplete: () => {
          setKioskStep('scan')
          setScanState('idle')
          gsap.fromTo(
            scannerContainerRef.current,
            { opacity: 0, scale: 0.82, y: 30 },
            { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.4)' }
          )
        }
      })
    } else {
      setKioskStep('scan')
      setScanState('idle')
    }
  }

  // Smooth back transition: Return to Input Step
  const handleBackToInput = () => {
    if (scannerContainerRef.current && inputCardRef.current) {
      gsap.to(scannerContainerRef.current, {
        opacity: 0,
        scale: 0.85,
        y: 20,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          setKioskStep('input')
          gsap.fromTo(
            inputCardRef.current,
            { opacity: 0, scale: 0.88, y: -20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power2.out' }
          )
        }
      })
    } else {
      setKioskStep('input')
    }
  }

  // Unblur and reveal card once scan completes
  useEffect(() => {
    if (scanState !== 'done' || !imageLoaded) return

    const wrapper = cardWrapperRef.current
    const front = cardFrontRef.current
    const plaque = plaqueRef.current
    const description = descriptionRef.current
    const bgOverlay = bgOverlayRef.current
    const scanner = scannerContainerRef.current

    if (wrapper && front && plaque && description) {
      gsap.killTweensOf([wrapper, front, plaque, description, bgOverlay, scanner])

      gsap.set(wrapper, {
        scale: 0.95,
        y: 0,
        opacity: 1
      })
      gsap.set(front, {
        opacity: 0,
        filter: 'blur(25px) drop-shadow(0 0 0px rgba(0,0,0,0))'
      })
      gsap.set(plaque, {
        scale: 0.8,
        opacity: 0,
        y: -20
      })
      gsap.set(description, {
        opacity: 0,
        y: 20
      })

      const tl = gsap.timeline({
        onComplete: () => {
          if (wrapper) {
            gsap.to(wrapper, {
              y: -6,
              duration: 2.5,
              yoyo: true,
              repeat: -1,
              ease: 'sine.inOut'
            })
          }
        }
      })

      if (bgOverlay) {
        tl.to(bgOverlay, {
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          duration: 1.5,
          ease: 'power2.out'
        }, 0)
      }

      tl.to(plaque, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'back.out(1.5)'
      }, 0.2)

      tl.to(front, {
        opacity: 1,
        filter: 'blur(0px) drop-shadow(0 15px 35px rgba(0,0,0,0.95))',
        duration: 1.4,
        ease: 'power2.out'
      }, 0.4)

      tl.to(wrapper, {
        scale: 1,
        duration: 1.2,
        ease: 'power2.out'
      }, 0.4)

      tl.to(description, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      }, 0.8)
    }
  }, [scanState, imageLoaded])

  const handleScanStart = () => {
    setScanState('scanning')
    lastVibrateRef.current = Date.now()

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15)
    }

    activeSynthRef.current = new MysticSynth()
    activeSynthRef.current.start()

    // Call /api/zambaara/reveal with the entered seeker name and phone number
    if (!prefetchedDataRef.current && !fetchPromiseRef.current) {
      const fetchPromise = fetch('/api/zambaara/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData?.name || inputName,
          mobile: userData?.number || inputMobile
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            prefetchedDataRef.current = data
            return data
          } else {
            return { success: false, error: data.error || 'The elemental runes reject you.' }
          }
        })
        .catch(err => {
          console.error('Prefetch error:', err)
          fetchPromiseRef.current = null
          return { success: false, error: err.message || 'Elemental interference detected.' }
        })
      fetchPromiseRef.current = fetchPromise
    }
  }

  const handleScanProgress = (progress: number) => {
    if (activeSynthRef.current) {
      activeSynthRef.current.updateProgress(progress)
    }

    if (progress > 0 && progress < 100) {
      if (typeof window !== 'undefined' && navigator.vibrate) {
        const now = Date.now()
        const interval = 350 - 295 * (progress / 100)
        
        if (now - lastVibrateRef.current >= interval) {
          const duration = 15 + 30 * (progress / 100)
          navigator.vibrate(duration)
          lastVibrateRef.current = now
        }
      }
    }
  }

  const handleScanCancel = () => {
    setScanState('idle')

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(0)
    }

    if (activeSynthRef.current) {
      activeSynthRef.current.stop()
      activeSynthRef.current = null
    }
  }

  const handleScanComplete = async () => {
    if (activeSynthRef.current) {
      activeSynthRef.current.stop()
      activeSynthRef.current = null
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([150, 100, 500])
    }

    try {
      let data = prefetchedDataRef.current
      if (!data && fetchPromiseRef.current) {
        data = await fetchPromiseRef.current
      } else if (!data) {
        const res = await fetch('/api/zambaara/reveal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userData?.name || inputName,
            mobile: userData?.number || inputMobile
          })
        })
        data = await res.json()
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Unable to summon tribe. Please retry.')
      }

      setTribe(data.tribe)
      setUserData({ name: data.name, number: data.number })
      
      playRevealingSound()
      setScanState('done')
      setKioskStep('revealed')

      setTimeout(() => {
        playRevealBurstSound(data.tribe)
      }, 1500)

      gsap.to(backgroundRef.current, {
        opacity: 0.45,
        backgroundColor: getTribeColorGlow(data.tribe),
        duration: 1.5,
        ease: 'sine.inOut'
      })

    } catch (err: any) {
      console.error('Failed to fetch tribe:', err)
      setErrorMessage(err.message || 'Connection lost to the spirits.')
      setScanState('error')
      prefetchedDataRef.current = null
      fetchPromiseRef.current = null
    }
  }

  // Reset Kiosk for next seeker
  const resetToIdle = () => {
    if (cardFrontRef.current) gsap.killTweensOf(cardFrontRef.current)
    if (cardWrapperRef.current) gsap.killTweensOf(cardWrapperRef.current)
    if (plaqueRef.current) gsap.killTweensOf(plaqueRef.current)
    if (descriptionRef.current) gsap.killTweensOf(descriptionRef.current)

    setScanState('idle')
    setTribe(null)
    setUserData(null)
    setInputName('')
    setInputMobile('')
    setValidationError('')
    setImageLoaded(false)
    setKioskStep('input')
    prefetchedDataRef.current = null
    fetchPromiseRef.current = null
    gsap.to(backgroundRef.current, { opacity: 0, duration: 0.8 })
    
    setTimeout(() => {
      if (inputCardRef.current) {
        gsap.fromTo(inputCardRef.current,
          { opacity: 0, scale: 0.92, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power2.out' }
        )
      }
    }, 50)
  }

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Montserrat:wght@500;700&display=swap" rel="stylesheet" />
      </Head>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes levitate {
          0% { transform: translateY(0px) rotateY(0deg); }
          50% { transform: translateY(-10px) rotateY(4deg); }
          100% { transform: translateY(0px) rotateY(0deg); }
        }
        .levitate-slow {
          animation: levitate 4.5s ease-in-out infinite;
        }
      `}} />

      <div 
        className="min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden bg-cover bg-center"
        style={{ 
          backgroundImage: "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url('/zambaara_bg.jpg')",
          fontFamily: "'Montserrat', sans-serif" 
        }}
      >
        {/* Dark Dimmer Overlay */}
        <div ref={bgOverlayRef} className="absolute inset-0 bg-black/60 pointer-events-none z-0"></div>

        {/* Dynamic Color Glow */}
        <div 
          ref={backgroundRef} 
          className="absolute inset-0 pointer-events-none transition-all duration-1000 z-0 opacity-0"
        ></div>

        {/* Floating Neon Fireflies */}
        <div ref={firefliesRef} className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {mounted && Array.from({ length: 22 }).map((_, index) => {
            const left = `${Math.random() * 100}%`
            const top = `${Math.random() * 100}%`
            const size = 3 + Math.random() * 6
            
            const palettes = [
              { bg: 'bg-[#ff4400]/90', glow: '0 0 12px #ff6622, 0 0 4px #fff' },
              { bg: 'bg-[#06b6d4]/90', glow: '0 0 12px #22d3ee, 0 0 4px #fff' },
              { bg: 'bg-[#d1a058]/95', glow: '0 0 12px #eebb77, 0 0 4px #fff' },
              { bg: 'bg-[#10b981]/90', glow: '0 0 12px #34d399, 0 0 4px #fff' }
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

        {/* Top Floating Navigation */}
        <div className="absolute top-6 left-6 z-30">
          <Link 
            href="/tournaments/zambaara" 
            className="text-white/60 hover:text-[#d1a058] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors bg-black/40 px-3.5 py-2 rounded-full border border-white/10 backdrop-blur"
          >
            <span>←</span>
            <span>Tournament Arena</span>
          </Link>
        </div>

        <div className={`relative z-20 flex flex-col items-center justify-center w-full ${kioskStep === 'revealed' ? 'max-w-2xl' : 'max-w-md'} h-[100dvh] sm:h-auto mx-auto p-4 sm:py-8`}>
          
          {/* STEP 1: Seeker Identity Input Form Card */}
          {kioskStep === 'input' && (
            <div 
              ref={inputCardRef}
              className="w-full bg-[#0d0f14]/90 border border-[#d1a058]/40 rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-md relative"
              style={{
                boxShadow: '0 0 25px rgba(209,160,88,0.15), 0 20px 50px rgba(0,0,0,0.85)'
              }}
            >
              <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 bg-[#d1a058]/10 border border-[#d1a058]/30 text-[#d1a058] rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                  Elemental Tournament Kiosk
                </span>
                <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#d1a058] tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>
                  Seeker Awakening
                </h1>
                <p className="text-white/60 text-xs sm:text-sm mt-1.5 font-sans">
                  Enter your details to summon the relic and reveal your tribe.
                </p>
              </div>

              <form onSubmit={handleProceedToScan} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1.5">
                    Seeker Name
                  </label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="Enter your name"
                    autoFocus
                    className="w-full bg-black/70 border border-[#d1a058]/30 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#d1a058] focus:ring-1 focus:ring-[#d1a058] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1.5">
                    Phone / Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={inputMobile}
                    onChange={(e) => setInputMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full bg-black/70 border border-[#d1a058]/30 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#d1a058] focus:ring-1 focus:ring-[#d1a058] font-mono transition-all"
                  />
                </div>

                {validationError && (
                  <p className="text-red-400 text-xs font-semibold bg-red-500/10 border border-red-500/20 px-3 py-2 rounded">
                    ⚠️ {validationError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#e7b875] via-[#d1a058] to-[#b3833d] hover:from-[#f5c889] hover:to-[#c6934a] text-black font-black uppercase tracking-widest text-xs rounded-lg shadow-[0_4px_20px_rgba(209,160,88,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Awaken Totem & Scan Thumb →
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Thumb Scanner (Shared animation morph) */}
          <div 
            ref={scannerContainerRef} 
            className={`flex flex-col items-center w-full transition-all duration-700 ${
              kioskStep === 'scan' ? 'block' : 'hidden'
            }`}
          >
            {/* Header text container */}
            <div className="flex flex-col items-center justify-center w-full mb-6 text-center">
              {scanState === 'idle' && (
                <>
                  <span className="text-[#d1a058] text-xs font-bold uppercase tracking-widest mb-1">
                    Seeker: {userData?.name} ({userData?.number})
                  </span>
                  <h1 ref={titleRef} className="text-2xl md:text-4xl text-center font-black tracking-[0.2em] text-[#d1a058] uppercase" style={{ fontFamily: "'Cinzel', serif", textShadow: '0 2px 15px rgba(0,0,0,0.9)' }}>
                    Touch & Hold Totem
                  </h1>
                  <p className="text-white/50 text-xs mt-1">
                    Hold your thumb firmly to initiate elemental scan
                  </p>
                </>
              )}
              {scanState === 'scanning' && (
                <h1 ref={titleRef} className="text-2xl md:text-4xl text-center font-black tracking-[0.3em] text-[#22d3ee] uppercase" style={{ fontFamily: "'Cinzel', serif", textShadow: '0 0 25px rgba(34,211,238,0.6)' }}>
                  Summoning Tribe...
                </h1>
              )}
              {scanState === 'error' && (
                <div className="text-center">
                  <h1 className="text-lg md:text-xl font-bold tracking-[0.15em] text-red-500 mb-4 uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
                    {errorMessage}
                  </h1>
                  <button 
                    onClick={() => setScanState('idle')}
                    className="bg-black/80 border border-red-500 text-red-500 px-6 py-2.5 tracking-widest text-xs hover:bg-red-500/10 transition-colors uppercase font-bold rounded-lg"
                  >
                    Retry Scan
                  </button>
                </div>
              )}
            </div>

            {/* Scanner Component */}
            <ThumbScanner 
              onScanStart={handleScanStart} 
              onScanComplete={handleScanComplete} 
              onScanCancel={handleScanCancel} 
              onScanProgress={handleScanProgress}
            />

            <div 
              className="mt-8 px-6 py-2 bg-black/80 rounded-full flex flex-col items-center gap-1 pointer-events-none select-none"
              style={{
                border: '1.5px solid rgba(209, 160, 88, 0.45)',
                boxShadow: '0 0 15px rgba(209, 160, 88, 0.25), inset 0 0 5px rgba(209, 160, 88, 0.15)'
              }}
            >
              <span className="text-[#d1a058] text-[12px] font-black tracking-[0.3em] uppercase drop-shadow-[0_0_8px_rgba(209,160,88,0.7)] animate-pulse">
                HOLD THUMB DOWN
              </span>
              <span className="text-white/50 text-[9px] tracking-[0.2em] uppercase font-bold">
                100% TO REVEAL
              </span>
            </div>

            {/* Edit Seeker Details Back Link */}
            {scanState !== 'scanning' && (
              <button
                onClick={handleBackToInput}
                className="mt-5 text-white/40 hover:text-[#d1a058] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                ✏️ Edit Name or Phone
              </button>
            )}
          </div>

          {/* STEP 3: Elemental Tribe Card Reveal */}
          <div 
            ref={revealContainerRef} 
            className={`flex flex-col justify-center items-center w-full pt-4 transition-all duration-1000 ${
              kioskStep === 'revealed' && scanState === 'done' 
                ? 'opacity-100 scale-100 pointer-events-auto relative' 
                : 'opacity-0 scale-95 pointer-events-none absolute'
            }`}
            style={{ minHeight: kioskStep === 'revealed' ? '85vh' : '0px' }}
          >
            {/* Name Plaque */}
            <div 
              ref={plaqueRef}
              className="z-20 flex flex-col items-center pointer-events-none mb-6 max-w-xs"
            >
              <div 
                className="px-6 py-2.5 bg-black/95 border-2 border-[#d1a058] rounded-md text-center shadow-2xl w-auto max-w-[280px]"
                style={{
                  boxShadow: '0 8px 25px rgba(0,0,0,0.95), inset 0 0 10px rgba(209,160,88,0.4)'
                }}
              >
                <p className="text-[#d1a058] text-[16px] sm:text-[18px] font-black tracking-widest uppercase truncate px-2" style={{ fontFamily: "'Cinzel', serif" }}>
                  {userData?.name}
                </p>
              </div>
            </div>
            
            {/* Image Card Display */}
            <div 
              ref={cardWrapperRef}
              className="relative w-[280px] sm:w-[320px] h-[410px] sm:h-[470px] z-10 mb-3" 
            >
              <div 
                ref={cardFrontRef}
                className="absolute inset-0 w-full h-full z-10 opacity-0"
                style={{ filter: 'blur(25px)' }}
              >
                {details.image && (
                  <Image
                    src={details.image}
                    alt={details.title}
                    fill
                    className="object-contain filter drop-shadow-[0_12px_35px_rgba(0,0,0,0.95)]"
                    sizes="(max-width: 640px) 280px, 320px"
                    priority
                    onLoad={() => setImageLoaded(true)}
                  />
                )}
              </div>
            </div>

            {/* Instruction description panel */}
            <div 
              ref={descriptionRef}
              className="z-10 w-[540px] max-w-[95%] sm:w-[640px] h-28 sm:h-36 relative mt-[-12px] mb-4 pointer-events-none"
            >
              <Image
                src="/new_description.png"
                alt="Show this card at the deck counter to receive your custom band"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 z-20">
              <button 
                onClick={resetToIdle}
                className="group relative px-8 py-3.5 overflow-hidden rounded-full border border-white/20 bg-black/85 hover:border-white/50 transition-colors shadow-2xl cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative font-bold tracking-[0.25em] uppercase text-[11px] transition-colors" style={{ color: details.color }}>
                  Next Seeker Registration →
                </span>
              </button>

              <Link
                href="/tournaments/zambaara"
                className="px-6 py-3.5 rounded-full border border-[#d1a058]/40 bg-[#d1a058]/10 text-[#d1a058] hover:bg-[#d1a058]/20 transition-all font-bold tracking-[0.2em] uppercase text-[10px] text-center"
              >
                View Tournament Arena
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
