'use client'

import { useState, useRef, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { createTimeline } from '@/lib/gsap'

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

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
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
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
      const response = await apiClient.submitContact({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        subject: formData.subject.trim() || undefined,
      })

      if (response.success) {
        setSuccess(true)
        setFormData({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setSuccess(false), 5000)
      } else {
        setError(response.error || 'Failed to send message')
      }
    } catch (err: any) {
      // Try to extract error message from response
      const errorMessage = err?.error || err?.message || 'Failed to send message. Please try again.'
      setError(errorMessage)
      console.error('Contact form error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black/80 py-16 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-center mb-12"
          style={{
            fontFamily: "'TheWalkyrDemo', serif",
            color: '#d1a058',
            textShadow:
              '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(209, 160, 88, 0.2)',
          }}
        >
          Contact Us
        </h2>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto opacity-0"
        >
          <div className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block mb-2 text-white"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
              >
                Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none transition-all"
                style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-white"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none transition-all"
                style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block mb-2 text-white"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full px-4 py-3 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none transition-all"
                style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block mb-2 text-white"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
              >
                Message *
              </label>
              <textarea
                id="message"
                required
                rows={6}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full px-4 py-3 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none transition-all resize-none"
                style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-4 text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-4 text-green-300">
                Message sent successfully! We&apos;ll get back to you soon.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-lg font-semibold uppercase transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
                backgroundColor: '#d1a058',
                color: '#000',
                boxShadow: '0 4px 15px rgba(209, 160, 88, 0.3)',
              }}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
