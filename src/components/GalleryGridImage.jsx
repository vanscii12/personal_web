import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 进入视口附近才开始请求图片，加载完成后渐入显示。
 * 优先使用 thumbSrc；若缩略图缺失则回退到全图 src。
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
      className="break-inside-avoid [content-visibility:auto] [contain-intrinsic-size:240px_320px] relative overflow-hidden rounded-lg bg-[#E8E7E4] min-h-[10rem]"
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
          className={
            'w-full h-auto rounded-lg cursor-pointer block ' +
            'grayscale-[30%] hover:grayscale-0 hover:scale-[1.02] ' +
            'transition-all duration-700 ease-out ' +
            (loaded ? 'opacity-100' : 'opacity-0')
          }
        />
      ) : null}
      {!shouldLoad ? (
        <button
          type="button"
          aria-label={alt}
          className="absolute inset-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A]/30 rounded-lg"
          onClick={onActivate}
        />
      ) : null}
    </div>
  )
}
