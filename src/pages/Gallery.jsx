import { Link } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import { getCategoryData } from '../gallery'

const categoryOrder = [
  { id: 'film', icon: '◎' },
  { id: 'travel', icon: '✦' },
  { id: 'daily', icon: '◻' },
]

function useScrollAnimator(deps = []) {
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
      { threshold: 0.1 }
    )
    el.querySelectorAll('.fade-up, .slide-left, .scale-fade, .line-grow').forEach(child => {
      child.classList.remove('visible')
      observer.observe(child)
    })
    return () => observer.disconnect()
  }, deps)
  return containerRef
}

export function Gallery() {
  const [activeFilter, setActiveFilter] = useState('all')
  const containerRef = useScrollAnimator([activeFilter])

  // Build category data
  const allCategories = categoryOrder
    .map(({ id, icon }) => {
      const cat = getCategoryData(id)
      return cat ? { id, icon, ...cat } : null
    })
    .filter(Boolean)

  // Compute total items
  const totalItems = allCategories.reduce((sum, cat) => sum + cat.items.length, 0)
  const totalPhotos = allCategories.reduce((sum, cat) => sum + cat.items.reduce((s, item) => s + (item.count || 0), 0), 0)

  // Pick the featured item — the first film roll with a cover image
  const featuredItem = (() => {
    for (const cat of allCategories) {
      for (const item of cat.items) {
        if (item.coverImage) return { ...item, categoryId: cat.id }
      }
    }
    return null
  })()

  // Filtered categories
  const visibleCategories = activeFilter === 'all'
    ? allCategories
    : allCategories.filter(c => c.id === activeFilter)

  return (
    <div ref={containerRef}>
      {/* Header */}
      <div className="section-label fade-up" style={{ marginBottom: 4 }}>archive → photo rolls</div>
      <h1
        className="fade-up"
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 42,
          marginBottom: 8,
          fontWeight: 400,
        }}
      >
        Photo Rolls<span style={{ color: 'var(--color-accent-sage)' }}>.</span>
      </h1>
      <p className="fade-up" style={{ color: 'var(--color-fg-muted)', fontSize: 14, marginBottom: 24 }}>
        {totalItems} rolls · {totalPhotos} photographs · film & digital
      </p>
      <div className="line-grow" style={{ height: 1, background: 'var(--color-border-warm)', marginBottom: 32 }} />

      {/* Hero Feature — large card */}
      {featuredItem && (
        <Link to={`/gallery/${featuredItem.categoryId}/${featuredItem.id}`} data-hover style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="gallery-hero scale-fade" style={{ marginBottom: 48 }}>
            <div className="gallery-hero-inner">
              <div className="gallery-hero-image">
                <div className="photo-card" style={{ borderRadius: 8 }}>
                  <img
                    src={featuredItem.coverImage}
                    alt={featuredItem.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    loading="eager"
                  />
                </div>
              </div>
              <div className="gallery-hero-text">
                <div className="section-label" style={{ marginBottom: 8 }}>latest</div>
                <h2 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 22,
                  fontWeight: 400,
                  marginBottom: 6,
                }}>
                  {featuredItem.title}
                </h2>
                {featuredItem.date && (
                  <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--color-fg-muted)',
                    marginBottom: 12,
                  }}>
                    {featuredItem.date}
                  </p>
                )}
                {featuredItem.note && (
                  <p style={{
                    fontSize: 14,
                    color: 'var(--color-fg-muted)',
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}>
                    {featuredItem.note}
                  </p>
                )}
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--color-accent-sage)',
                }}>
                  {featuredItem.count} photos →
                </span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Category Filter Tabs */}
      <div className="fade-up" style={{ display: 'flex', gap: 10, marginBottom: 40, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          className={`tag-pill ${activeFilter === 'all' ? 'tag-pill-active' : ''}`}
          onClick={() => setActiveFilter('all')}
          data-hover
        >
          All
        </button>
        {allCategories.map(cat => (
          <button
            key={cat.id}
            className={`tag-pill ${activeFilter === cat.id ? 'tag-pill-active' : ''}`}
            onClick={() => setActiveFilter(cat.id)}
            data-hover
          >
            {cat.icon} {cat.title}
          </button>
        ))}
      </div>

      {/* Category Sections */}
      {visibleCategories.map((cat, catIdx) => (
        <section key={cat.id} style={{ marginBottom: 56 }}>
          {/* Category Header */}
          <div className="fade-up" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 24,
                fontWeight: 400,
              }}>
                {cat.title}
              </h2>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--color-fg-muted)',
              }}>
                {cat.items.length} {cat.items.length === 1 ? 'roll' : 'rolls'}
              </span>
            </div>
            <Link
              to={`/gallery/${cat.id}`}
              data-hover
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--color-accent-sage)',
                textDecoration: 'none',
              }}
            >
              view all →
            </Link>
          </div>
          <p className="fade-up" style={{
            color: 'var(--color-fg-muted)',
            fontSize: 13,
            marginBottom: 20,
            maxWidth: 560,
          }}>
            {cat.subtitle}
          </p>
          <div className="line-grow" style={{ height: 1, background: 'var(--color-border-warm)', marginBottom: 24 }} />

          {/* Items Grid — editorial layout */}
          <div className="gallery-category-grid">
            {cat.items.map((item, i) => (
              <Link
                key={item.id}
                to={`/gallery/${cat.id}/${item.id}`}
                data-hover
                className={`gallery-card-wrap scale-fade ${i === 0 ? 'gallery-card-featured' : ''}`}
                style={{ transitionDelay: `${(catIdx * 3 + i) * 80}ms`, textDecoration: 'none', color: 'inherit' }}
              >
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
                      background: 'linear-gradient(180deg, var(--color-border-warm) 0%, var(--color-bg-linen) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-fg-muted)',
                      fontFamily: 'var(--font-heading)',
                      fontSize: 28,
                    }}>
                      {item.title.charAt(0)}
                    </div>
                  )}
                  <div className="caption-overlay">{item.title}{item.date ? ` — ${item.date}` : ''}</div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <p style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 15,
                    fontWeight: 400,
                  }}>{item.title}</p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 4,
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--color-fg-muted)',
                    }}>
                      {item.date || '—'}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--color-fg-muted)',
                    }}>
                      {item.count} photos
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
