import { useEffect, useRef } from 'react'
import type { CSSProperties, DragEvent, KeyboardEvent, MouseEvent, ReactNode } from 'react'

type TiltElement = 'article' | 'section' | 'header' | 'div'

interface TiltSurfaceProps {
  as?: TiltElement
  className?: string
  children: ReactNode
  maxRotateDeg?: number
  maxTranslatePx?: number
  hoverScale?: number
  glareMaxOpacity?: number
  disabled?: boolean
  onClick?: (event: MouseEvent<HTMLElement>) => void
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void
  onDragStart?: (event: DragEvent<HTMLElement>) => void
  onDragEnd?: (event: DragEvent<HTMLElement>) => void
  draggable?: boolean
  role?: string
  tabIndex?: number
  style?: CSSProperties
}

function TiltSurface({
  as = 'div',
  className,
  children,
  maxRotateDeg = 5,
  maxTranslatePx = 3.5,
  hoverScale = 1.022,
  glareMaxOpacity = 0.42,
  disabled = false,
  onClick,
  onKeyDown,
  onDragStart,
  onDragEnd,
  draggable,
  role,
  tabIndex,
  style,
}: TiltSurfaceProps) {
  const elementRef = useRef<HTMLElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const currentXRef = useRef(0)
  const currentYRef = useRef(0)
  const targetXRef = useRef(0)
  const targetYRef = useRef(0)
  const hoverCurrentRef = useRef(0)
  const hoverTargetRef = useRef(0)

  const smoothFactor = 0.18
  const hoverSmoothFactor = 0.22
  const stopThreshold = 0.001

  useEffect(() => {
    const node = elementRef.current
    if (!node) {
      return
    }

    node.classList.add('tilt-glare-surface')
    node.style.transformOrigin = 'center'
    node.style.willChange = 'transform, box-shadow'
    node.style.setProperty('--gloss-x', '50%')
    node.style.setProperty('--gloss-y', '50%')
    node.style.setProperty('--gloss-alpha', '0')

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const node = elementRef.current
    if (!node) {
      return
    }

    if (disabled) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      currentXRef.current = 0
      currentYRef.current = 0
      targetXRef.current = 0
      targetYRef.current = 0
      hoverCurrentRef.current = 0
      hoverTargetRef.current = 0
      node.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translate(0px, 0px)'
      node.style.boxShadow = ''
      node.style.setProperty('--gloss-x', '50%')
      node.style.setProperty('--gloss-y', '50%')
      node.style.setProperty('--gloss-alpha', '0')
    }
  }, [disabled])

  const startAnimation = () => {
    if (rafRef.current !== null) {
      return
    }

    const step = () => {
      const node = elementRef.current
      if (!node) {
        rafRef.current = null
        return
      }

      const dx = targetXRef.current - currentXRef.current
      const dy = targetYRef.current - currentYRef.current
      const dh = hoverTargetRef.current - hoverCurrentRef.current

      currentXRef.current += dx * smoothFactor
      currentYRef.current += dy * smoothFactor
      hoverCurrentRef.current += dh * hoverSmoothFactor

      const depth = Math.max(Math.abs(currentXRef.current), Math.abs(currentYRef.current))
      const rotateY = currentXRef.current * maxRotateDeg
      const rotateX = -currentYRef.current * maxRotateDeg
      const translateX = currentXRef.current * maxTranslatePx
      const translateY = currentYRef.current * maxTranslatePx
      const scale = 1 + hoverCurrentRef.current * (hoverScale - 1)
      const shadowX = translateX
      const shadowY = 5 + Math.max(translateY, 0) * 0.8

      node.style.transition = 'transform 0ms linear, box-shadow 0ms linear'
      node.style.transform =
        `perspective(900px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)` +
        ` translate(${translateX}px, ${translateY}px)`
      node.style.boxShadow = `${shadowX}px ${shadowY}px 26px rgba(0,0,0,0.28)`

      const glossX = 50 + currentXRef.current * 24
      const glossY = 48 + currentYRef.current * 18
      const glossAlpha = 0.06 + hoverCurrentRef.current * 0.28 + depth * 0.1
      node.style.setProperty('--gloss-x', `${glossX}%`)
      node.style.setProperty('--gloss-y', `${glossY}%`)
      node.style.setProperty('--gloss-alpha', `${Math.min(glareMaxOpacity, glossAlpha)}`)

      if (Math.abs(dx) < stopThreshold && Math.abs(dy) < stopThreshold && Math.abs(dh) < stopThreshold) {
        rafRef.current = null
        currentXRef.current = targetXRef.current
        currentYRef.current = targetYRef.current
        hoverCurrentRef.current = hoverTargetRef.current

        if (hoverTargetRef.current === 0 && targetXRef.current === 0 && targetYRef.current === 0) {
          node.style.boxShadow = ''
          node.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translate(0px, 0px)'
          node.style.setProperty('--gloss-x', '50%')
          node.style.setProperty('--gloss-y', '50%')
          node.style.setProperty('--gloss-alpha', '0')
        }
        return
      }

      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
  }

  const handleMouseEnter = () => {
    if (disabled) {
      return
    }
    hoverTargetRef.current = 1
    startAnimation()
  }

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    if (disabled) {
      return
    }
    if (event.buttons === 1) {
      return
    }

    const node = elementRef.current
    if (!node) {
      return
    }

    const rect = node.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    targetXRef.current = Math.max(-1, Math.min(1, (x - 0.5) * 2))
    targetYRef.current = Math.max(-1, Math.min(1, (y - 0.5) * 2))
    startAnimation()
  }

  const handleMouseLeave = () => {
    if (disabled) {
      return
    }
    hoverTargetRef.current = 0
    targetXRef.current = 0
    targetYRef.current = 0
    startAnimation()
  }

  const Component = as
  const inlineStyle: CSSProperties = style ?? {}

  return (
    <Component
      ref={(node) => {
        elementRef.current = node as HTMLElement | null
      }}
      className={className}
      style={inlineStyle}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      draggable={draggable}
      role={role}
      tabIndex={tabIndex}
    >
      {children}
    </Component>
  )
}

export default TiltSurface
