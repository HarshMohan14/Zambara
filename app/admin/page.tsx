'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    games: 0,
    scores: 0,
    events: 0,
    hosts: 0,
    bookings: 0,
    preBookings: 0,
    contacts: 0,
    newsletter: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const [gamesRes, scoresRes, eventsRes, hostsRes, bookingsRes, preBookingsRes, contactsRes, newsletterRes] = await Promise.all([
        apiClient.getGames({ limit: 1 }),
        apiClient.getScores({ limit: 1 }),
        apiClient.getEvents({ limit: 1 }),
        apiClient.getHosts({ limit: 1 }),
        apiClient.getBookings({ limit: 1 }),
        apiClient.getPreBookings({ limit: 1 }),
        apiClient.getContactMessages({ limit: 1 }),
        apiClient.getNewsletterSubscribers({ limit: 1 }),
      ])

      console.log('Dashboard stats responses:', {
        games: gamesRes,
        scores: scoresRes,
        events: eventsRes,
        hosts: hostsRes,
        bookings: bookingsRes,
        preBookings: preBookingsRes,
        contacts: contactsRes,
        newsletter: newsletterRes,
      })

      const gamesData = gamesRes.data as { total?: number } | undefined
      const scoresData = scoresRes.data as { total?: number } | undefined
      const eventsData = eventsRes.data as { total?: number } | undefined
      const hostsData = hostsRes.data as { total?: number } | undefined
      const bookingsData = bookingsRes.data as { total?: number } | undefined
      const preBookingsData = preBookingsRes.data as { total?: number } | undefined
      const contactsData = contactsRes.data as { total?: number } | undefined
      const newsletterData = newsletterRes.data as { total?: number } | undefined
      
      setStats({
        games: gamesData?.total || 0,
        scores: scoresData?.total || 0,
        events: eventsData?.total || 0,
        hosts: hostsData?.total || 0,
        bookings: bookingsData?.total || 0,
        preBookings: preBookingsData?.total || 0,
        contacts: contactsData?.total || 0,
        newsletter: newsletterData?.total || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    // Listen for refresh events from other pages
    const handleRefresh = () => {
      fetchStats()
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('refreshDashboard', handleRefresh)
      return () => {
        window.removeEventListener('refreshDashboard', handleRefresh)
      }
    }
  }, [])

  const statCards = [
    {
      title: 'Games',
      value: stats.games,
      color: '#d1a058',
      icon: '🎮',
    },
    {
      title: 'Scores',
      value: stats.scores,
      color: '#d1a058',
      icon: '🏆',
    },
    {
      title: 'Events',
      value: stats.events,
      color: '#d1a058',
      icon: '🎪',
    },
    {
      title: 'Hosts',
      value: stats.hosts,
      color: '#d1a058',
      icon: '👤',
    },
    {
      title: 'Bookings',
      value: stats.bookings,
      color: '#d1a058',
      icon: '📅',
    },
    {
      title: 'Pre-Bookings',
      value: stats.preBookings,
      color: '#d1a058',
      icon: '📋',
    },
    {
      title: 'Contact Messages',
      value: stats.contacts,
      color: '#d1a058',
      icon: '📧',
    },
    {
      title: 'Newsletter Subscribers',
      value: stats.newsletter,
      color: '#d1a058',
      icon: '📬',
    },
  ]

  return (
    <div>
      <h1
        className="text-2xl md:text-3xl font-bold uppercase mb-6 md:mb-8"
        style={{
          fontFamily: "'TheWalkyrDemo', serif",
          color: '#d1a058',
        }}
      >
        Admin Dashboard
      </h1>

      {loading ? (
        <div className="text-[#d1a058]">Loading statistics...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-black/60 border-2 border-[#d1a058]/30 rounded-lg p-6 hover:border-[#d1a058]/60 transition-all"
              style={{
                boxShadow: '0 4px 15px rgba(209, 160, 88, 0.1)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">{stat.icon}</div>
                <div
                  className="text-3xl font-bold"
                  style={{
                    fontFamily: "'TheWalkyrDemo', serif",
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </div>
              </div>
              <div
                className="text-lg font-semibold text-white"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
              >
                {stat.title}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 md:mt-8 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg p-4 md:p-6">
        <h2
          className="text-lg md:text-xl font-bold uppercase mb-4"
          style={{
            fontFamily: "'TheWalkyrDemo', serif",
            color: '#d1a058',
          }}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <a
            href="/admin/games"
            className="block p-4 bg-[#d1a058]/10 border border-[#d1a058]/30 rounded-lg hover:bg-[#d1a058]/20 transition-all"
          >
            <div
              className="font-semibold text-white"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
            >
              Manage Games
            </div>
            <div
              className="text-sm text-white/60 mt-1"
              style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
            >
              Create and edit games
            </div>
          </a>
          <a
            href="/admin/scores"
            className="block p-4 bg-[#d1a058]/10 border border-[#d1a058]/30 rounded-lg hover:bg-[#d1a058]/20 transition-all"
          >
            <div
              className="font-semibold text-white"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
            >
              View Scores
            </div>
            <div
              className="text-sm text-white/60 mt-1"
              style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
            >
              Monitor player scores
            </div>
          </a>
          <a
            href="/admin/contact"
            className="block p-4 bg-[#d1a058]/10 border border-[#d1a058]/30 rounded-lg hover:bg-[#d1a058]/20 transition-all"
          >
            <div
              className="font-semibold text-white"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
            >
              Contact Messages
            </div>
            <div
              className="text-sm text-white/60 mt-1"
              style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
            >
              View contact form submissions
            </div>
          </a>
          <a
            href="/admin/bookings"
            className="block p-4 bg-[#d1a058]/10 border border-[#d1a058]/30 rounded-lg hover:bg-[#d1a058]/20 transition-all"
          >
            <div
              className="font-semibold text-white"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
            >
              Bookings
            </div>
            <div
              className="text-sm text-white/60 mt-1"
              style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
            >
              Manage bookings
            </div>
          </a>
          <a
            href="/admin/events"
            className="block p-4 bg-[#d1a058]/10 border border-[#d1a058]/30 rounded-lg hover:bg-[#d1a058]/20 transition-all"
          >
            <div
              className="font-semibold text-white"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
            >
              Events
            </div>
            <div
              className="text-sm text-white/60 mt-1"
              style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
            >
              Manage events
            </div>
          </a>
          <a
            href="/admin/hosts"
            className="block p-4 bg-[#d1a058]/10 border border-[#d1a058]/30 rounded-lg hover:bg-[#d1a058]/20 transition-all"
          >
            <div
              className="font-semibold text-white"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
            >
              Hosts
            </div>
            <div
              className="text-sm text-white/60 mt-1"
              style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
            >
              Manage hosts
            </div>
          </a>
          <a
            href="/admin/pre-bookings"
            className="block p-4 bg-[#d1a058]/10 border border-[#d1a058]/30 rounded-lg hover:bg-[#d1a058]/20 transition-all"
          >
            <div
              className="font-semibold text-white"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
            >
              Pre-Bookings
            </div>
            <div
              className="text-sm text-white/60 mt-1"
              style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
            >
              Manage pre-bookings
            </div>
          </a>
          <a
            href="/admin/newsletter"
            className="block p-4 bg-[#d1a058]/10 border border-[#d1a058]/30 rounded-lg hover:bg-[#d1a058]/20 transition-all"
          >
            <div
              className="font-semibold text-white"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
            >
              Newsletter
            </div>
            <div
              className="text-sm text-white/60 mt-1"
              style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
            >
              Manage newsletter subscribers
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
