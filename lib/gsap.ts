'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export { gsap, ScrollTrigger }

// Timeline utility function
export function createTimeline(options?: gsap.TimelineVars) {
  return gsap.timeline(options)
}

// Common animation presets
export const animations = {
  fadeIn: {
    opacity: 0,
    duration: 0.5,
  },
  fadeInUp: {
    opacity: 0,
    y: 30,
    duration: 0.6,
  },
  fadeInDown: {
    opacity: 0,
    y: -30,
    duration: 0.6,
  },
  fadeInLeft: {
    opacity: 0,
    x: -30,
    duration: 0.6,
  },
  fadeInRight: {
    opacity: 0,
    x: 30,
    duration: 0.6,
  },
  scaleIn: {
    opacity: 0,
    scale: 0.9,
    duration: 0.5,
  },
  slideUp: {
    y: 100,
    opacity: 0,
    duration: 0.8,
  },
}

// ScrollTrigger defaults
export const scrollTriggerDefaults = {
  start: 'top 80%',
  end: 'bottom 20%',
  toggleActions: 'play none none reverse',
  once: true,
}