import { useEffect, useRef } from 'react'

/**
 * Reveal-on-scroll for the `.fade-up`, `.slide-left`, `.scale-fade` and `.line-grow`
 * classes defined in index.css. Attach the returned ref to a page's root element.
 */
export function useScrollAnimator({ threshold = 0.1 } = {}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold }
    )

    el.querySelectorAll('.fade-up, .slide-left, .scale-fade, .line-grow').forEach((node) => {
      observer.observe(node)
    })

    return () => observer.disconnect()
  }, [threshold])

  return containerRef
}
