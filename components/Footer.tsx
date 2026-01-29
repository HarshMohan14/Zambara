'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap, createTimeline, ScrollTrigger } from '@/lib/gsap'
import { apiClient } from '@/lib/api-client'

export function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const [showPreBookForm, setShowPreBookForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pack: '2-4' as '2-4' | '5-8'
  })

  useEffect(() => {
    if (!footerRef.current) return

    const ctx = gsap.context(() => {
      const tl = createTimeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 90%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      })

      // Animate logo
      if (logoRef.current) {
        tl.fromTo(
          logoRef.current,
          { opacity: 0, y: 20, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'back.out(1.7)',
          }
        )
      }

      // Animate text
      if (textRef.current) {
        const lines = textRef.current.children
        tl.fromTo(
          Array.from(lines),
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.15,
          },
          '-=0.4'
        )
      }

      // Animate links
      if (linksRef.current) {
        const linkItems = linksRef.current.children
        tl.fromTo(
          Array.from(linkItems),
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.1,
          },
          '-=0.3'
        )
      }

      // Animate button
      if (buttonRef.current) {
        tl.fromTo(
          buttonRef.current,
          { opacity: 0, scale: 0.9, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            ease: 'back.out(1.7)',
          },
          '-=0.2'
        )
      }
    }, footerRef)

    return () => {
      ctx.revert()
    }
  }, [])

  // Animate form modal
  useEffect(() => {
    if (!showPreBookForm || !formRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'back.out(1.7)',
        }
      )
    })

    return () => {
      ctx.revert()
    }
  }, [showPreBookForm])

  return (
    <footer
      ref={footerRef}
      className="relative w-full py-16 md:py-20 overflow-hidden bg-black border-t-2 border-[#d1a058]/20"
      style={{
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(20, 10, 0, 0.95) 100%)',
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#d1a058] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#d1a058] rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Logo Section */}
        <div ref={logoRef} className="flex justify-center mb-12 opacity-0">
          <Image
            src="/Zambaara.png"
            alt="ZAMBAARA"
            width={300}
            height={120}
            className="h-16 md:h-20 w-auto object-contain opacity-90"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(209, 160, 88, 0.3))',
            }}
          />
        </div>

        {/* Main Text Content */}
        <div
          ref={textRef}
          className="mb-12 space-y-3 text-center"
          style={{
            fontFamily: "'TheWalkyrDemo', serif",
          }}
        >
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase leading-tight opacity-0"
            style={{
              color: '#d1a058',
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(209, 160, 88, 0.2)',
            }}
          >
            MASTER THE FORCES
          </h2>
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase leading-tight opacity-0"
            style={{
              color: '#d1a058',
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(209, 160, 88, 0.2)',
            }}
          >
            BECOME THE ZAMPION
          </h2>
        </div>

        {/* Divider */}
        <div className="flex justify-center mb-12">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#d1a058] to-transparent opacity-50"></div>
        </div>

        {/* Links Section */}
        <div ref={linksRef} className="flex flex-wrap justify-center gap-6 md:gap-8 mb-12">
          <a
            href="#hero"
            className="opacity-0 transition-all duration-300 uppercase tracking-wide"
            style={{
              fontFamily: "'BlinkerRegular', sans-serif",
              color: '#d1a058',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#f4d03f'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.textShadow = '0 0 10px rgba(209, 160, 88, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#d1a058'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.textShadow = 'none'
            }}
          >
            Home
          </a>
          <a
            href="#cards"
            className="opacity-0 transition-all duration-300 uppercase tracking-wide"
            style={{
              fontFamily: "'BlinkerRegular', sans-serif",
              color: '#d1a058',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#f4d03f'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.textShadow = '0 0 10px rgba(209, 160, 88, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#d1a058'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.textShadow = 'none'
            }}
          >
            Game Cards
          </a>
          <a
            href="#battle-pack"
            className="opacity-0 transition-all duration-300 uppercase tracking-wide"
            style={{
              fontFamily: "'BlinkerRegular', sans-serif",
              color: '#d1a058',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#f4d03f'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.textShadow = '0 0 10px rgba(209, 160, 88, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#d1a058'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.textShadow = 'none'
            }}
          >
            Battle Pack
          </a>
          <a
            href="#cave"
            className="opacity-0 transition-all duration-300 uppercase tracking-wide"
            style={{
              fontFamily: "'BlinkerRegular', sans-serif",
              color: '#d1a058',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#f4d03f'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.textShadow = '0 0 10px rgba(209, 160, 88, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#d1a058'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.textShadow = 'none'
            }}
          >
            Pre-Book
          </a>
          <Link
            href="/how-to-play"
            className="opacity-0 transition-all duration-300 uppercase tracking-wide"
            style={{
              fontFamily: "'BlinkerRegular', sans-serif",
              color: '#d1a058',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#f4d03f'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.textShadow = '0 0 10px rgba(209, 160, 88, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#d1a058'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.textShadow = 'none'
            }}
          >
            How to Play
          </Link>
        </div>

        {/* Call to Action Button */}
        <div className="flex justify-center mb-12">
          <button
            ref={buttonRef}
            onClick={() => setShowPreBookForm(true)}
            className="px-10 py-4 md:px-14 md:py-5 font-semibold uppercase tracking-wide rounded-lg transition-all duration-300 opacity-0 relative overflow-hidden group"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              background: 'linear-gradient(135deg, rgba(209, 160, 88, 0.2) 0%, rgba(209, 160, 88, 0.1) 100%)',
              color: '#d1a058',
              fontSize: '16px',
              border: '2px solid #d1a058',
              boxShadow: '0 4px 15px rgba(209, 160, 88, 0.2), inset 0 0 20px rgba(209, 160, 88, 0.1)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(209, 160, 88, 0.3) 0%, rgba(209, 160, 88, 0.2) 100%)'
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(209, 160, 88, 0.4), inset 0 0 30px rgba(209, 160, 88, 0.2)'
              e.currentTarget.style.borderColor = '#f4d03f'
              e.currentTarget.style.color = '#f4d03f'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)'
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(209, 160, 88, 0.2) 0%, rgba(209, 160, 88, 0.1) 100%)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(209, 160, 88, 0.2), inset 0 0 20px rgba(209, 160, 88, 0.1)'
              e.currentTarget.style.borderColor = '#d1a058'
              e.currentTarget.style.color = '#d1a058'
            }}
          >
            <span className="relative z-10">PRE-BOOK NOW</span>
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d1a058]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                transform: 'translateX(-100%)',
                transition: 'transform 0.6s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(100%)'
              }}
            ></div>
          </button>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-[#d1a058]/10">
          <p
            className="text-sm text-white/60"
            style={{
              fontFamily: "'BlinkerRegular', sans-serif",
            }}
          >
            © {new Date().getFullYear()} ZAMBAARA. All rights reserved.
          </p>
          <p
            className="text-xs text-white/40 mt-2"
            style={{
              fontFamily: "'BlinkerRegular', sans-serif",
            }}
          >
            Battle of the Elements
          </p>
        </div>
      </div>

      {/* Pre-Book Form Modal */}
      {showPreBookForm && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setShowPreBookForm(false)}
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <div
            ref={formRef}
            className="relative bg-black border-2 border-[#d1a058] rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 0 40px rgba(209, 160, 88, 0.3), inset 0 0 20px rgba(209, 160, 88, 0.1)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPreBookForm(false)}
              className="absolute top-4 right-4 transition-all duration-300 rounded-full z-50"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '2px solid #d1a058',
                color: '#d1a058',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(209, 160, 88, 0.2), inset 0 0 10px rgba(209, 160, 88, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#d1a058'
                e.currentTarget.style.color = '#000000'
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(209, 160, 88, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
                e.currentTarget.style.color = '#d1a058'
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(209, 160, 88, 0.2), inset 0 0 10px rgba(209, 160, 88, 0.1)'
              }}
              aria-label="Close form"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2
              className="text-3xl md:text-4xl font-bold uppercase mb-6 text-center"
              style={{
                fontFamily: "'TheWalkyrDemo', serif",
                color: '#d1a058',
                textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(209, 160, 88, 0.2)',
              }}
            >
              PRE BOOK NOW
            </h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setIsSubmitting(true)
                setSubmitError(null)
                
                try {
                  // Map pack to numberOfPlayers (use max of range)
                  const numberOfPlayers = formData.pack === '2-4' ? 4 : 8
                  
                  const response = await apiClient.createPreBooking({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    mobile: formData.phone.trim(),
                    numberOfPlayers: numberOfPlayers,
                    specialRequests: `Pack: ${formData.pack} players`,
                  })
                  
                  if (response.success) {
                    alert('Thank you for your pre-booking! We will contact you soon.')
                    setShowPreBookForm(false)
                    setFormData({ name: '', email: '', phone: '', pack: '2-4' })
                  } else {
                    setSubmitError(response.error || 'Failed to submit pre-booking. Please try again.')
                  }
                } catch (error: any) {
                  console.error('Error submitting pre-booking:', error)
                  setSubmitError(error?.message || 'An unexpected error occurred. Please try again.')
                } finally {
                  setIsSubmitting(false)
                }
              }}
              className="space-y-6"
            >
              <div>
                <label
                  className="block mb-2 uppercase tracking-wide"
                  style={{
                    fontFamily: "'BlinkerSemiBold', sans-serif",
                    color: '#d1a058',
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-black border-2 border-[#d1a058] text-white focus:outline-none focus:ring-2 focus:ring-[#d1a058]"
                  style={{
                    fontFamily: "'BlinkerRegular', sans-serif",
                  }}
                />
              </div>

              <div>
                <label
                  className="block mb-2 uppercase tracking-wide"
                  style={{
                    fontFamily: "'BlinkerSemiBold', sans-serif",
                    color: '#d1a058',
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-black border-2 border-[#d1a058] text-white focus:outline-none focus:ring-2 focus:ring-[#d1a058]"
                  style={{
                    fontFamily: "'BlinkerRegular', sans-serif",
                  }}
                />
              </div>

              <div>
                <label
                  className="block mb-2 uppercase tracking-wide"
                  style={{
                    fontFamily: "'BlinkerSemiBold', sans-serif",
                    color: '#d1a058',
                  }}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-black border-2 border-[#d1a058] text-white focus:outline-none focus:ring-2 focus:ring-[#d1a058]"
                  style={{
                    fontFamily: "'BlinkerRegular', sans-serif",
                  }}
                />
              </div>

              <div>
                <label
                  className="block mb-2 uppercase tracking-wide"
                  style={{
                    fontFamily: "'BlinkerSemiBold', sans-serif",
                    color: '#d1a058',
                  }}
                >
                  Pack Choice
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, pack: '2-4' })}
                    className="flex-1 px-6 py-3 rounded-lg font-semibold uppercase tracking-wide transition-all"
                    style={{
                      fontFamily: "'BlinkerSemiBold', sans-serif",
                      backgroundColor: formData.pack === '2-4' ? '#d1a058' : 'transparent',
                      border: '2px solid #d1a058',
                      color: formData.pack === '2-4' ? '#000' : '#d1a058',
                    }}
                  >
                    2-4 PLAYERS (₹499)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, pack: '5-8' })}
                    className="flex-1 px-6 py-3 rounded-lg font-semibold uppercase tracking-wide transition-all"
                    style={{
                      fontFamily: "'BlinkerSemiBold', sans-serif",
                      backgroundColor: formData.pack === '5-8' ? '#d1a058' : 'transparent',
                      border: '2px solid #d1a058',
                      color: formData.pack === '5-8' ? '#000' : '#d1a058',
                    }}
                  >
                    5-8 PLAYERS (₹799)
                  </button>
                </div>
              </div>

              {submitError && (
                <div className="bg-red-500/20 border-2 border-red-500/50 rounded-lg p-4 text-red-300 text-sm">
                  {submitError}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 font-semibold rounded-lg transition-all uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontFamily: "'BlinkerSemiBold', sans-serif",
                  background: 'linear-gradient(180deg, #f4d03f 0%, #d1a058 100%)',
                  border: 'none',
                  color: '#000000',
                  boxShadow: '0 4px 15px rgba(209, 160, 88, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  letterSpacing: '1px',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(209, 160, 88, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(209, 160, 88, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}
              >
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT PRE-BOOKING'}
              </button>
            </form>
          </div>
        </div>
      )}
    </footer>
  )
}
