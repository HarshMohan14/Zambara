'use client'

import { useRouter } from 'next/navigation'

interface AdminHeaderProps {
  onMenuClick?: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const router = useRouter()

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <header
      className="bg-black/80 border-b-2 border-[#d1a058]/30 p-3 md:p-4 flex items-center justify-between sticky top-0 z-30"
      style={{
        boxShadow: '0 2px 10px rgba(209, 160, 88, 0.1)',
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-white/80 hover:text-white p-2 -ml-2"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <div
            className="text-xs md:text-sm text-white/60"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
          >
            Admin Panel
          </div>
          <div
            className="text-base md:text-lg font-semibold text-[#d1a058]"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
          >
            Zambara Management
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={handleGoHome}
          className="px-3 md:px-4 py-1.5 md:py-2 bg-[#d1a058] text-black rounded-lg font-semibold uppercase transition-all hover:scale-105 text-xs md:text-sm"
          style={{
            fontFamily: "'BlinkerSemiBold', sans-serif",
            boxShadow: '0 4px 15px rgba(209, 160, 88, 0.3)',
          }}
        >
          <span className="hidden sm:inline">Back to Site</span>
          <span className="sm:hidden">Home</span>
        </button>
      </div>
    </header>
  )
}
