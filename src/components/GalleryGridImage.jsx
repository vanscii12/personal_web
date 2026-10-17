import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Lazy-loading image component with Polaroid-style borders.
 * Enters viewport -> loads image -> fades in.
 * Hover shows scale + sage border per design spec.
 */
export function GalleryGridImage({
  src,
  thumbSrc,
  alt,
  onActivate,
  rootMargin = '96px 0px',
}) {
  const wrapRef = useRef(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [displaySrc, setDisplaySrc] = useState(() => thumbSrc || src)

  useEffect(() => {
    setDisplaySrc(thumbSrc || src)
    setLoaded(false)
  }, [thumbSrc, src])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { root: null, rootMargin, threshold: 0 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  const finish = useCallback(() => {
    setLoaded(true)
  }, [])

  const handleError = useCallback(() => {
    if (thumbSrc && displaySrc === thumbSrc) {
      setLoaded(false)
      setDisplaySrc(src)
      return
    }
    finish()
  }, [thumbSrc, displaySrc, src, finish])

  return (
    <div
      ref={wrapRef}
      className="photo-card"
      data-hover
      style={{
        minHeight: '10rem',
        cursor: 'pointer',
      }}
    >
      {shouldLoad ? (
        <img
          src={displaySrc}
          alt={alt}
          decoding="async"
          fetchPriority="low"
          onLoad={finish}
          onError={handleError}
          onClick={onActivate}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: 2,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.5s var(--ease-out-soft)',
          }}
        />
      ) : null}
      {!shouldLoad ? (
        <button
          type="button"
          aria-label={alt}
          style={{
            position: 'absolute',
            inset: 0,
            cursor: 'pointer',
            background: 'none',
            border: 'none',
          }}
          onClick={onActivate}
        />
      ) : null}
    </div>
  )
}
