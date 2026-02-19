// Cinematic SVG battle icons for the four elemental tribes + battle theme icons
// Dark, arena-themed battle symbols — no childish emojis

// ═══════════════════════════════════════════════════════════
// Ocean / Battle Theme Icons
// ═══════════════════════════════════════════════════════════

export function OceanIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Deep ocean wave — cinematic, dark, powerful */}
      <path d="M4 28C8 22 12 26 16 22C20 18 22 24 26 20C30 16 34 22 38 18C42 14 44 20 44 20"
        stroke="url(#ocean-grad)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M4 34C8 28 12 32 16 28C20 24 22 30 26 26C30 22 34 28 38 24C42 20 44 26 44 26"
        stroke="url(#ocean-grad2)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M4 40C8 34 12 38 16 34C20 30 22 36 26 32C30 28 34 34 38 30C42 26 44 32 44 32"
        stroke="url(#ocean-grad3)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
      {/* Trident rising from waves */}
      <path d="M24 8L22 16M24 8L26 16M24 8V18M20 12L28 12" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <circle cx="24" cy="7" r="1.5" fill="#22d3ee" opacity="0.9" />
      {/* Foam spray particles */}
      <circle cx="10" cy="18" r="1" fill="#a5f3fc" opacity="0.4" />
      <circle cx="38" cy="16" r="0.8" fill="#a5f3fc" opacity="0.35" />
      <circle cx="18" cy="14" r="0.6" fill="#67e8f9" opacity="0.3" />
      <circle cx="32" cy="12" r="0.7" fill="#67e8f9" opacity="0.3" />
      <defs>
        <linearGradient id="ocean-grad" x1="4" y1="24" x2="44" y2="24">
          <stop offset="0%" stopColor="#0891b2" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="ocean-grad2" x1="4" y1="30" x2="44" y2="30">
          <stop offset="0%" stopColor="#0e7490" />
          <stop offset="50%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="ocean-grad3" x1="4" y1="36" x2="44" y2="36">
          <stop offset="0%" stopColor="#164e63" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function SwordsIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Crossed battle swords */}
      <path d="M12 8L28 24L24 28L8 12L12 8Z" fill="url(#sword-grad)" stroke="#94a3b8" strokeWidth="1" />
      <path d="M36 8L20 24L24 28L40 12L36 8Z" fill="url(#sword-grad)" stroke="#94a3b8" strokeWidth="1" />
      {/* Sword hilts */}
      <path d="M6 10L14 6" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      <path d="M42 10L34 6" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      {/* Clash spark at center */}
      <circle cx="24" cy="24" r="3" fill="#fbbf24" opacity="0.8" />
      <circle cx="24" cy="24" r="5" fill="none" stroke="#fbbf24" strokeWidth="0.8" opacity="0.3" />
      {/* Spark rays */}
      <path d="M24 18V16M24 32V30M18 24H16M32 24H30M20 20L18 18M28 20L30 18M20 28L18 30M28 28L30 30" stroke="#fbbf24" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
      <defs>
        <linearGradient id="sword-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function CrownIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Majestic crown */}
      <path d="M8 36H40V40H8V36Z" fill="url(#crown-base)" stroke="#fbbf24" strokeWidth="1" />
      <path d="M8 36L4 18L16 26L24 10L32 26L44 18L40 36H8Z" fill="url(#crown-grad)" stroke="#fbbf24" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Jewels */}
      <circle cx="24" cy="28" r="2.5" fill="#ef4444" opacity="0.9" />
      <circle cx="16" cy="30" r="1.5" fill="#22d3ee" opacity="0.8" />
      <circle cx="32" cy="30" r="1.5" fill="#a78bfa" opacity="0.8" />
      {/* Crown tips glow */}
      <circle cx="24" cy="10" r="1.5" fill="#fde68a" opacity="0.9" />
      <circle cx="4" cy="18" r="1" fill="#fde68a" opacity="0.6" />
      <circle cx="44" cy="18" r="1" fill="#fde68a" opacity="0.6" />
      <defs>
        <linearGradient id="crown-grad" x1="24" y1="10" x2="24" y2="36">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="crown-base" x1="8" y1="36" x2="40" y2="40">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function TrophyIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Trophy cup */}
      <path d="M16 8H32V22C32 28 28 32 24 32C20 32 16 28 16 22V8Z" fill="url(#trophy-grad)" stroke="#fbbf24" strokeWidth="1.2" />
      {/* Handles */}
      <path d="M16 12H12C10 12 8 14 8 16C8 18 10 20 12 20H16" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
      <path d="M32 12H36C38 12 40 14 40 16C40 18 38 20 36 20H32" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
      {/* Stem & base */}
      <path d="M22 32V38H26V32" stroke="#d97706" strokeWidth="1.5" />
      <path d="M18 38H30V40H18V38Z" fill="#b45309" stroke="#d97706" strokeWidth="0.8" />
      {/* Star emblem */}
      <path d="M24 14L25.5 17.5L29 18L26.5 20.5L27 24L24 22.5L21 24L21.5 20.5L19 18L22.5 17.5L24 14Z" fill="#fde68a" opacity="0.9" />
      {/* Shine */}
      <path d="M20 10L19 12" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
      <defs>
        <linearGradient id="trophy-grad" x1="24" y1="8" x2="24" y2="32">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function ShieldIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <path d="M24 4L8 12V24C8 34 16 42 24 44C32 42 40 34 40 24V12L24 4Z"
        fill="url(#shield-grad)" stroke="#0891b2" strokeWidth="1.5" />
      <path d="M24 10L14 16V24C14 30 19 36 24 38C29 36 34 30 34 24V16L24 10Z"
        fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.4" />
      {/* Ocean wave inside shield */}
      <path d="M16 26C18 23 20 25 22 23C24 21 26 24 28 22C30 20 32 23 34 21" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M16 30C18 27 20 29 22 27C24 25 26 28 28 26C30 24 32 27 34 25" stroke="#67e8f9" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <circle cx="24" cy="20" r="2" fill="#22d3ee" opacity="0.7" />
      <defs>
        <radialGradient id="shield-grad" cx="0.5" cy="0.35" r="0.6">
          <stop offset="0%" stopColor="#0e7490" />
          <stop offset="50%" stopColor="#0c4a6e" />
          <stop offset="100%" stopColor="#082f49" />
        </radialGradient>
      </defs>
    </svg>
  )
}

export function FlameIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <path d="M24 4C24 4 14 16 14 28C14 34 18.5 40 24 40C29.5 40 34 34 34 28C34 16 24 4 24 4Z"
        fill="url(#flame-grad)" stroke="#ef4444" strokeWidth="1" />
      <path d="M24 16C24 16 19 24 19 30C19 34 21 36 24 36C27 36 29 34 29 30C29 24 24 16 24 16Z"
        fill="#f59e0b" opacity="0.8" />
      <path d="M24 24C24 24 22 28 22 31C22 33 23 34 24 34C25 34 26 33 26 31C26 28 24 24 24 24Z"
        fill="#fde68a" opacity="0.9" />
      <defs>
        <radialGradient id="flame-grad" cx="0.5" cy="0.6" r="0.5">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </radialGradient>
      </defs>
    </svg>
  )
}

export function LivePulseIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Heartbeat / pulse line */}
      <path d="M4 24H14L18 12L22 36L26 18L30 30L34 24H44" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Glow circle */}
      <circle cx="24" cy="24" r="18" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.15" />
      <circle cx="24" cy="24" r="12" fill="none" stroke="#22c55e" strokeWidth="0.8" opacity="0.1" />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════
// Tribe Icons
// ═══════════════════════════════════════════════════════════

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

// Battle-themed icon map
export const BattleIconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  ocean: OceanIcon,
  swords: SwordsIcon,
  crown: CrownIcon,
  trophy: TrophyIcon,
  shield: ShieldIcon,
  flame: FlameIcon,
  livePulse: LivePulseIcon,
}

export function BattleIcon({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) {
  const Icon = BattleIconMap[name]
  if (!Icon) return null
  return <Icon size={size} className={className} />
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
