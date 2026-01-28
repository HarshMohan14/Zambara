'use client'

import { useState, useRef, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { createTimeline } from '@/lib/gsap'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = createTimeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    })

    if (formRef.current) {
      ctx.fromTo(
        formRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        }
      )
    }

    return () => {
      ctx.kill()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await apiClient.subscribeNewsletter({ email })

      if (response.success) {
        setSuccess(true)
        setEmail('')
        setTimeout(() => setSuccess(false), 5000)
      } else {
        setError(response.error || 'Failed to subscribe')
      }
    } catch (err) {
      setError('Failed to subscribe. Please try again.')
      console.error('Newsletter error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black/80 py-12 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div ref={formRef} className="max-w-2xl mx-auto text-center opacity-0">
          <h3
            className="text-2xl md:text-3xl font-bold uppercase mb-4"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#d1a058',
            }}
          >
            Stay Updated
          </h3>
          <p
            className="text-white/80 mb-6"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
          >
            Subscribe to our newsletter for the latest updates and news
          </p>

          <form onSubmit={handleSubmit} className="flex gap-4 flex-col sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white placeholder-white/40 focus:border-[#d1a058] focus:outline-none transition-all"
              style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-lg font-semibold uppercase transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
                backgroundColor: '#d1a058',
                color: '#000',
                boxShadow: '0 4px 15px rgba(209, 160, 88, 0.3)',
              }}
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-500/20 border-2 border-red-500 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 bg-green-500/20 border-2 border-green-500 rounded-lg p-3 text-green-300 text-sm">
              Successfully subscribed! Check your email for confirmation.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
