import { useParams, Link } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { loadItemData, itemCategoryMap } from '../gallery/items'
import { GalleryGridImage } from '../components/GalleryGridImage'

export function GalleryDetail() {
  const { categoryId, itemId } = useParams()
  const [selectedImage, setSelectedImage] = useState(null)
  const [gallery, setGallery] = useState(null)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef(null)

  const key = itemId || categoryId
  const categoryPath = itemCategoryMap[key]

  useEffect(() => {
    setLoading(true)
    loadItemData(key).then(data => {
      setGallery(data)
      setLoading(false)
    })
  }, [key])

  // Preload next image
  useEffect(() => {
    if (!gallery || selectedImage === null) return
    const next = selectedImage + 1
    if (next >= gallery.images.length) return
    const preload = new Image()
    preload.src = gallery.images[next].src
  }, [gallery, selectedImage])

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (selectedImage === null || !gallery) return
    if (e.key === 'Escape') setSelectedImage(null)
    if (e.key === 'ArrowRight' && selectedImage < gallery.images.length - 1) setSelectedImage(s => s + 1)
    if (e.key === 'ArrowLeft' && selectedImage > 0) setSelectedImage(s => s - 1)
  }, [selectedImage, gallery])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Scroll animation
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.15 }
    )
    el.querySelectorAll('.fade-up, .scale-fade, .line-grow').forEach(child => observer.observe(child))
    return () => observer.disconnect()
  }, [loading])

  if (loading) {
    return (
      <div style={{ paddingTop: 96, color: 'var(--color-fg-muted)', fontWeight: 300 }}>
        Loading...
      </div>
    )
  }

  if (!gallery) {
    return (
      <div style={{ paddingTop: 96, color: 'var(--color-fg-muted)', fontWeight: 300 }}>
        Gallery not found
      </div>
    )
  }

  return (
    <div ref={containerRef}>
      <header style={{ marginBottom: 40 }}>
        <Link
          to={categoryPath ? `/gallery/${categoryPath}` : '/gallery'}
          data-hover
          className="section-label"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, textDecoration: 'none' }}
        >
          ← Return to {categoryPath || 'Archives'}
        </Link>
        <div className="fade-up">
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 36,
            fontWeight: 400,
            marginBottom: 8,
          }}>
            {gallery.title}
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--color-fg-muted)',
            marginBottom: 8,
          }}>
            {gallery.date} · {gallery.images.length} photos
          </p>
          {gallery.subtitle && (
            <p style={{ color: 'var(--color-fg-muted)', fontSize: 15 }}>{gallery.subtitle}</p>
          )}
        </div>
      </header>

      <div className="line-grow" style={{ height: 1, background: 'var(--color-border-warm)', marginBottom: 30 }} />

      {/* Masonry columns */}
      <div style={{ columns: '3 240px', gap: 16 }}>
        {gallery.images.map((img, index) => (
          <div key={img.src} className="scale-fade" style={{ transitionDelay: `${Math.min(index * 60, 600)}ms`, breakInside: 'avoid', marginBottom: 16 }}>
            <GalleryGridImage
              src={img.src}
              thumbSrc={img.thumbSrc}
              alt={img.alt}
              onActivate={() => setSelectedImage(index)}
            />
          </div>
        ))}
      </div>

      {/* Lightbox — warm overlay per design spec */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lightbox-overlay open"
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedImage(null)}
          >
            {/* Nav arrows */}
            {selectedImage > 0 && (
              <button
                data-hover
                style={{
                  position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', fontSize: 24,
                  color: 'var(--color-fg-charcoal)', cursor: 'pointer',
                }}
                onClick={(e) => { e.stopPropagation(); setSelectedImage(s => s - 1) }}
              >
                ←
              </button>
            )}
            {selectedImage < gallery.images.length - 1 && (
              <button
                data-hover
                style={{
                  position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', fontSize: 24,
                  color: 'var(--color-fg-charcoal)', cursor: 'pointer',
                }}
                onClick={(e) => { e.stopPropagation(); setSelectedImage(s => s + 1) }}
              >
                →
              </button>
            )}

            <motion.img
              key={selectedImage}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
              src={gallery.images[selectedImage].src}
              alt={gallery.images[selectedImage].alt}
              style={{
                maxHeight: '80vh',
                maxWidth: '80vw',
                objectFit: 'contain',
                borderRadius: 6,
                border: '8px solid var(--color-photo-border)',
              }}
              onClick={(e) => e.stopPropagation()}
            />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              style={{
                marginTop: 16,
                fontFamily: 'var(--font-heading)',
                fontStyle: 'italic',
                color: 'var(--color-fg-muted)',
                fontSize: 15,
              }}
            >
              {gallery.images[selectedImage].alt || `${selectedImage + 1} / ${gallery.images.length}`}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
