// Cinematic SVG battle icons for the four elemental tribes
// Dark, arena-themed battle symbols — no childish emojis

export function LavaIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Crossed swords with flame eruption */}
      <path d="M24 4L28 16H36L30 22L34 34L24 28L14 34L18 22L12 16H20L24 4Z"
        fill="url(#lava-grad)" stroke="#ff2200" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M24 12C24 12 19 19 19 24C19 27 21.2 29 24 29C26.8 29 29 27 29 24C29 19 24 12 24 12Z"
        fill="#ff6600" opacity="0.85" />
      <path d="M24 16C24 16 21 20 21 23C21 25 22.3 26.5 24 26.5C25.7 26.5 27 25 27 23C27 20 24 16 24 16Z"
        fill="#ffaa00" opacity="0.7" />
      <circle cx="24" cy="22" r="2" fill="#ffdd44" opacity="0.9" />
      {/* Ember sparks */}
      <circle cx="16" cy="10" r="1" fill="#ff4400" opacity="0.5" />
      <circle cx="32" cy="10" r="0.8" fill="#ff6600" opacity="0.4" />
      <circle cx="10" cy="22" r="0.6" fill="#ff4400" opacity="0.3" />
      <circle cx="38" cy="22" r="0.7" fill="#ff6600" opacity="0.3" />
      <defs>
        <radialGradient id="lava-grad" cx="0.5" cy="0.35" r="0.55">
          <stop offset="0%" stopColor="#ff4400" />
          <stop offset="50%" stopColor="#cc2200" />
          <stop offset="100%" stopColor="#881100" />
        </radialGradient>
      </defs>
    </svg>
  )
}

export function RainIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Trident / war spear */}
      <path d="M24 6L20 14H14L18 20L14 18L22 28L23 42H25L26 28L34 18L30 20L34 14H28L24 6Z"
        fill="url(#rain-grad)" stroke="#2266ff" strokeWidth="1" strokeLinejoin="round" />
      {/* Lightning bolt across */}
      <path d="M16 10L21 18L17 18L22 26" stroke="#66ccff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M32 10L27 18L31 18L26 26" stroke="#66ccff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      {/* Water drops */}
      <path d="M12 32C12 32 10 36 12 38C14 40 16 38 16 36C16 34 12 32 12 32Z" fill="#4488ff" opacity="0.35" />
      <path d="M36 30C36 30 34 34 36 36C38 38 40 36 40 34C40 32 36 30 36 30Z" fill="#4488ff" opacity="0.3" />
      <circle cx="24" cy="20" r="2.5" fill="#4499ff" opacity="0.5" />
      <defs>
        <radialGradient id="rain-grad" cx="0.5" cy="0.35" r="0.6">
          <stop offset="0%" stopColor="#4488ff" />
          <stop offset="50%" stopColor="#2255cc" />
          <stop offset="100%" stopColor="#112266" />
        </radialGradient>
      </defs>
    </svg>
  )
}

export function WindIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Tornado vortex blade */}
      <path d="M24 6C24 6 36 14 38 24C40 34 24 42 24 42C24 42 12 34 10 24C8 14 24 6 24 6Z"
        fill="url(#wind-grad)" stroke="#cccccc" strokeWidth="1" />
      {/* Spiral wind blades */}
      <path d="M16 16C16 16 20 14 30 20" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M14 24C14 24 18 22 34 24" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M16 32C16 32 20 30 30 32" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      {/* Blade tip */}
      <path d="M24 10L27 19L24 17L21 19Z" fill="#ffffff" opacity="0.7" />
      <path d="M24 38L21 29L24 31L27 29Z" fill="#ffffff" opacity="0.4" />
      {/* Eye of storm */}
      <circle cx="24" cy="24" r="3" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
      <circle cx="24" cy="24" r="1.5" fill="#e0e0e0" opacity="0.6" />
      <defs>
        <radialGradient id="wind-grad" cx="0.5" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="rgba(230,230,230,0.5)" />
          <stop offset="50%" stopColor="rgba(180,180,180,0.3)" />
          <stop offset="100%" stopColor="rgba(100,100,100,0.12)" />
        </radialGradient>
      </defs>
    </svg>
  )
}

export function MountainIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* War shield / fortress */}
      <path d="M24 4L8 14V28C8 36 16 44 24 44C32 44 40 36 40 28V14L24 4Z"
        fill="url(#mountain-grad)" stroke="#8866cc" strokeWidth="1.5" />
      {/* Inner shield detail */}
      <path d="M24 10L14 18V28C14 34 19 38 24 38C29 38 34 34 34 28V18L24 10Z"
        fill="none" stroke="#aa88ee" strokeWidth="1" opacity="0.35" />
      {/* Mountain peak emblem inside shield */}
      <path d="M18 32L24 18L30 32H18Z" fill="none" stroke="#9977dd" strokeWidth="1.5" opacity="0.5" />
      <path d="M21 32L24 24L27 32" fill="#8866cc" opacity="0.3" />
      {/* Crown mark */}
      <path d="M20 14L22 11L24 14L26 11L28 14" stroke="#bb99ff" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <circle cx="24" cy="27" r="2" fill="#bb99ff" opacity="0.5" />
      <defs>
        <radialGradient id="mountain-grad" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#7755bb" />
          <stop offset="50%" stopColor="#553399" />
          <stop offset="100%" stopColor="#331166" />
        </radialGradient>
      </defs>
    </svg>
  )
}

// Map for easy lookup
export const TribeIconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Lava: LavaIcon,
  Rain: RainIcon,
  Wind: WindIcon,
  Mountain: MountainIcon,
}

export function TribeIcon({ tribe, size = 24, className = '' }: { tribe: string; size?: number; className?: string }) {
  const Icon = TribeIconMap[tribe]
  if (!Icon) return null
  return <Icon size={size} className={className} />
}

// Tribe data constants used across the whole site
export const TRIBES = [
  { name: 'Lava', color: '#ef4444', element: 'Fire', glowColor: 'rgba(239,68,68,0.5)', displayColor: '#ef4444' },
  { name: 'Rain', color: '#3b82f6', element: 'Water', glowColor: 'rgba(59,130,246,0.5)', displayColor: '#3b82f6' },
  { name: 'Wind', color: '#e0e0e0', element: 'Air', glowColor: 'rgba(224,224,224,0.4)', displayColor: '#e0e0e0' },
  { name: 'Mountain', color: '#a78bfa', element: 'Earth', glowColor: 'rgba(167,139,250,0.5)', displayColor: '#c4b5fd' },
] as const

export type TribeName = typeof TRIBES[number]['name']

export function getTribeData(name: string) {
  return TRIBES.find(t => t.name === name) || TRIBES[0]
}

export function getDisplayColor(tribeName: string) {
  const tribe = TRIBES.find(t => t.name === tribeName)
  if (!tribe) return '#ccc'
  return tribe.name === 'Mountain' ? '#c4b5fd' : tribe.color
}
