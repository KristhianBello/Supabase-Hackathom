'use client'

import { animate, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'

export function AnimatedNumber({
  value,
  delay = 0,
  duration = 0.9,
}: {
  value: number
  delay?: number
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (reduceMotion) {
      node.textContent = String(value)
      return
    }
    const controls = animate(0, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = String(Math.round(v))
      },
    })
    return () => controls.stop()
  }, [value, delay, duration, reduceMotion])

  return <span ref={ref}>0</span>
}
