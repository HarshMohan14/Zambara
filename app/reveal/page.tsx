'use client'

import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import gsap from 'gsap'
import ThumbScanner from '@/components/tagcon/ThumbScanner'

type Tribe = 'lava' | 'rain' | 'mountain' | 'wind'

// Mystical sound effects synthesizer using Web Audio API
class MysticSynth {
  ctx: AudioContext | null = null;
  osc1: OscillatorNode | null = null; // Main carrier
  osc2: OscillatorNode | null = null; // Sub harmonic
  lfo: OscillatorNode | null = null; // wobble modulator
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

      // Pitch initial settings (Low humming energy)
      this.osc1.frequency.setValueAtTime(140, this.ctx.currentTime);
      this.osc2.frequency.setValueAtTime(70, this.ctx.currentTime);
      this.lfo.frequency.setValueAtTime(4, this.ctx.currentTime); // LFO rate 4Hz

      // Filter settings
      this.filter.type = 'lowpass';
      this.filter.Q.setValueAtTime(8, this.ctx.currentTime);
      this.filter.frequency.setValueAtTime(250, this.ctx.currentTime);

      // LFO modulation routing: LFO -> LFO Gain -> Osc1 Frequency
      this.lfoGain.gain.setValueAtTime(10, this.ctx.currentTime);
      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.osc1.frequency);

      // Volume settings (starts silent and sweeps up)
      this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 0.15);

      // Node connections
      this.osc1.connect(this.filter);
      this.osc2.connect(this.filter);
      this.filter.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      // Start oscillators
      this.osc1.start();
      this.osc2.start();
      this.lfo.start();
    } catch(e) {
      console.error("Error starting synth", e);
    }
  }

  updateProgress(progress: number) { // 0 to 100
    if (!this.ctx || !this.osc1 || !this.osc2 || !this.lfo || !this.lfoGain || !this.filter || !this.gainNode) return;
    try {
      const now = this.ctx.currentTime;
      const t = progress / 100;

      // Ascending carrier pitch: 140Hz to 680Hz
      const freq1 = 140 + (680 - 140) * Math.pow(t, 1.3);
      // Sub pitch: 70Hz to 170Hz
      const freq2 = 70 + (170 - 70) * Math.pow(t, 1.3);

      this.osc1.frequency.setTargetAtTime(freq1, now, 0.05);
      this.osc2.frequency.setTargetAtTime(freq2, now, 0.05);

      // LFO frequency increases (modulating pitch faster as it charges)
      const lfoSpeed = 4 + 20 * t; // 4Hz to 24Hz wobble
      this.lfo.frequency.setTargetAtTime(lfoSpeed, now, 0.05);

      // LFO amplitude increases (wobble gets wider)
      const lfoDepth = 10 + 40 * t;
      this.lfoGain.gain.setTargetAtTime(lfoDepth, now, 0.05);

      // Lowpass sweeps upward to open the brightness
      const filterFreq = 250 + (2200 - 250) * Math.pow(t, 1.2);
      this.filter.frequency.setTargetAtTime(filterFreq, now, 0.05);

      // Volume swells slightly as progress approaches 100%
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
    
    // 1. Cinematic low bass boom sweep (55Hz -> 20Hz)
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

    // 2. High-impact energy wave noise burst
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

    // 3. Tribe-Specific Element Soundscapes:
    if (tribe === 'lava') {
      // Lava: Volcanic rumbling and warm, epic dramatic brass chord (E major root triad)
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

      const freqs = [164.81, 207.65, 246.94, 329.63]; // E3, G#3, B3, E4
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        
        // Pitch wobble for ancient fire warmth
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(5, now); // 5Hz wobble
        lfoGain.gain.setValueAtTime(2, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, now);
        filter.frequency.exponentialRampToValueAtTime(70, now + 2.0);

        gain.gain.setValueAtTime(0.06, now + idx * 0.05); // staggered enter
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
      // Rain: Shimmering drop cascade and cascading water delay-line chimes (C major 7 pentatonic cascade)
      const cascade = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      cascade.forEach((freq, idx) => {
        const delay = idx * 0.08;
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc2.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);
        osc2.frequency.setValueAtTime(freq * 2.01, now + delay); // harmonic sparkle

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
      // Mountain: Deep stone boom, thick ground fifth chord (C3, G3, C4, G4 perfect fifths)
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
      // Wind: Swirling high-pass wind noise sweep + ethereal whistling bells
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
        
        // Tremolo for fluttering chimes
        const tremolo = ctx.createOscillator();
        const tremoloGain = ctx.createGain();
        tremolo.frequency.setValueAtTime(8, now); // 8Hz flutter
        tremoloGain.gain.setValueAtTime(0.02, now);
        tremolo.connect(tremoloGain);
        tremoloGain.connect(gain.gain); // modulate volume!

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

    // 1. Rising wind vortex (noise with sweeping bandpass filter)
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

    // 2. Swirling oscillator chord sweep (rising pitch)
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

export default function RevealPage() {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'revealing' | 'done' | 'error'>('idle')
  const [tribe, setTribe] = useState<Tribe | null>(null)
  const [userData, setUserData] = useState<{name: string, number: string} | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [showFlash, setShowFlash] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const titleRef = useRef<HTMLHeadingElement>(null)
  const scannerContainerRef = useRef<HTMLDivElement>(null)
  const revealContainerRef = useRef<HTMLDivElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const firefliesRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)

  const activeSynthRef = useRef<MysticSynth | null>(null)
  const lastVibrateRef = useRef(0)
  const prefetchedDataRef = useRef<any>(null)
  const fetchPromiseRef = useRef<Promise<any> | null>(null)

  const [dismissOverlay, setDismissOverlay] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleAwaken = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([80, 50, 150])
    }
    
    // Play a nice wake sound
    playRevealingSound()

    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        scale: 1.15,
        duration: 1.2,
        ease: 'power3.inOut',
        onComplete: () => {
          setDismissOverlay(true)
          // Entrance animations for the main elements once awakened
          const targets = [titleRef.current, scannerContainerRef.current].filter(Boolean)
          if (targets.length > 0) {
            gsap.fromTo(
              targets,
              { opacity: 0, scale: 0.92 },
              { opacity: 1, scale: 1, duration: 1.8, stagger: 0.25, ease: 'power3.out', overwrite: 'auto' }
            )
          }
        }
      })
    } else {
      setDismissOverlay(true)
    }
  }

  useEffect(() => {
    setMounted(true)
    
    // Preload the 4 massive card image assets to avoid browser decode lag on mount
    const imagePaths = ['/l.png', '/m.png', '/r.png', '/w.png']
    imagePaths.forEach((path) => {
      const img = new window.Image()
      img.src = path
    })
  }, [])

  useEffect(() => {
    if (!mounted) return
    // Fireflies floating animation
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

  const handleScanStart = () => {
    setScanState('scanning')
    gsap.to(titleRef.current, {
      opacity: 0.3,
      scale: 0.96,
      duration: 0.8
    })

    lastVibrateRef.current = Date.now()

    // Trigger synchronous user gesture haptic activation to unlock browser vibration limits
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10)
    }

    // Play charge synthesizer sound
    activeSynthRef.current = new MysticSynth()
    activeSynthRef.current.start()

    // Start prefetching if not already fetched/fetching
    if (!prefetchedDataRef.current && !fetchPromiseRef.current) {
      const fetchPromise = fetch('/api/tagcon/reveal', {
        method: 'POST'
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            prefetchedDataRef.current = data
          } else {
            throw new Error(data.error || 'The elements reject you.')
          }
          return data
        })
        .catch(err => {
          console.error('Prefetch error:', err)
          // Don't save rejected promise to cache, allow retry
          fetchPromiseRef.current = null
          throw err
        })
      fetchPromiseRef.current = fetchPromise
    }
  }

  const handleScanProgress = (progress: number) => {
    // 1. Update synth pitch
    if (activeSynthRef.current) {
      activeSynthRef.current.updateProgress(progress)
    }

    // 2. Accelerating and intensifying vibration pulses
    if (progress > 0 && progress < 100) {
      if (typeof window !== 'undefined' && navigator.vibrate) {
        const now = Date.now()
        // Pulse interval starts at 350ms and speeds up to 55ms
        const interval = 350 - 295 * (progress / 100)
        
        if (now - lastVibrateRef.current >= interval) {
          // Pulse duration starts at 15ms and rises to 45ms
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

    // Cancel vibration instantly
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(0)
    }

    // Stop and fade out synthesizer charge sound
    if (activeSynthRef.current) {
      activeSynthRef.current.stop()
      activeSynthRef.current = null
    }
  }

  const handleScanComplete = async () => {
    setScanState('revealing')
    
    // Play build-up sound effect while revealing
    playRevealingSound()
    
    gsap.to(scannerContainerRef.current, {
      opacity: 0,
      scale: 0.85,
      duration: 0.8,
      ease: 'power2.inOut'
    })

    // Trigger complete vibration burst (double-pulse rumble)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([150, 100, 550])
    }

    // Stop charge sound
    if (activeSynthRef.current) {
      activeSynthRef.current.stop()
      activeSynthRef.current = null
    }

    try {
      let data = prefetchedDataRef.current
      if (!data && fetchPromiseRef.current) {
        data = await fetchPromiseRef.current
      } else if (!data) {
        // Fallback fetch if not started
        const res = await fetch('/api/tagcon/reveal', {
          method: 'POST'
        })
        data = await res.json()
        if (!data.success) {
          throw new Error(data.error || 'The elements reject you.')
        }
      }

      setTribe(data.tribe)
      setUserData({ name: data.name, number: data.number })
      
      setTimeout(() => {
        // Play mystical reveal explosion sound
        playRevealBurstSound(data.tribe)

        // Fullscreen energy flash
        setShowFlash(true)
        setScanState('done')
        
        // Animate flash fading
        setTimeout(() => {
          if (flashRef.current) {
            gsap.to(flashRef.current, {
              opacity: 0,
              duration: 1.2,
              onComplete: () => setShowFlash(false)
            })
          }
        }, 50)

        gsap.fromTo(revealContainerRef.current, 
          { opacity: 0, scale: 0.85, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 1.8, ease: 'power3.out' }
        )
        
        if (revealContainerRef.current) {
          gsap.fromTo(revealContainerRef.current.children,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, delay: 0.3, ease: 'power2.out' }
          )
        }

        gsap.to(backgroundRef.current, {
          opacity: 0.45,
          backgroundColor: getTribeColorGlow(data.tribe),
          duration: 1.5,
          ease: 'sine.inOut'
        })
      }, 1200)

    } catch (err: any) {
      console.error('Failed to fetch tribe', err)
      setErrorMessage(err.message || 'Magical interference detected.')
      setScanState('error')
      // Reset caches on failure to allow retry
      prefetchedDataRef.current = null
      fetchPromiseRef.current = null
      gsap.to(titleRef.current, { opacity: 1, scale: 1, duration: 0.8 })
    }
  }

  const getTribeColorGlow = (t: Tribe) => {
    switch (t) {
      case 'lava': return 'rgba(239, 68, 68, 0.25)' // red glow
      case 'rain': return 'rgba(59, 130, 246, 0.25)' // blue glow
      case 'mountain': return 'rgba(209, 160, 88, 0.2)' // gold glow
      case 'wind': return 'rgba(16, 185, 129, 0.25)' // green glow
      default: return 'rgba(0, 0, 0, 0)'
    }
  }

  const getTribeDetails = (tribeName: Tribe | null) => {
    switch (tribeName) {
      case 'lava':
        return { 
          title: 'LAVA', 
          image: '/l.png',
          traits: 'AGGRESSIVE ◈ CHAOTIC ◈ OFFENSIVE',
          color: '#ff4400',
          borderColor: '#882200'
        }
      case 'rain':
        return { 
          title: 'RAIN', 
          image: '/r.png',
          traits: 'ADAPTIVE ◈ COOLING ◈ TACTICAL',
          color: '#00aaff',
          borderColor: '#004488'
        }
      case 'mountain':
        return { 
          title: 'MOUNTAIN', 
          image: '/m.png',
          traits: 'DEFENSIVE ◈ STABLE ◈ POWERFUL',
          color: '#eebb77',
          borderColor: '#664422'
        }
      case 'wind':
        return { 
          title: 'WIND', 
          image: '/w.png',
          traits: 'FAST ◈ UNPREDICTABLE ◈ DISRUPTIVE',
          color: '#00ff88',
          borderColor: '#006622'
        }
      default:
        return { title: '', image: '', traits: '', color: '', borderColor: '' }
    }
  }

  const resetToIdle = () => {
    gsap.to(revealContainerRef.current, {
      opacity: 0, scale: 0.9, y: -20, duration: 0.6, onComplete: () => {
        setScanState('idle')
        setTribe(null)
        setUserData(null)
        prefetchedDataRef.current = null
        fetchPromiseRef.current = null
        gsap.to(backgroundRef.current, { opacity: 0, duration: 0.8 })
        
        // Delay GSAP animation by 50ms to allow React to mount the scanner elements
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
    })
  }

  const details = getTribeDetails(tribe)

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      {/* Self-contained styling for levitation animation keyframes */}
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
          backgroundImage: "url('/magical_forest_bg.png')",
          fontFamily: "'Montserrat', sans-serif" 
        }}
      >
        {/* Dark Dimmer Overlay */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none z-0"></div>

        {/* Dynamic Color Glow matching the tribe */}
        <div 
          ref={backgroundRef} 
          className="absolute inset-0 pointer-events-none transition-all duration-1000 z-0 opacity-0"
        ></div>

        {/* Scattered neon fireflies floating in the background */}
        <div ref={firefliesRef} className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {mounted && Array.from({ length: 20 }).map((_, index) => {
            const left = `${Math.random() * 100}%`
            const top = `${Math.random() * 100}%`
            const size = 3 + Math.random() * 6
            
            // Neon forest palettes: Emerald, Cyan/Teal, Purple, Indigo
            const palettes = [
              { bg: 'bg-[#10b981]/90', glow: '0 0 12px #34d399, 0 0 4px #fff' },
              { bg: 'bg-[#06b6d4]/90', glow: '0 0 12px #22d3ee, 0 0 4px #fff' },
              { bg: 'bg-[#a855f7]/90', glow: '0 0 12px #c084fc, 0 0 4px #fff' },
              { bg: 'bg-[#6366f1]/95', glow: '0 0 12px #818cf8, 0 0 4px #fff' }
            ]
            const styleChoice = palettes[index % palettes.length]
            
            return (
              <div 
                key={index} 
                className={`absolute rounded-full pointer-events-none firefly ${styleChoice.bg}`}
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

        {/* Fullscreen energy flash overlay */}
        {showFlash && (
          <div 
            ref={flashRef}
            className="fixed inset-0 bg-white z-[999] opacity-100"
            style={{ mixBlendMode: 'screen' }}
          ></div>
        )}

        <div className={`relative z-20 flex flex-col items-center justify-center w-full ${scanState === 'done' ? 'max-w-2xl' : 'max-w-md'} h-[100dvh] sm:h-auto mx-auto p-4 sm:py-8`}>
          
          {/* Header */}
          <div className="h-28 flex flex-col items-center justify-center w-full mb-8">
            {scanState === 'idle' && (
              <h1 ref={titleRef} className="text-3xl md:text-5xl text-center font-black tracking-[0.2em] text-[#e0e7e1] uppercase" style={{ fontFamily: "'Cinzel', serif", textShadow: '0 2px 15px rgba(0,0,0,0.9)' }}>
                Summon Your Tribe
              </h1>
            )}
            {scanState === 'scanning' && (
              <h1 ref={titleRef} className="text-2xl md:text-4xl text-center font-black tracking-[0.3em] text-[#06b6d4] uppercase" style={{ fontFamily: "'Cinzel', serif", textShadow: '0 0 25px rgba(6,182,212,0.6)' }}>
                Channeling...
              </h1>
            )}
            {scanState === 'revealing' && (
              <h1 ref={titleRef} className="text-xl md:text-3xl text-center font-black tracking-[0.4em] text-white uppercase animate-pulse" style={{ fontFamily: "'Cinzel', serif", textShadow: '0 0 20px rgba(52,211,153,0.7)' }}>
                The Forest Answers
              </h1>
            )}
            {scanState === 'error' && (
              <div className="text-center">
                <h1 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-red-500 mb-4 uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
                  {errorMessage}
                </h1>
                <button 
                  onClick={() => setScanState('idle')}
                  className="bg-black/80 border border-red-500 text-red-500 px-6 py-2.5 tracking-widest text-xs hover:bg-red-500/10 transition-colors uppercase font-bold rounded-lg"
                >
                  Return
                </button>
              </div>
            )}
          </div>

          {/* Magical Rune Scanner */}
          {(scanState === 'idle' || scanState === 'scanning' || scanState === 'revealing') && (
            <div ref={scannerContainerRef} className="flex flex-col items-center">
              <ThumbScanner 
                onScanStart={handleScanStart} 
                onScanComplete={handleScanComplete} 
                onScanCancel={handleScanCancel} 
                onScanProgress={handleScanProgress}
              />
              <div 
                className="mt-10 px-6 py-2.5 bg-black/80 rounded-full flex flex-col items-center gap-1.5 pointer-events-none select-none"
                style={{
                  border: '1.5px solid rgba(52, 211, 153, 0.45)',
                  boxShadow: '0 0 15px rgba(52, 211, 153, 0.25), inset 0 0 5px rgba(52, 211, 153, 0.15)'
                }}
              >
                <span className="text-[#34d399] text-[13px] font-black tracking-[0.3em] uppercase drop-shadow-[0_0_8px_rgba(52,211,153,0.7)] animate-pulse">
                  HOLD TO REVEAL
                </span>
                <span className="text-white/50 text-[10px] tracking-[0.2em] uppercase font-bold">
                  YOUR TRIBE
                </span>
              </div>
            </div>
          )}

          {/* High-Fantasy Card Reveal */}
          {scanState === 'done' && (
            <div 
              ref={revealContainerRef} 
              className="flex flex-col justify-center items-center w-full h-[82vh] relative"
            >
              {/* Dynamic glowing halo behind the massive card */}
              <div 
                className="absolute w-[450px] h-[450px] rounded-full blur-3xl pointer-events-none opacity-45 mix-blend-screen"
                style={{
                  background: `radial-gradient(circle, ${details.color} 0%, transparent 70%)`,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) scale(1.4)'
                }}
              />
              
              {/* Massive 3D Levitating Card taking maximum viewport height */}
              <div className="relative w-[330px] sm:w-[370px] h-[520px] sm:h-[580px] z-10 mb-4" style={{ perspective: '1000px' }}>
                <div 
                  className="w-full h-full relative"
                  style={{
                    transformStyle: 'preserve-3d',
                    animation: 'levitate 5s ease-in-out infinite',
                  }}
                >
                  <Image
                    src={details.image}
                    alt={details.title}
                    fill
                    className="object-contain filter drop-shadow-[0_10px_35px_rgba(0,0,0,0.95)] hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 330px, 370px"
                    priority
                  />
                  
                  {/* Name and Mobile Number Plaque overlaid directly on the card graphic */}
                  <div className="absolute bottom-[42px] sm:bottom-[48px] left-1/2 -translate-x-1/2 z-20 w-[78%] flex flex-col items-center pointer-events-none">
                    <div 
                      className="px-4 py-1.5 bg-[#000]/95 border-2 border-[#d1a058] rounded-md text-center w-full shadow-2xl"
                      style={{
                        boxShadow: '0 8px 25px rgba(0,0,0,0.95), inset 0 0 10px rgba(209,160,88,0.4)'
                      }}
                    >
                      <p className="text-[#d1a058] text-[15px] sm:text-[17px] font-black tracking-widest uppercase truncate" style={{ fontFamily: "'Cinzel', serif" }}>
                        {userData?.name}
                      </p>
                      <p className="text-white/60 text-[10px] sm:text-[11px] font-mono tracking-wider mt-0.5">
                        {userData?.number}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Access Band Instructions Text */}
              <p className="text-white/90 text-[11px] sm:text-xs text-center tracking-[0.12em] font-bold max-w-sm mb-4 px-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] leading-relaxed uppercase">
                Show this card to the counter to receive your tribe access band
              </p>

              {/* Reset Kiosk Button */}
              <button 
                onClick={resetToIdle}
                className="mt-1 group relative px-10 py-3.5 overflow-hidden rounded-full border border-white/20 bg-black/85 hover:border-white/50 transition-colors shadow-2xl z-20"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative font-bold tracking-[0.25em] uppercase text-[11px] transition-colors" style={{ color: details.color }}>
                  New Warrior
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {!dismissOverlay && (
        <div 
          ref={overlayRef}
          onClick={handleAwaken}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050806]/98 cursor-pointer select-none"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {/* Ambient forest glow behind */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)] pointer-events-none" />

          {/* Large pulsing rune */}
          <div className="relative mb-8 group">
            <div className="absolute inset-[-20px] rounded-full bg-[#10b981]/10 blur-2xl animate-pulse" />
            <svg 
              className="w-32 h-32 text-[#34d399] filter drop-shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-pulse"
              viewBox="0 0 100 100" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
            >
              <path d="M50 8 L88 28 L88 72 L50 92 L12 72 L12 28 Z" />
              <path d="M50 18 L78 34 L78 66 L50 82 L22 66 L22 34 Z" strokeDasharray="5 5" />
              <circle cx="50" cy="50" r="14" />
              <path d="M50 34 L50 8" />
              <path d="M50 66 L50 92" />
            </svg>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#e0e7e1] tracking-[0.3em] uppercase text-center mb-3" style={{ fontFamily: "'Cinzel', serif", textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            The Forest Awakens
          </h2>
          
          <p className="text-[#34d399] text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase animate-pulse drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
            Tap Screen to Summon
          </p>
        </div>
      )}
    </>
  )
}
