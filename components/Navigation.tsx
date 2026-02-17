'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { gsap, createTimeline, ScrollTrigger } from '@/lib/gsap'
import Link from 'next/link'

// Navigation links configuration
// `homeHref` is used on the homepage (hash anchors)
// `globalHref` is used on other pages (full paths)
interface NavLink {
  label: string
  homeHref: string
  globalHref: string
  isPage?: boolean // true = uses Next.js Link for client-side navigation
  highlight?: 'gold' | 'teal'
}

const NAV_LINKS: NavLink[] = [
  { label: 'Home', homeHref: '#hero', globalHref: '/', isPage: true },
  { label: 'Game Cards', homeHref: '#cards', globalHref: '/#cards' },
  { label: 'Battle Pack', homeHref: '#battle-pack', globalHref: '/#battle-pack' },
  { label: 'Pre-Book', homeHref: '#cave', globalHref: '/#cave' },
  { label: 'How to Play', homeHref: '/how-to-play', globalHref: '/how-to-play', isPage: true },
  { label: 'Beach Battle', homeHref: '/beach-battle', globalHref: '/beach-battle', isPage: true, highlight: 'teal' },
  { label: 'Rankings', homeHref: '#rankings', globalHref: '/#rankings' },
  { label: 'Contact', homeHref: '#contact', globalHref: '/#contact' },
]

// Beach Battle page-specific links (shown when on /beach-battle)
const BEACH_BATTLE_LINKS: NavLink[] = [
  { label: 'Home', homeHref: '/', globalHref: '/', isPage: true },
  { label: 'The Tribes', homeHref: '#tribes', globalHref: '#tribes' },
  { label: 'How It Works', homeHref: '#battle-works', globalHref: '#battle-works' },
  { label: 'Register', homeHref: '#qr-register', globalHref: '#qr-register', highlight: 'teal' },
  { label: 'Tournament', homeHref: '#bracket', globalHref: '#bracket' },
  { label: 'How to Play', homeHref: '/how-to-play', globalHref: '/how-to-play', isPage: true },
  { label: 'Game Cards', homeHref: '/#cards', globalHref: '/#cards' },
]

export function Navigation() {
  const navRef = useRef<HTMLElement>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const sideNavRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const isBeachBattle = pathname === '/beach-battle'
  const isHomePage = pathname === '/'

  // Choose the right link set based on current page
  const links = isBeachBattle ? BEACH_BATTLE_LINKS : NAV_LINKS

  // Resolve the correct href based on current page
  const getHref = (link: NavLink) => {
    if (isHomePage) return link.homeHref
    return link.globalHref
  }

  // Determine highlight color
  const getLinkColor = (link: NavLink) => {
    if (link.highlight === 'teal') return '#06b6d4'
    return '#d1a058'
  }

  const getLinkHoverBg = (link: NavLink) => {
    if (link.highlight === 'teal') return 'rgba(6, 182, 212, 0.1)'
    return 'rgba(209, 160, 88, 0.1)'
  }

  const getLinkHoverBorder = (link: NavLink) => {
    if (link.highlight === 'teal') return '#06b6d4'
    return '#d1a058'
  }

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
      const heroSection = document.getElementById('hero') || document.getElementById('beach-hero')
      if (heroSection) {
        ScrollTrigger.create({
          trigger: heroSection,
          start: 'bottom top',
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

  // Set initial state and animate side navigation
  useEffect(() => {
    if (!sideNavRef.current) return

    // Set initial hidden state immediately (before any animation)
    gsap.set(sideNavRef.current, {
      x: '100%',
      opacity: 0,
      visibility: 'hidden',
      pointerEvents: 'none',
    })

    const ctx = gsap.context(() => {
      if (isMenuOpen) {
        gsap.to(sideNavRef.current, {
          x: 0,
          opacity: 1,
          visibility: 'visible',
          pointerEvents: 'auto',
          duration: 0.4,
          ease: 'power2.out',
        })
      } else {
        gsap.to(sideNavRef.current, {
          x: '100%',
          opacity: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
          duration: 0.3,
          ease: 'power2.in',
        })
      }
    }, sideNavRef)

    return () => {
      ctx.revert()
    }
  }, [isMenuOpen])

  const renderLink = (link: NavLink) => {
    const href = getHref(link)
    const color = getLinkColor(link)
    const hoverBg = getLinkHoverBg(link)
    const hoverBorder = getLinkHoverBorder(link)

    const sharedProps = {
      onClick: () => setIsMenuOpen(false),
      className: 'block py-3 px-4 rounded-lg transition-all duration-300 uppercase tracking-wide',
      style: {
        fontFamily: "'TheWalkyrDemo', serif",
        color,
        border: '2px solid transparent',
      } as React.CSSProperties,
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.backgroundColor = hoverBg
        e.currentTarget.style.borderColor = hoverBorder
        e.currentTarget.style.transform = 'translateX(8px)'
      },
      onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.borderColor = 'transparent'
        e.currentTarget.style.transform = 'translateX(0)'
      },
    }

    // For page-level routes or cross-page hash links, use Link for proper client navigation
    if (link.isPage || (href.startsWith('/') && !href.startsWith('#'))) {
      return (
        <Link key={link.label} href={href} {...sharedProps}>
          {link.label}
        </Link>
      )
    }

    // For same-page hash anchors
    return (
      <a key={link.label} href={href} {...sharedProps}>
        {link.label}
      </a>
    )
  }

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
          {/* Logo — links to home */}
          <Link href="/" className="flex items-center">
            <Image
              src="/Zambaara.png"
              alt="ZAMBAARA"
              width={200}
              height={80}
              className="h-8 md:h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Right side - Menu */}
          <div className="flex items-center gap-4">
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
        </div>
      </nav>

      {/* Side Navigation Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          onClick={() => setIsMenuOpen(false)}
          style={{ top: '73px' }}
        />
      )}

      {/* Side Navigation Panel */}
      <div
        ref={sideNavRef}
        className="fixed top-0 right-0 h-full w-80 bg-black border-l-2 border-[#d1a058] z-50 overflow-y-auto"
        style={{
          top: '73px',
          boxShadow: '-4px 0 20px rgba(209, 160, 88, 0.2)',
          transform: 'translateX(100%)',
          opacity: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div className="p-8">
          {/* Page indicator */}
          {isBeachBattle && (
            <div className="mb-4 px-4">
              <span className="text-[10px] uppercase tracking-[0.3em]"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6, 182, 212, 0.5)' }}>
                Beach Battle
              </span>
            </div>
          )}

          {/* Navigation Links — context-aware */}
          <nav className="mt-8 space-y-6">
            {links.map(renderLink)}
          </nav>
        </div>
      </div>
    </>
  )
}
