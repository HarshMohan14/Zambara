'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/games', label: 'Games', icon: '🎮' },
  { href: '/admin/scores', label: 'Scores', icon: '🏆' },
  { href: '/admin/leaderboard', label: 'Leaderboard', icon: '📈' },
  { href: '/admin/bracelets', label: 'Bracelets', icon: '💎' },
  { href: '/admin/contact', label: 'Contact', icon: '📧' },
  { href: '/admin/newsletter', label: 'Newsletter', icon: '📬' },
]

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  const handleLinkClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-black/95 md:bg-black/80 border-r-2 border-[#d1a058]/30 min-h-screen p-4 md:p-6 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          boxShadow: '4px 0 20px rgba(209, 160, 88, 0.1)',
        }}
      >
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1
              className="text-xl md:text-2xl font-bold uppercase"
              style={{
                fontFamily: "'TheWalkyrDemo', serif",
                color: '#d1a058',
              }}
            >
              Admin Panel
            </h1>
            <button
              onClick={onClose}
              className="md:hidden text-white/60 hover:text-white p-2"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div
            className="text-xs md:text-sm text-white/60"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
          >
            Zambara Management
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#d1a058]/20 border-2 border-[#d1a058]'
                    : 'hover:bg-[#d1a058]/10 border-2 border-transparent'
                }`}
                style={{
                  fontFamily: "'BlinkerSemiBold', sans-serif",
                  color: isActive ? '#d1a058' : '#ffffff',
                }}
              >
                <span className="text-lg md:text-xl">{item.icon}</span>
                <span className="text-sm md:text-base">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-[#d1a058]/20">
          <Link
            href="/"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg hover:bg-[#d1a058]/10 transition-all"
            style={{
              fontFamily: "'BlinkerRegular', sans-serif",
              color: '#ffffff',
            }}
          >
            <span>←</span>
            <span className="text-sm md:text-base">Back to Site</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
