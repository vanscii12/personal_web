import { useParams, Link } from 'react-router'
import { useEffect, useRef } from 'react'
import { getCategoryData } from '../gallery'

function useScrollAnimator() {
  const containerRef = useRef(null)
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
    el.querySelectorAll('.fade-up, .slide-left, .scale-fade, .line-grow').forEach(child => {
      observer.observe(child)
    })
    return () => observer.disconnect()
  }, [])
  return containerRef
}

export function GalleryCategory() {
  const { categoryId } = useParams()
  const category = getCategoryData(categoryId)
  const containerRef = useScrollAnimator()

  if (!categoryId || !category) {
    return (
      <div style={{ paddingTop: 96, color: 'var(--color-fg-muted)', fontWeight: 300 }}>
        Category not found
      </div>
    )
  }

  const { title, subtitle, items } = category

  return (
    <div ref={containerRef}>
      <header style={{ marginBottom: 40 }}>
        <Link
          to="/gallery"
          data-hover
          className="section-label slide-left"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, textDecoration: 'none' }}
        >
          ← Return to Photo Rolls
        </Link>
        <div className="section-label fade-up" style={{ marginBottom: 4 }}>{categoryId} archive</div>
        <h1
          className="fade-up"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 42,
            marginBottom: 12,
            fontWeight: 400,
          }}
        >
          {title}<span style={{ color: 'var(--color-accent-sage)' }}>.</span>
        </h1>
        <p className="fade-up" style={{ color: 'var(--color-fg-muted)', fontSize: 15, marginBottom: 24 }}>
          {subtitle}
        </p>
        <div className="fade-up" style={{ display: 'flex', gap: 10 }}>
          <span className="tag-pill">{items.length} {categoryId === 'daily' ? 'dates' : 'items'}</span>
        </div>
      </header>

      <div className="line-grow" style={{ height: 1, background: 'var(--color-border-warm)', marginBottom: 30 }} />

      {/* Masonry Grid */}
      <div className="masonry-grid">
        {items.map((item, index) => (
          <div key={item.id} className="masonry-item scale-fade" style={{ transitionDelay: `${index * 80}ms` }}>
            <Link to={`/gallery/${categoryId}/${item.id}`} data-hover>
              <div className="photo-card" style={{ position: 'relative' }}>
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    style={{ width: '100%', display: 'block' }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: 240,
                    background: 'linear-gradient(135deg, var(--color-border-warm) 0%, var(--color-bg-linen) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-fg-muted)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 32,
                  }}>
                    {item.title.charAt(0)}
                  </div>
                )}
                <div className="caption-overlay">
                  {item.title}
                  {item.date ? ` — ${item.date}` : ''}
                </div>
              </div>
            </Link>
            <div style={{ marginTop: 8 }}>
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 15,
                fontWeight: 400,
              }}>{item.title}</p>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--color-fg-muted)',
                marginTop: 2,
              }}>
                {item.date} · {item.count} photos
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
