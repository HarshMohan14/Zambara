'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap, createTimeline, ScrollTrigger } from '@/lib/gsap'
import { apiClient } from '@/lib/api-client'

export function CaveSection() {
  const [activeTab, setActiveTab] = useState<'2-4' | '5-8'>('2-4')
  const [showPreBookForm, setShowPreBookForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pack: '2-4' as '2-4' | '5-8'
  })
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const priceRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return

    const ctx = gsap.context(() => {
      // Create timeline for scroll-triggered animations
      const tl = createTimeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      })

      // Fade in content container
      tl.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
        }
      )

      // Tabs animation
      if (tabsRef.current) {
        tl.fromTo(
          tabsRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.5'
        )
      }

      // Description animation
      if (descriptionRef.current) {
        tl.fromTo(
          descriptionRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.4'
        )
      }

      // Price animation
      if (priceRef.current) {
        tl.fromTo(
          priceRef.current,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'back.out(1.7)',
          },
          '-=0.3'
        )
      }

      // Buttons animation
      if (buttonsRef.current) {
        tl.fromTo(
          buttonsRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
          },
          '-=0.2'
        )
      }
    }, sectionRef)

    return () => {
      ctx.revert()
    }
  }, [])

  // Animate description when tab changes
  useEffect(() => {
    if (!descriptionRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        descriptionRef.current,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
        }
      )
    })

    return () => {
      ctx.revert()
    }
  }, [activeTab])

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col items-center overflow-hidden bg-black"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Cave.jpg"
          alt="Cave background"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 container mx-auto px-4 py-12 text-center mt-[40vh]"
      >
        {/* Player Count Tabs */}
        <div
          ref={tabsRef}
          className="flex justify-center gap-4 mb-6 opacity-0"
        >
          <button
            onClick={() => setActiveTab('2-4')}
            className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wide transition-all"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              backgroundColor: activeTab === '2-4' ? '#d1a058' : 'transparent',
              border: activeTab === '2-4' ? 'none' : '2px solid #d1a058',
              color: activeTab === '2-4' ? '#000' : '#d1a058',
              textShadow: activeTab === '2-4' ? 'none' : '1px 1px 4px rgba(0, 0, 0, 0.8)',
              boxShadow: activeTab === '2-4' ? '0 4px 15px rgba(209, 160, 88, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== '2-4') {
                e.currentTarget.style.backgroundColor = 'rgba(209, 160, 88, 0.1)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== '2-4') {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            2-4 PLAYERS
          </button>
          <button
            onClick={() => setActiveTab('5-8')}
            className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wide transition-all"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              backgroundColor: activeTab === '5-8' ? '#FFFFFF' : 'transparent',
              border: '2px solid #d1a058',
              color: activeTab === '5-8' ? '#000' : '#d1a058',
              textShadow: activeTab === '5-8' ? 'none' : '1px 1px 4px rgba(0, 0, 0, 0.8)',
              boxShadow: activeTab === '5-8' ? '0 4px 15px rgba(255, 255, 255, 0.3)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== '5-8') {
                e.currentTarget.style.backgroundColor = 'rgba(209, 160, 88, 0.1)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== '5-8') {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            5-8 PLAYERS
          </button>
        </div>

        {/* Description */}
        <p
          ref={descriptionRef}
          className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8 opacity-0 leading-relaxed"
          style={{
            fontFamily: "'BlinkerRegular', sans-serif",
            textShadow: '1px 1px 4px rgba(0, 0, 0, 0.8)',
          }}
        >
          {activeTab === '2-4'
            ? 'Perfect for intimate gaming sessions. Experience the thrill of elemental mastery with a smaller group of players.'
            : 'Ideal for larger gatherings. Battle with more players and unlock the full potential of the Zambaara experience.'}
        </p>

        {/* Price */}
        <div
          ref={priceRef}
          className="mb-8 opacity-0"
        >
          <p
            className="text-6xl md:text-7xl lg:text-8xl font-bold"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#d1a058',
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(209, 160, 88, 0.2)',
              textTransform: 'lowercase',
            }}
          >
            {activeTab === '2-4' ? '₹499' : '₹799'}
          </p>
        </div>

        {/* Action Buttons */}
        <div
          ref={buttonsRef}
          className="flex flex-col sm:flex-row justify-center gap-4 opacity-0"
        >
          <a
            href="https://zambaara.com/howtoplay"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 font-semibold rounded-lg transition-all uppercase tracking-wide inline-block text-center"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              backgroundColor: '#000000',
              border: '2px solid #d1a058',
              color: '#FFFFFF',
              textShadow: '1px 1px 4px rgba(0, 0, 0, 0.8)',
              boxShadow: '0 4px 15px rgba(209, 160, 88, 0.2)',
              letterSpacing: '1px',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(209, 160, 88, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(209, 160, 88, 0.2)'
            }}
          >
            HOW TO PLAY
          </a>
          <button 
            onClick={() => {
              setFormData({ ...formData, pack: activeTab })
              setShowPreBookForm(true)
            }}
            className="px-8 py-4 font-semibold rounded-lg transition-all uppercase tracking-wide"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              background: 'linear-gradient(180deg, #f4d03f 0%, #d1a058 100%)',
              border: 'none',
              color: '#000000',
              boxShadow: '0 4px 15px rgba(209, 160, 88, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              letterSpacing: '1px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(209, 160, 88, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(209, 160, 88, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }}
          >
            PRE BOOK NOW
          </button>
        </div>
      </div>

      {/* Pre-Book Form Modal */}
      {showPreBookForm && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setShowPreBookForm(false)}
        >
          <div
            ref={formRef}
            className="relative bg-black border-2 border-[#d1a058] rounded-lg p-8 max-w-2xl w-full"
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
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
                e.currentTarget.style.color = '#d1a058'
                e.currentTarget.style.transform = 'scale(1)'
              }}
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
    </section>
  )
}