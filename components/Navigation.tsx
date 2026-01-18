'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap, createTimeline, ScrollTrigger } from '@/lib/gsap'

export function Navigation() {
  const navRef = useRef<HTMLElement>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const sideNavRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!navRef.current) return

    const ctx = gsap.context(() => {
      // Initial state - completely hidden and not interactable
      gsap.set(navRef.current, {
        opacity: 0,
        y: -20,
        visibility: 'hidden',
        pointerEvents: 'none',
      })

      // Create scroll trigger to fade in navigation when leaving hero section
      const heroSection = document.getElementById('hero')
      if (heroSection) {
        ScrollTrigger.create({
          trigger: heroSection,
          start: 'bottom top', // When bottom of hero reaches top of viewport
          end: 'bottom top',
          onEnter: () => {
            if (navRef.current) {
              gsap.to(navRef.current, {
                opacity: 1,
                y: 0,
                visibility: 'visible',
                pointerEvents: 'auto',
                duration: 0.6,
                ease: 'power2.out',
              })
            }
          },
          onLeaveBack: () => {
            if (navRef.current) {
              gsap.to(navRef.current, {
                opacity: 0,
                y: -20,
                visibility: 'hidden',
                pointerEvents: 'none',
                duration: 0.4,
                ease: 'power2.in',
              })
            }
          },
        })
      } else {
        // Fallback: use window scroll if hero section not found
        const handleScroll = () => {
          if (window.scrollY > window.innerHeight - 100) {
            if (navRef.current) {
              gsap.to(navRef.current, {
                opacity: 1,
                y: 0,
                visibility: 'visible',
                pointerEvents: 'auto',
                duration: 0.6,
                ease: 'power2.out',
              })
            }
          } else {
            if (navRef.current) {
              gsap.to(navRef.current, {
                opacity: 0,
                y: -20,
                visibility: 'hidden',
                pointerEvents: 'none',
                duration: 0.4,
                ease: 'power2.in',
              })
            }
          }
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
      }
    }, navRef)

    return () => {
      ctx.revert()
    }
  }, [])

  // Animate side navigation
  useEffect(() => {
    if (!sideNavRef.current) return

    const ctx = gsap.context(() => {
      if (isMenuOpen) {
        gsap.fromTo(
          sideNavRef.current,
          { x: '100%', opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
          }
        )
      } else {
        gsap.to(sideNavRef.current, {
          x: '100%',
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        })
      }
    }, sideNavRef)

    return () => {
      ctx.revert()
    }
  }, [isMenuOpen])

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#d1a058]/30"
        style={{
          boxShadow: '0 4px 20px rgba(209, 160, 88, 0.1)',
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/Zambaara.png"
              alt="ZAMBAARA"
              width={200}
              height={80}
              className="h-8 md:h-12 w-auto object-contain"
              priority
            />
          </div>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg transition-all duration-300 hover:bg-[#d1a058]/20"
            aria-label="Toggle menu"
            style={{
              border: '2px solid #d1a058',
              color: '#d1a058',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(209, 160, 88, 0.2)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Side Navigation Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          onClick={() => setIsMenuOpen(false)}
          style={{ top: '73px' }} // Below navigation bar
        />
      )}

      {/* Side Navigation Panel */}
      <div
        ref={sideNavRef}
        className="fixed top-0 right-0 h-full w-80 bg-black border-l-2 border-[#d1a058] z-50 overflow-y-auto"
        style={{
          top: '73px', // Below navigation bar
          boxShadow: '-4px 0 20px rgba(209, 160, 88, 0.2)',
        }}
      >
        <div className="p-8">
          {/* Navigation Links */}
          <nav className="mt-12 space-y-6">
            <a
              href="#hero"
              onClick={() => setIsMenuOpen(false)}
              className="block py-3 px-4 rounded-lg transition-all duration-300 uppercase tracking-wide"
              style={{
                fontFamily: "'TheWalkyrDemo', serif",
                color: '#d1a058',
                border: '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(209, 160, 88, 0.1)'
                e.currentTarget.style.borderColor = '#d1a058'
                e.currentTarget.style.transform = 'translateX(8px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
            >
              Home
            </a>
            <a
              href="#cards"
              onClick={() => setIsMenuOpen(false)}
              className="block py-3 px-4 rounded-lg transition-all duration-300 uppercase tracking-wide"
              style={{
                fontFamily: "'TheWalkyrDemo', serif",
                color: '#d1a058',
                border: '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(209, 160, 88, 0.1)'
                e.currentTarget.style.borderColor = '#d1a058'
                e.currentTarget.style.transform = 'translateX(8px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
            >
              Game Cards
            </a>
            <a
              href="#battle-pack"
              onClick={() => setIsMenuOpen(false)}
              className="block py-3 px-4 rounded-lg transition-all duration-300 uppercase tracking-wide"
              style={{
                fontFamily: "'TheWalkyrDemo', serif",
                color: '#d1a058',
                border: '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(209, 160, 88, 0.1)'
                e.currentTarget.style.borderColor = '#d1a058'
                e.currentTarget.style.transform = 'translateX(8px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
            >
              Battle Pack
            </a>
            <a
              href="#cave"
              onClick={() => setIsMenuOpen(false)}
              className="block py-3 px-4 rounded-lg transition-all duration-300 uppercase tracking-wide"
              style={{
                fontFamily: "'TheWalkyrDemo', serif",
                color: '#d1a058',
                border: '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(209, 160, 88, 0.1)'
                e.currentTarget.style.borderColor = '#d1a058'
                e.currentTarget.style.transform = 'translateX(8px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
            >
              Pre-Book
            </a>
            <a
              href="https://zambaara.com/howtoplay"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className="block py-3 px-4 rounded-lg transition-all duration-300 uppercase tracking-wide"
              style={{
                fontFamily: "'TheWalkyrDemo', serif",
                color: '#d1a058',
                border: '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(209, 160, 88, 0.1)'
                e.currentTarget.style.borderColor = '#d1a058'
                e.currentTarget.style.transform = 'translateX(8px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
            >
              How to Play
            </a>
          </nav>
        </div>
      </div>
    </>
  )
}
