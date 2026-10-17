import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const cursorRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const onMove = (e) => {
      cursor.style.left = e.clientX + 'px'
      cursor.style.top = e.clientY + 'px'
    }

    const onEnter = () => cursor.classList.add('hovering')
    const onLeave = () => cursor.classList.remove('hovering')

    document.addEventListener('mousemove', onMove)

    // Observe DOM for [data-hover] elements dynamically
    const attachListeners = () => {
      document.querySelectorAll('[data-hover]').forEach(el => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }

    attachListeners()

    const observer = new MutationObserver(attachListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('mousemove', onMove)
      observer.disconnect()
    }
  }, [])

  return <div ref={cursorRef} className="cursor-dot" />
}
