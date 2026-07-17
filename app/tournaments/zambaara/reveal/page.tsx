'use client'

import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Image from 'next/image'
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
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (this.gainNode) {
        this.gainNode.gain.cancelScheduledValues(now);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
        this.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      }
      setTimeout(() => {
        try {
          this.osc1?.stop();
          this.osc2?.stop();
          this.lfo?.stop();
          this.ctx?.close();
        } catch(e) {}
      }, 150);
    } catch(e) {}
  }
}

const playRevealBurstSound = (tribe: Tribe) => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    const boomOsc = ctx.createOscillator();
    const boomGain = ctx.createGain();
    
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(55, now);
    boomOsc.frequency.exponentialRampToValueAtTime(20, now + 1.2);
    
    boomGain.gain.setValueAtTime(0.35, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    
    boomOsc.connect(boomGain);
    boomGain.connect(ctx.destination);
    boomOsc.start();
    boomOsc.stop(now + 1.2);

    const bufferSize = ctx.sampleRate * 1.5;
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
        filter.frequency.setValueAtTime(200, now);
        filter.Q.setValueAtTime(4, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 2.6);
      });
    } 
    else if (tribe === 'wind') {
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.Q.setValueAtTime(15, now);
      windFilter.frequency.setValueAtTime(800, now);
      windFilter.frequency.exponentialRampToValueAtTime(2200, now + 1.2);

      const windNoiseGain = ctx.createGain();
      windNoiseGain.gain.setValueAtTime(0.12, now);
      windNoiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      const windNoise = ctx.createBufferSource();
      windNoise.buffer = buffer;
      windNoise.connect(windFilter);
      windFilter.connect(windNoiseGain);
      windNoiseGain.connect(ctx.destination);
      windNoise.start();
      windNoise.stop(now + 1.8);

      const windFreqs = [659.25, 739.99, 830.61, 987.77, 1109.73];
      windFreqs.forEach((freq, idx) => {
        const delay = idx * 0.05;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        
        const tremolo = ctx.createOscillator();
        const tremoloGain = ctx.createGain();
        tremolo.frequency.setValueAtTime(8, now);
        tremoloGain.gain.setValueAtTime(0.02, now);
        tremolo.connect(tremoloGain);
        tremoloGain.connect(gain.gain);

        gain.gain.setValueAtTime(0.001, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.05, now + delay + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 1.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        tremolo.start();
        osc.start(now + delay);
        tremolo.stop(now + delay + 1.8);
        osc.stop(now + delay + 1.8);
      });
    }

    setTimeout(() => ctx.close(), 3000);
  } catch (e) {
    console.error("Web Audio burst sound failed", e);
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
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle')
  const [tribe, setTribe] = useState<Tribe | null>(null)
  const [userData, setUserData] = useState<{name: string, number: string} | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [mounted, setMounted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const details = getTribeDetails(tribe)
  
  const titleRef = useRef<HTMLHeadingElement>(null)
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
      const targets = [titleRef.current, scannerContainerRef.current].filter(Boolean)
      if (targets.length > 0) {
        gsap.fromTo(
          targets,
          { opacity: 0, scale: 0.92 },
          { opacity: 1, scale: 1, duration: 1.5, stagger: 0.2, ease: 'power2.out', overwrite: 'auto' }
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

      if (scanner) {
        tl.to(scanner, {
          opacity: 0,
          scale: 0.9,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => {
            scanner.style.display = 'none'
          }
        }, 0)
      }

      tl.to(front, {
        opacity: 1,
        duration: 0.5,
        ease: 'power1.out'
      }, 0.1)

      const filterVal = { blur: 25, glow: 0 }
      tl.to(filterVal, {
        blur: 0,
        glow: 8,
        duration: 4.2,
        ease: 'power1.inOut',
        onUpdate: () => {
          if (front) {
            front.style.filter = `blur(${filterVal.blur}px) drop-shadow(0 0 ${filterVal.glow}px ${details.color || '#d1a058'}bb)`
          }
        }
      }, 0.1)

      tl.to(plaque, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'back.out(1.5)'
      }, 1.2)

      tl.to(description, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      }, 1.2)
    }
  }, [scanState, imageLoaded, details.color])

  const handleScanStart = () => {
    setScanState('scanning')
    gsap.to(titleRef.current, {
      opacity: 0.3,
      scale: 0.96,
      duration: 0.8
    })

    lastVibrateRef.current = Date.now()

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15)
    }

    activeSynthRef.current = new MysticSynth()
    activeSynthRef.current.start()

    if (!prefetchedDataRef.current && !fetchPromiseRef.current) {
      const fetchPromise = fetch('/api/zambaara/reveal', {
        method: 'POST'
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
    gsap.to(titleRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.8
    })

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
        const res = await fetch('/api/zambaara/reveal', { method: 'POST' })
        data = await res.json()
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'No pending seekers waiting in the queue.')
      }

      setTribe(data.tribe)
      setUserData({ name: data.name, number: data.number })
      
      playRevealingSound()
      setScanState('done')

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
      gsap.to(titleRef.current, { opacity: 1, scale: 1, duration: 0.8 })
    }
  }

  const resetToIdle = () => {
    if (cardFrontRef.current) gsap.killTweensOf(cardFrontRef.current)
    if (cardWrapperRef.current) gsap.killTweensOf(cardWrapperRef.current)
    if (plaqueRef.current) gsap.killTweensOf(plaqueRef.current)
    if (descriptionRef.current) gsap.killTweensOf(descriptionRef.current)
    if (scannerContainerRef.current) {
      gsap.killTweensOf(scannerContainerRef.current)
      scannerContainerRef.current.style.display = 'flex'
    }
    if (bgOverlayRef.current) {
      gsap.killTweensOf(bgOverlayRef.current)
      gsap.to(bgOverlayRef.current, {
        backgroundColor: 'rgba(0, 0, 0, 0.60)',
        duration: 0.6,
        ease: 'power2.out'
      })
    }

    setScanState('idle')
    setTribe(null)
    setUserData(null)
    setImageLoaded(false)
    prefetchedDataRef.current = null
    fetchPromiseRef.current = null
    gsap.to(backgroundRef.current, { opacity: 0, duration: 0.8 })
    
    setTimeout(() => {
      const targets = [titleRef.current, scannerContainerRef.current].filter(Boolean)
      if (targets.length > 0) {
        gsap.fromTo(targets, 
          { opacity: 0, scale: 0.92 },
          { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out', overwrite: 'auto' }
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
      `}} />

      <div 
        className="min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden bg-cover bg-center"
        style={{ 
          backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url('/zambaara_bg.jpg')",
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
          {mounted && Array.from({ length: 20 }).map((_, index) => {
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

        <div className={`relative z-20 flex flex-col items-center justify-center w-full ${scanState === 'done' ? 'max-w-2xl' : 'max-w-md'} h-[100dvh] sm:h-auto mx-auto p-4 sm:py-8`}>
          
          {/* Header text container */}
          <div className="h-28 flex flex-col items-center justify-center w-full mb-8">
            {scanState === 'idle' && (
              <h1 ref={titleRef} className="text-3xl md:text-5xl text-center font-black tracking-[0.2em] text-[#d1a058] uppercase" style={{ fontFamily: "'Cinzel', serif", textShadow: '0 2px 15px rgba(0,0,0,0.9)' }}>
                Tribe Summoning
              </h1>
            )}
            {scanState === 'scanning' && (
              <h1 ref={titleRef} className="text-2xl md:text-4xl text-center font-black tracking-[0.3em] text-[#22d3ee] uppercase" style={{ fontFamily: "'Cinzel', serif", textShadow: '0 0 25px rgba(34,211,238,0.6)' }}>
                Summoning...
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
                  Back
                </button>
              </div>
            )}
          </div>

          {/* Scanner */}
          <div 
            ref={scannerContainerRef} 
            className={`flex flex-col items-center transition-all duration-700 ${
              scanState === 'done' 
                ? 'opacity-0 scale-90 pointer-events-none absolute' 
                : 'opacity-100 scale-100 relative'
            }`}
          >
            <ThumbScanner 
              onScanStart={handleScanStart} 
              onScanComplete={handleScanComplete} 
              onScanCancel={handleScanCancel} 
              onScanProgress={handleScanProgress}
            />
            <div 
              className="mt-10 px-6 py-2.5 bg-black/80 rounded-full flex flex-col items-center gap-1.5 pointer-events-none select-none"
              style={{
                border: '1.5px solid rgba(209, 160, 88, 0.45)',
                boxShadow: '0 0 15px rgba(209, 160, 88, 0.25), inset 0 0 5px rgba(209, 160, 88, 0.15)'
              }}
            >
              <span className="text-[#d1a058] text-[13px] font-black tracking-[0.3em] uppercase drop-shadow-[0_0_8px_rgba(209,160,88,0.7)] animate-pulse">
                SCAN THUMB
              </span>
              <span className="text-white/50 text-[10px] tracking-[0.2em] uppercase font-bold">
                TO SUMMON TRIBE
              </span>
            </div>
          </div>

          {/* Card Reveal */}
          <div 
            ref={revealContainerRef} 
            className={`flex flex-col justify-center items-center w-full pt-4 transition-all duration-1000 ${
              scanState === 'done' 
                ? 'opacity-100 scale-100 pointer-events-auto relative' 
                : 'opacity-0 scale-95 pointer-events-none absolute'
            }`}
            style={{ minHeight: scanState === 'done' ? '85vh' : '0px' }}
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

            {/* Reset Kiosk Button */}
            <button 
              onClick={resetToIdle}
              className="group relative px-10 py-3.5 overflow-hidden rounded-full border border-white/20 bg-black/85 hover:border-white/50 transition-colors shadow-2xl z-20"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative font-bold tracking-[0.25em] uppercase text-[11px] transition-colors" style={{ color: details.color }}>
                Next seeker
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
