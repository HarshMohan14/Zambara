'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api-client'

export default function DeleteAllData() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDeleteAll = async () => {
    const confirmed = confirm(
      '⚠️ WARNING: This will delete ALL data from ALL collections!\n\n' +
      'This includes:\n' +
      '- Games\n' +
      '- Scores\n' +
      '- Bracelets\n' +
      '- Events\n' +
      '- Hosts\n' +
      '- Contact Messages\n' +
      '- Newsletter Subscribers\n' +
      '- Bookings\n' +
      '- Pre-Bookings\n\n' +
      'This action CANNOT be undone!\n\n' +
      'Are you absolutely sure you want to proceed?'
    )

    if (!confirmed) return

    const doubleConfirm = confirm(
      '⚠️ FINAL WARNING ⚠️\n\n' +
      'You are about to PERMANENTLY DELETE ALL DATA.\n\n' +
      'Type "DELETE ALL" in the next prompt to confirm.'
    )

    if (!doubleConfirm) return

    const finalConfirm = prompt('Type "DELETE ALL" to confirm:')
    if (finalConfirm !== 'DELETE ALL') {
      alert('Deletion cancelled. Data is safe.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const response = await fetch('/api/admin/delete-all-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        alert(`✅ Successfully deleted ${data.data.totalDeleted} document(s)!`)
      } else {
        setError(data.error || 'Failed to delete data')
        alert(`❌ Error: ${data.error || 'Failed to delete data'}`)
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'An unexpected error occurred'
      setError(errorMsg)
      alert(`❌ Error: ${errorMsg}`)
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
        Delete All Data
      </h1>

      <div className="bg-red-500/20 border-2 border-red-500/50 rounded-lg p-6 mb-6">
        <h2
          className="text-xl font-bold text-red-400 mb-4"
          style={{
            fontFamily: "'BlinkerSemiBold', sans-serif",
          }}
        >
          ⚠️ DANGER ZONE ⚠️
        </h2>
        <p className="text-white/80 mb-4" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
          This action will permanently delete ALL data from ALL collections:
        </p>
        <ul className="list-disc list-inside text-white/70 mb-4 space-y-1" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
          <li>Games</li>
          <li>Scores</li>
          <li>Bracelets</li>
          <li>User Bracelets</li>
          <li>Events</li>
          <li>Hosts</li>
          <li>Contact Messages</li>
          <li>Newsletter Subscribers</li>
          <li>Bookings</li>
          <li>Pre-Bookings</li>
        </ul>
        <p className="text-red-300 font-semibold" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
          This action CANNOT be undone!
        </p>
      </div>

      <button
        onClick={handleDeleteAll}
        disabled={loading}
        className="px-8 py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all uppercase tracking-wide"
        style={{
          fontFamily: "'BlinkerSemiBold', sans-serif",
        }}
      >
        {loading ? 'DELETING...' : 'DELETE ALL DATA'}
      </button>

      {result && (
        <div className="mt-6 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg p-6">
          <h3
            className="text-lg font-semibold text-white mb-4"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
            }}
          >
            Deletion Results
          </h3>
          <div className="space-y-2 text-white/80 text-sm" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            {Object.entries(result.results || {}).map(([collection, data]: [string, any]) => (
              <div key={collection} className="flex justify-between">
                <span className="capitalize">{collection}:</span>
                <span>
                  {data.deleted} deleted
                  {data.error && <span className="text-red-400 ml-2">({data.error})</span>}
                </span>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-[#d1a058]/20">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>{result.totalDeleted} documents deleted</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-500/20 border-2 border-red-500/50 rounded-lg p-6">
          <div className="text-red-400 font-semibold mb-2">Error</div>
          <div className="text-red-300 text-sm">{error}</div>
        </div>
      )}
    </div>
  )
}
