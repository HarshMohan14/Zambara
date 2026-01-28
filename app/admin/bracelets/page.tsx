'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'

interface Bracelet {
  id: string
  name: string
  description?: string
  element: string
  rarity: string
  image?: string
  createdAt: string
}

export default function AdminBracelets() {
  const [bracelets, setBracelets] = useState<Bracelet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBracelets()
  }, [])

  const fetchBracelets = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getBracelets({ limit: 100 })
      if (response.success && response.data) {
        // Handle both array response and object with bracelets property
        const braceletsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any)?.bracelets || []
        setBracelets(braceletsData)
      } else {
        console.error('Failed to fetch bracelets:', response.error)
        setBracelets([])
      }
    } catch (error) {
      console.error('Error fetching bracelets:', error)
      setBracelets([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1
        className="text-2xl md:text-3xl font-bold uppercase mb-6 md:mb-8"
        style={{
          fontFamily: "'TheWalkyrDemo', serif",
          color: '#d1a058',
        }}
      >
        Manage Bracelets
      </h1>

      {loading ? (
        <div className="text-[#d1a058]">Loading bracelets...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {bracelets.map((bracelet) => (
            <div
              key={bracelet.id}
              className="bg-black/60 border-2 border-[#d1a058]/30 rounded-lg p-4 md:p-6 hover:border-[#d1a058]/60 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3
                    className="text-xl font-bold text-white mb-2"
                    style={{
                      fontFamily: "'BlinkerSemiBold', sans-serif",
                    }}
                  >
                    {bracelet.name}
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-[#d1a058]/20 border border-[#d1a058]/30 rounded text-[#d1a058] text-xs uppercase">
                      {bracelet.element}
                    </span>
                    <span className="px-2 py-1 bg-[#d1a058]/20 border border-[#d1a058]/30 rounded text-[#d1a058] text-xs uppercase">
                      {bracelet.rarity}
                    </span>
                  </div>
                </div>
              </div>
              {bracelet.description && (
                <p className="text-white/60 text-sm mb-4">{bracelet.description}</p>
              )}
              {bracelet.image && (
                <div className="mb-4">
                  <img
                    src={bracelet.image}
                    alt={bracelet.name}
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}
              <div className="text-xs text-white/40">
                Created: {new Date(bracelet.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {bracelets.length === 0 && (
            <div className="col-span-full text-center text-white/60 p-8">
              No bracelets found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
