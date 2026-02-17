'use client'

import { useEffect } from 'react'

/**
 * Adds the `beach-battle-bg` class to <body> while the beach-battle page is mounted.
 * This swaps the default Background.jpg for ocean-war-bg.jpg as a fixed,
 * viewport-pinned background — all content scrolls over it.
 * Cleaned up on unmount so other pages keep their original background.
 */
export function BeachBattleBackground() {
  useEffect(() => {
    document.body.classList.add('beach-battle-bg')
    return () => {
      document.body.classList.remove('beach-battle-bg')
    }
  }, [])

  return null
}
