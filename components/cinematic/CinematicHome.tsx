'use client'

/*
 * Cinematic home page — picks the desktop or mobile build of the design.
 * Desktop (> 860px) = Prototype B "black universe"; mobile (≤ 860px) = mobile prototype.
 * Each build is code-split, so phones never download the desktop bundle and vice versa.
 */
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import './blocks.css'

const DesktopHome = dynamic(() => import('./DesktopHome'), { ssr: false, loading: () => <div className="zh-boot" /> })
const MobileHome = dynamic(() => import('./MobileHome'), { ssr: false, loading: () => <div className="zh-boot" /> })

const QUERY = '(max-width: 860px)'

export default function CinematicHome() {
  const [mode, setMode] = useState<'desktop' | 'mobile' | null>(null)

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const pick = () => setMode(mq.matches ? 'mobile' : 'desktop')
    pick()
    mq.addEventListener('change', pick)
    return () => mq.removeEventListener('change', pick)
  }, [])

  // Arriving with a hash (e.g. /#battle-pack from another page): jump there once the build has rendered.
  useEffect(() => {
    if (!mode || !window.location.hash) return
    const id = decodeURIComponent(window.location.hash.slice(1))
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' }), 700)
    return () => clearTimeout(t)
  }, [mode])

  if (!mode) return <div className="zh-boot" />
  return mode === 'mobile' ? (
    <div className="zhm" key="m">
      <MobileHome />
    </div>
  ) : (
    <div className="zhd" key="d">
      <DesktopHome />
    </div>
  )
}
