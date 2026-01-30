'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function AdminLoginForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Invalid email or password')
        return
      }
      // Brief delay so the browser commits the Set-Cookie before we navigate
      setTimeout(() => {
        window.location.replace(redirect)
      }, 0)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div
        className="w-full max-w-md rounded-xl border-2 p-8 shadow-xl"
        style={{
          borderColor: 'rgba(209, 160, 88, 0.4)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(209, 160, 88, 0.1)',
        }}
      >
        <h1
          className="text-2xl font-semibold text-center mb-2 text-[#d1a058]"
          style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
        >
          Admin Login
        </h1>
        <p className="text-white/60 text-center text-sm mb-6" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
          Zambara Management
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              className="rounded-lg px-4 py-3 text-sm text-red-300 bg-red-500/20 border border-red-500/40"
              style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
            >
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm text-white/80 mb-1.5" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border-2 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#d1a058]/50"
              style={{ borderColor: 'rgba(209, 160, 88, 0.4)', fontFamily: "'BlinkerRegular', sans-serif" }}
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-white/80 mb-1.5" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border-2 bg-black/50 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#d1a058]/50"
              style={{ borderColor: 'rgba(209, 160, 88, 0.4)', fontFamily: "'BlinkerRegular', sans-serif" }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold uppercase transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              backgroundColor: '#d1a058',
              color: '#000',
              boxShadow: '0 4px 15px rgba(209, 160, 88, 0.3)',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-[#d1a058] hover:underline"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
          >
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-[#d1a058]" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>Loading…</div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  )
}
