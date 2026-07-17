'use client'

import React, { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import Head from 'next/head'
import Image from 'next/image'
import { toast, Toaster } from 'sonner'

// 16 element images to scatter in the background for theme consistency
const ELEMENT_IMAGES = [
  '/Elements/Untitled_Artwork-1.png',
  '/Elements/Untitled_Artwork-1(1).png',
  '/Elements/Untitled_Artwork-2.png',
  '/Elements/Untitled_Artwork-2(1).png',
  '/Elements/Untitled_Artwork-3.png',
  '/Elements/Untitled_Artwork-3(1).png',
  '/Elements/Untitled_Artwork-4.png',
  '/Elements/Untitled_Artwork-4(1).png',
  '/Elements/Untitled_Artwork-5.png',
  '/Elements/Untitled_Artwork-5(1).png',
  '/Elements/Untitled_Artwork-6.png',
  '/Elements/Untitled_Artwork-6(1).png',
  '/Elements/Untitled_Artwork-7.png',
  '/Elements/Untitled_Artwork-8.png',
  '/Elements/Untitled_Artwork-9.png',
  '/Elements/Untitled_Artwork-10.png',
]

export default function ZambaaraRegistration() {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const elementsContainerRef = useRef<HTMLDivElement>(null)

  // Validate mobile number (supports E.164 and Indian numbers)
  const validateMobile = (num: string) => {
    const cleanNum = num.replace(/[^\d+]/g, '')
    const indRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/
    const globalRegex = /^\+?[1-9]\d{6,14}$/
    return indRegex.test(cleanNum) || globalRegex.test(cleanNum)
  }

  const isMobileValid = validateMobile(mobile)

  useEffect(() => {
    // Entrance animation for form container
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 50, scale: 0.95, rotation: -3 },
        { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 1.2, ease: 'back.out(1.7)' }
      )
    }

    // Floating background decorations animation
    if (elementsContainerRef.current) {
      const elements = elementsContainerRef.current.children
      Array.from(elements).forEach((el) => {
        const floatX = Math.random() * 180 - 90
        const floatY = Math.random() * 180 - 90
        const rotateAngle = Math.random() * 360 - 180
        const scaleChange = 0.7 + Math.random() * 0.5
        const duration = 15 + Math.random() * 15

        gsap.to(el, {
          x: floatX,
          y: floatY,
          rotation: rotateAngle,
          scale: scaleChange,
          duration: duration,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        })
      })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !mobile || !isMobileValid) {
      if (!isMobileValid) toast.error('Please enter a valid mobile number.')
      return
    }
    setLoading(true)
    const cleanedMobile = mobile.replace(/[^\d+]/g, '')

    try {
      const res = await fetch('/api/zambaara/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), mobile: cleanedMobile })
      })

      if (res.ok) {
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 0.9,
          rotation: 4,
          duration: 0.6,
          ease: 'power2.in',
          onComplete: () => {
            setSubmitted(true)
            setTimeout(() => {
              if (successRef.current) {
                gsap.fromTo(successRef.current,
                  { opacity: 0, scale: 0.8, y: 20 },
                  { opacity: 1, scale: 1, y: 0, rotation: -1, duration: 0.8, ease: 'back.out(1.5)' }
                )
              }
            }, 50)
          }
        })
      } else {
        setLoading(false)
        const errData = await res.json()
        toast.error(errData.error || 'Failed to register. Please try again.')
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
      toast.error('Connection interference detected. Try again.')
    }
  }

  const resetForm = () => {
    gsap.to(successRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      onComplete: () => {
        setSubmitted(false)
        setName('')
        setMobile('')
        setLoading(false)
        setTimeout(() => {
          gsap.fromTo(
            containerRef.current,
            { opacity: 0, y: -30, rotation: 2 },
            { opacity: 1, y: 0, rotation: 0, duration: 0.8, ease: 'back.out(1.5)' }
          )
        }, 50)
      }
    })
  }

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;900&display=swap" rel="stylesheet" />
      </Head>
      <Toaster position="top-center" />
      
      <div 
        className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url('/zambaara_bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontFamily: "'Nunito', sans-serif"
        }}
      >
        {/* Ambient background grid pattern */}
        <div className="absolute inset-0 bg-repeat bg-transparent opacity-10 pointer-events-none z-0"
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")` }}>
        </div>

        {/* Scattered background elemental chimes */}
        <div ref={elementsContainerRef} className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
          {ELEMENT_IMAGES.map((src, index) => {
            const left = `${(index * 11 + 6) % 95}%`
            const top = `${(index * 14 + 11) % 85}%`
            const size = 80 + (index % 5) * 45 
            const opacity = 0.45 + (index % 3) * 0.15 
            return (
              <div 
                key={index} 
                className="absolute pointer-events-none filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] select-none"
                style={{
                  left,
                  top,
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity: opacity,
                }}
              >
                <img
                  src={src}
                  alt="Zambaara tribe theme deco"
                  className="w-full h-full object-contain"
                />
              </div>
            )
          })}
        </div>

        {/* Ethereal Floating Badges */}
        <div className="absolute top-12 left-12 w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center text-black font-black text-3xl rotate-12 shadow-[0_4px_15px_rgba(245,158,11,0.4)] z-20 select-none animate-pulse" style={{ fontFamily: "'Fredoka One', cursive" }}>★</div>
        <div className="absolute bottom-12 right-12 w-16 h-16 bg-[#ff4400] rounded-full flex items-center justify-center text-white font-black text-2xl -rotate-12 shadow-[0_4px_15px_rgba(255,68,0,0.4)] z-20 select-none animate-bounce" style={{ fontFamily: "'Fredoka One', cursive" }}>✦</div>

        {!submitted ? (
          <div 
            ref={containerRef}
            className="relative z-20 w-full max-w-md p-8 sm:p-10 bg-black/75 border border-[#d1a058]/30 backdrop-blur-md rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.8)]"
            style={{ 
              borderRadius: '24px 24px 100px 24px / 24px 24px 24px 24px', // Sticker style peeled edge
            }}
          >
            {/* Golden Pushpin */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#d1a058] shadow-[0_4px_10px_rgba(209,160,88,0.5)] border-2 border-[#b08048]">
              <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-white/50"></div>
            </div>

            {/* Zambaara Title and Logo */}
            <div className="text-center mb-8 mt-4">
              <h1 className="text-3xl font-black text-[#d1a058] uppercase tracking-wider leading-none mt-3" style={{ fontFamily: "'Fredoka One', cursive", textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                Zambaara Arena
              </h1>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1.5">Tournament Sign-up</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase text-[#d1a058] tracking-wider mb-1.5">Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border-2 border-dashed border-[#d1a058]/40 rounded-xl px-4 py-3 text-lg text-white font-bold placeholder-white/20 focus:outline-none focus:border-[#d1a058] focus:bg-black/60 transition-all"
                  placeholder="Your Gladiator Name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-black uppercase text-[#d1a058] tracking-wider mb-1.5">Mobile Number</label>
                <input 
                  type="tel" 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className={`w-full bg-white/5 border-2 border-dashed border-[#d1a058]/40 rounded-xl px-4 py-3 text-lg text-white font-bold placeholder-white/20 focus:outline-none focus:border-[#d1a058] focus:bg-black/60 transition-all ${mobile && isMobileValid ? 'border-solid border-green-500 bg-green-500/5' : ''}`}
                  placeholder="Mobile Number"
                  required
                />
                {mobile && !isMobileValid && (
                  <p className="text-xs text-[#ff4400] mt-2 font-bold">Please enter a valid 10-digit mobile number.</p>
                )}
              </div>

              <div className="pt-3">
                <button 
                  type="submit"
                  disabled={loading || !name.trim() || !isMobileValid}
                  className="w-full bg-[#d1a058] hover:bg-[#c09048] text-black text-2xl font-black py-4 rounded-[30px] shadow-[0_6px_0_#907038] hover:shadow-[0_2px_0_#907038] hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  {loading ? 'SUMMONING...' : 'ENTER ARENA'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div 
            ref={successRef}
            className="relative z-20 w-full max-w-md p-10 text-center bg-black/80 border border-[#d1a058]/30 backdrop-blur-md rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] m-4"
            style={{ borderRadius: '24px 24px 100px 24px / 24px 24px 24px 24px' }}
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#d1a058] shadow-[0_4px_10px_rgba(209,160,88,0.5)] border-2 border-[#b08048]"></div>
            
            <h2 className="text-3xl text-[#d1a058] font-black mt-4 mb-4" style={{ fontFamily: "'Fredoka One', cursive" }}>
              SUMMONED!
            </h2>
            <div className="text-green-400 text-6xl mb-6 font-bold" style={{ fontFamily: "'Fredoka One', cursive" }}>
              ✓
            </div>
            <p className="text-white/80 text-lg font-bold mb-8">
              Your details are recorded. Head over to the Zambaara Kiosk and scan your thumb to reveal your tribe!
            </p>
            
            <button 
              onClick={resetForm}
              className="bg-transparent border-4 border-[#d1a058] text-[#d1a058] hover:bg-[#d1a058] hover:text-black font-black py-2.5 px-6 rounded-full transition-all uppercase tracking-wider text-sm"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              Add Another
            </button>
          </div>
        )}
      </div>
    </>
  )
}
