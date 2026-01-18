import { useEffect, useRef, RefObject } from 'react'
import { gsap } from '@/lib/gsap'

interface UseGSAPOptions {
  scope?: RefObject<HTMLElement>
  dependencies?: any[]
}

export function useGSAP(
  callback: (context: { scope?: RefObject<HTMLElement> }) => void | (() => void),
  options: UseGSAPOptions = {}
) {
  const { scope, dependencies = [] } = options
  const ctxRef = useRef<gsap.Context>()

  useEffect(() => {
    ctxRef.current = gsap.context(() => {
      const cleanup = callback({ scope })
      return cleanup
    }, scope?.current || undefined)

    return () => {
      ctxRef.current?.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)
}