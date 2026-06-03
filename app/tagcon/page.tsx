'use client'

import React, { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import Head from 'next/head'
import Image from 'next/image'
import { toast, Toaster } from 'sonner'

// All 16 provided theme element images to scatter in the background
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

export default function TagConRegistration() {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const elementsContainerRef = useRef<HTMLDivElement>(null)

  // Validate mobile number: supports 10-digit Indian numbers (with/without +91/91/0) or generic E.164 formats
  const validateMobile = (num: string) => {
    // Strip out all non-digit and non-plus characters (e.g. spaces, hyphens, brackets)
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
        { opacity: 0, y: 50, rotation: -2 },
        { opacity: 1, y: 0, rotation: 0, duration: 1, ease: 'back.out(1.5)' }
      )
    }

    // Animate all 16 scattered background elements floating around
    if (elementsContainerRef.current) {
      const elements = elementsContainerRef.current.children
      Array.from(elements).forEach((el) => {
        const floatX = Math.random() * 160 - 80
        const floatY = Math.random() * 160 - 80
        const rotateAngle = Math.random() * 360 - 180
        const scaleChange = 0.75 + Math.random() * 0.4
        const duration = 12 + Math.random() * 12

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

  // Handle Registration Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !mobile || !isMobileValid) {
      if (!isMobileValid) toast.error('Please enter a valid mobile number.')
      return
    }
    setLoading(true)
    
    // Send cleaned standard number to database
    const cleanedMobile = mobile.replace(/[^\d+]/g, '')
    
    try {
      const res = await fetch('/api/tagcon/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile: cleanedMobile })
      })
      
      if (res.ok) {
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 0.9,
          rotation: 5,
          duration: 0.5,
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
        toast.error('Failed to register. Try again.')
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
      toast.error('Magical interference detected.')
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
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundColor: "#faf9f6",
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.7) 0%, rgba(244,242,236,0.9) 100%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")
          `,
          fontFamily: "'Nunito', sans-serif"
        }}
      >
        {/* Subtle Overlay to enhance the cardboard texture */}
        <div className="absolute inset-0 bg-transparent pointer-events-none z-0"></div>

        {/* Scattered Theme Elements in Background */}
        <div ref={elementsContainerRef} className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
          {ELEMENT_IMAGES.map((src, index) => {
            // Distribute all 16 elements widely in columns and rows
            const left = `${(index * 9.5 + 4) % 95}%`
            const top = `${(index * 13.7 + 6) % 88}%`
            const size = 95 + (index % 4) * 55 // Sizes from 95px to 260px
            const opacity = 0.85 + (index % 3) * 0.07 // Opacities from 0.85 to 0.99 (fully visible)
            return (
              <div 
                key={index} 
                className="absolute pointer-events-none filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] select-none"
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
                  alt="Tribe element background decoration"
                  className="w-full h-full object-contain"
                />
              </div>
            )
          })}
        </div>

        {/* Static playful badges */}
        <div className="absolute top-8 left-8 w-20 h-20 bg-[#ff3366] rounded-full flex items-center justify-center text-white font-bold text-3xl rotate-12 shadow-lg z-20 select-none" style={{ fontFamily: "'Fredoka One', cursive" }}>:)</div>
        <div className="absolute bottom-8 right-8 w-16 h-16 bg-[#ffcc00] rounded-full flex items-center justify-center text-white font-bold text-2xl -rotate-12 shadow-lg z-20 select-none" style={{ fontFamily: "'Fredoka One', cursive" }}>xD</div>

        {!submitted ? (
          <div 
            ref={containerRef}
            className="relative z-20 w-full max-w-md p-8 sm:p-10 m-4 bg-[#f8f6f0] rounded-xl shadow-[10px_10px_40px_rgba(0,0,0,0.3)] border border-[#a0a0a0]/10"
            style={{ 
              borderRadius: '20px 20px 140px 20px / 20px 20px 20px 20px', // peeled sticker look
            }}
          >
            {/* Blue Pushpin */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#4a6b8c] shadow-[2px_4px_6px_rgba(0,0,0,0.3)] border-2 border-[#3a5b7c]">
              <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white/40"></div>
            </div>

            {/* TAG Logo */}
            <div className="text-center mb-6 mt-4 relative">
              <div className="relative w-48 h-24 mx-auto mb-2 drop-shadow-md">
                <Image
                  src="/TAG logo.png"
                  alt="TAG Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              
              <h1 className="text-3xl font-black text-[#e84364] uppercase tracking-wide leading-none mt-2" style={{ fontFamily: "'Fredoka One', cursive", textShadow: '1px 1px 0px rgba(0,0,0,0.1)' }}>
                TAG Registration
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase text-[#606060] tracking-wider mb-1">Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#f0eee4] border-2 border-dashed border-[#b0b0b0] rounded-xl px-4 py-3 text-lg text-[#2d3748] font-bold placeholder-[#a0a0a0]/60 focus:outline-none focus:border-[#e84364] focus:bg-white transition-all"
                  placeholder="Player Name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-black uppercase text-[#606060] tracking-wider mb-1">Mobile Number</label>
                <input 
                  type="tel" 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className={`w-full bg-[#f0eee4] border-2 border-dashed border-[#b0b0b0] rounded-xl px-4 py-3 text-lg text-[#2d3748] font-bold placeholder-[#a0a0a0]/60 focus:outline-none focus:border-[#e84364] focus:bg-white transition-all ${mobile && isMobileValid ? 'border-solid border-green-500 bg-green-50/10' : ''}`}
                  placeholder="Mobile Number"
                  required
                />
                {mobile && !isMobileValid && (
                  <p className="text-xs text-[#e84364] mt-1.5 font-bold">Please enter a valid mobile number (e.g. 10 digits).</p>
                )}
              </div>

              <div className="pt-2 relative">
                <button 
                  type="submit"
                  disabled={loading || !name || !isMobileValid}
                  className="w-full bg-[#2a5568] hover:bg-[#1a4558] text-white text-2xl font-black py-4 rounded-[30px] shadow-[0_6px_0_#1a3548] hover:shadow-[0_2px_0_#1a3548] hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  {loading ? 'SUMMONING...' : 'JOIN NOW!'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div 
            ref={successRef}
            className="relative z-20 w-full max-w-md p-10 text-center bg-[#f8f6f0] rounded-xl shadow-[10px_10px_40px_rgba(0,0,0,0.3)] m-4"
            style={{ borderRadius: '20px 20px 140px 20px / 20px 20px 20px 20px' }}
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#4a6b8c] shadow-lg border-2 border-[#3a5b7c]"></div>
            
            <h2 className="text-3xl text-[#2a5568] font-black mt-4 mb-4" style={{ fontFamily: "'Fredoka One', cursive" }}>
              SUMMONED!
            </h2>
            <div className="text-[#ff3366] text-6xl mb-6 font-bold" style={{ fontFamily: "'Fredoka One', cursive" }}>
              ✓
            </div>
            <p className="text-[#2d3748] text-lg font-bold mb-8">
              Proceed to the Reveal Kiosk and scan your thumb to summon your tribe!
            </p>
            
            <button 
              onClick={resetForm}
              className="bg-transparent border-4 border-[#ffcc00] text-[#2d3748] hover:bg-[#ffcc00] font-black py-2.5 px-6 rounded-full transition-all"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              ADD ANOTHER
            </button>
          </div>
        )}
      </div>
    </>
  )
}
