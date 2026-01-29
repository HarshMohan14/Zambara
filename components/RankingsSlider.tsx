'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface RankingEntry {
  id: string
  rank: number
  playerName: string
  time: number
  createdAt?: string
}

interface EventWithTop5 {
  event: { id: string; name: string; [key: string]: unknown }
  rankings: RankingEntry[]
}

const AUTO_PLAY_INTERVAL = 4000
const MIN_SWIPE_DISTANCE = 50

export function RankingsSlider() {
  const [items, setItems] = useState<EventWithTop5[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<EventWithTop5 | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [mounted, setMounted] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [translateX, setTranslateX] = useState(0)

  useEffect(() => {
    async function fetchData() {
      try {
        const eventsRes = await fetch('/api/events?limit=50')
        const eventsData = await eventsRes.json()
        if (!eventsData.success || !eventsData.data?.events?.length) {
          setItems([])
          setLoading(false)
          return
        }
        const events = eventsData.data.events as { id: string; name: string }[]
        const withRankings = await Promise.all(
          events.map(async (ev) => {
            const rRes = await fetch(
              `/api/rankings?eventId=${encodeURIComponent(ev.id)}&page=1&pageSize=5`
            )
            const rData = await rRes.json()
            const rankings: RankingEntry[] = rData.success && rData.data?.rankings
              ? rData.data.rankings
              : []
            return { event: ev, rankings }
          })
        )
        setItems(withRankings)
      } catch (e) {
        console.error('RankingsSlider fetch error:', e)
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true)
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setTimeout(() => setIsPaused(false), AUTO_PLAY_INTERVAL)
      return
    }
    const distance = touchStart - touchEnd
    if (distance > MIN_SWIPE_DISTANCE) {
      setCurrentIndex((prev) => (prev + 1) % Math.max(1, items.length))
    }
    if (distance < -MIN_SWIPE_DISTANCE) {
      setCurrentIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length))
    }
    setTimeout(() => setIsPaused(false), AUTO_PLAY_INTERVAL)
  }

  const goToSlide = (index: number) => {
    setIsPaused(true)
    setCurrentIndex(index)
    setTimeout(() => setIsPaused(false), AUTO_PLAY_INTERVAL)
  }

  const goToPrevious = () => {
    if (items.length === 0) return
    setIsPaused(true)
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
    setTimeout(() => setIsPaused(false), AUTO_PLAY_INTERVAL)
  }

  const goToNext = () => {
    if (items.length === 0) return
    setIsPaused(true)
    setCurrentIndex((prev) => (prev + 1) % items.length)
    setTimeout(() => setIsPaused(false), AUTO_PLAY_INTERVAL)
  }

  const handleSlideClick = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const item = items[index]
    if (item) {
      setSelectedItem(item)
      setShowModal(true)
      setIsPaused(true)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedItem(null)
    setIsPaused(false)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (items.length === 0 || !sliderRef.current || !containerRef.current) {
      setTranslateX(0)
      return
    }
    const sliderWidth = sliderRef.current.offsetWidth
    const slideWidth = sliderWidth * 0.75
    const gap = sliderWidth * 0.05
    const totalSlideWidth = slideWidth + gap
    const newTranslateX =
      sliderWidth / 2 - slideWidth / 2 - currentIndex * totalSlideWidth
    setTranslateX(newTranslateX)
  }, [currentIndex, items.length])

  useEffect(() => {
    if (items.length === 0 || isPaused) {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
        autoPlayTimerRef.current = null
      }
      return
    }
    autoPlayTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, AUTO_PLAY_INTERVAL)
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
        autoPlayTimerRef.current = null
      }
    }
  }, [isPaused, items.length])

  useEffect(() => {
    if (!sliderRef.current || !containerRef.current || items.length === 0) return
    const slider = sliderRef.current
    const container = containerRef.current
    const updateLayout = () => {
      const sliderWidth = slider.offsetWidth
      const slideWidth = sliderWidth * 0.75
      const gap = sliderWidth * 0.05
      container.style.gap = `${gap}px`
      Array.from(container.children).forEach((el) => {
        if (el instanceof HTMLElement) el.style.width = `${slideWidth}px`
      })
      const totalSlideWidth = slideWidth + gap
      setTranslateX(
        sliderWidth / 2 - slideWidth / 2 - currentIndex * totalSlideWidth
      )
    }
    updateLayout()
    window.addEventListener('resize', updateLayout)
    return () => window.removeEventListener('resize', updateLayout)
  }, [items.length, currentIndex])

  if (loading) {
    return (
      <section
        id="rankings"
        ref={sectionRef}
        className="relative w-full bg-black py-8 md:py-12 overflow-hidden"
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
            Event Rankings
          </h2>
          <div className="flex justify-center py-16">
            <p
              className="text-lg uppercase tracking-wider"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
                color: '#d1a058',
              }}
            >
              Loading rankings…
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section
        id="rankings"
        ref={sectionRef}
        className="relative w-full bg-black py-8 md:py-12 overflow-hidden"
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
            Event Rankings
          </h2>
          <div className="flex justify-center py-16">
            <p
              className="text-white/70 text-center"
              style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
            >
              No event rankings yet. Complete games to see top players here.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      id="rankings"
      ref={sectionRef}
      className="relative w-full bg-black py-8 md:py-12 overflow-hidden"
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
          Event Rankings
        </h2>
        <p
          className="text-center text-white/70 mb-10 max-w-2xl mx-auto"
          style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
        >
          Top 5 players per event by fastest time. Click a card to see full ranking.
        </p>

        <div
          ref={sliderRef}
          className="relative w-full overflow-visible min-h-[320px]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={containerRef}
            className="flex items-stretch transition-transform ease-in-out duration-300"
            style={{
              transform: `translateX(${translateX}px)`,
              willChange: 'transform',
            }}
          >
            {items.map((item, index) => {
              const isActive = index === currentIndex
              return (
                <div
                  key={item.event.id}
                  className="flex-shrink-0 cursor-pointer"
                  style={{ minHeight: '280px' }}
                  onClick={(e) => handleSlideClick(index, e)}
                  onTouchEnd={(e) => {
                    if (
                      touchStart != null &&
                      touchEnd != null &&
                      Math.abs(touchStart - touchEnd) < 10
                    ) {
                      handleSlideClick(index, e)
                    }
                  }}
                >
                  <div
                    className="h-full rounded-lg border-2 transition-all duration-300 flex flex-col p-6"
                    style={{
                      borderColor: isActive ? '#d1a058' : 'rgba(209, 160, 88, 0.3)',
                      backgroundColor: isActive
                        ? 'rgba(209, 160, 88, 0.08)'
                        : 'rgba(0, 0, 0, 0.6)',
                      boxShadow: isActive
                        ? '0 0 24px rgba(209, 160, 88, 0.25), inset 0 0 20px rgba(209, 160, 88, 0.06)'
                        : '0 4px 12px rgba(0, 0, 0, 0.4)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#d1a058'
                      e.currentTarget.style.backgroundColor = 'rgba(209, 160, 88, 0.1)'
                      e.currentTarget.style.boxShadow =
                        '0 0 24px rgba(209, 160, 88, 0.25), inset 0 0 20px rgba(209, 160, 88, 0.06)'
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'rgba(209, 160, 88, 0.3)'
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)'
                      }
                    }}
                  >
                    <h3
                      className="text-xl md:text-2xl font-bold uppercase mb-4 line-clamp-2"
                      style={{
                        fontFamily: "'TheWalkyrDemo', serif",
                        color: '#d1a058',
                        textShadow: '0 0 12px rgba(209, 160, 88, 0.3)',
                      }}
                    >
                      {item.event.name}
                    </h3>
                    <div
                      className="w-12 border-t border-[#d1a058]/60 mb-4"
                      style={{ opacity: 0.8 }}
                    />
                    <div className="flex-1 space-y-2">
                      {item.rankings.length === 0 ? (
                        <p
                          className="text-white/50 text-sm"
                          style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
                        >
                          No rankings yet
                        </p>
                      ) : (
                        item.rankings.slice(0, 5).map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between text-sm"
                            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
                          >
                            <span className="text-[#d1a058] font-semibold w-6">
                              #{r.rank}
                            </span>
                            <span className="text-white/90 truncate flex-1 mx-2">
                              {r.playerName || '—'}
                            </span>
                            <span className="text-white/70 whitespace-nowrap">
                              {r.time != null ? `${r.time}s` : '—'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    {isActive && (
                      <div className="mt-4 pt-3 border-t border-[#d1a058]/30">
                        <p
                          className="text-xs uppercase tracking-wider text-center"
                          style={{
                            fontFamily: "'BlinkerSemiBold', sans-serif",
                            color: '#d1a058',
                            opacity: 0.9,
                          }}
                        >
                          Click to view full ranking
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#d1a058]/50 bg-black/70 text-[#d1a058] hover:bg-[#d1a058]/20 hover:border-[#d1a058] transition-all opacity-0 md:opacity-100"
            aria-label="Previous"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#d1a058]/50 bg-black/70 text-[#d1a058] hover:bg-[#d1a058]/20 hover:border-[#d1a058] transition-all opacity-0 md:opacity-100"
            aria-label="Next"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'bg-[#d1a058] w-8 h-2'
                  : 'bg-white/40 w-2 h-2 hover:bg-[#d1a058]/60'
              }`}
              aria-label={`Go to event ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Modal: event + full top 5 ranking */}
      {mounted &&
        showModal &&
        selectedItem &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            onClick={handleCloseModal}
          >
            <div
              className="relative w-full max-w-lg rounded-lg border-2 border-[#d1a058] p-6 md:p-8 bg-black overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              style={{
                boxShadow:
                  '0 0 40px rgba(209, 160, 88, 0.3), inset 0 0 20px rgba(209, 160, 88, 0.08)',
              }}
            >
              <button
                type="button"
                onClick={handleCloseModal}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#d1a058] bg-black/80 text-[#d1a058] hover:bg-[#d1a058] hover:text-black transition-all"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3
                className="text-2xl md:text-3xl font-bold uppercase pr-12 mb-6"
                style={{
                  fontFamily: "'TheWalkyrDemo', serif",
                  color: '#d1a058',
                  textShadow: '0 0 16px rgba(209, 160, 88, 0.3)',
                }}
              >
                {selectedItem.event.name}
              </h3>
              <div className="w-20 border-t border-[#d1a058]/60 mb-6" />

              {selectedItem.rankings.length === 0 ? (
                <p
                  className="text-white/60 py-4"
                  style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
                >
                  No rankings for this event yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#d1a058]/40">
                        <th
                          className="text-left py-3 pr-4 text-sm uppercase"
                          style={{
                            fontFamily: "'BlinkerSemiBold', sans-serif",
                            color: '#d1a058',
                          }}
                        >
                          Rank
                        </th>
                        <th
                          className="text-left py-3 pr-4 text-sm uppercase"
                          style={{
                            fontFamily: "'BlinkerSemiBold', sans-serif",
                            color: '#d1a058',
                          }}
                        >
                          Player
                        </th>
                        <th
                          className="text-right py-3 text-sm uppercase"
                          style={{
                            fontFamily: "'BlinkerSemiBold', sans-serif",
                            color: '#d1a058',
                          }}
                        >
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItem.rankings.map((r) => (
                        <tr
                          key={r.id}
                          className="border-b border-white/10 hover:bg-[#d1a058]/5"
                          style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
                        >
                          <td className="py-3 pr-4 font-semibold text-[#d1a058]">
                            #{r.rank}
                          </td>
                          <td className="py-3 pr-4 text-white/90">{r.playerName || '—'}</td>
                          <td className="py-3 text-right text-white/80">
                            {r.time != null ? `${r.time}s` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </section>
  )
}
