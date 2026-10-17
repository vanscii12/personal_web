import { Link } from 'react-router'
import { useEffect, useRef } from 'react'
import { getCategoryData } from '../gallery'

const allTags = ['All', '35mm', '120mm', 'Portra', 'Ektar', 'Travel', 'Daily']

const allRolls = [
  { id: 'travel', items: 'travel' },
  { id: 'film', items: 'film' },
  { id: 'daily', items: 'daily' },
]

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

export function Gallery() {
  const containerRef = useScrollAnimator()

  // Gather all gallery items from all categories for the masonry grid
  const allItems = []
  allRolls.forEach(({ id }) => {
    const cat = getCategoryData(id)
    if (cat) {
      cat.items.forEach(item => {
        allItems.push({ ...item, categoryId: id })
      })
    }
  })

  return (
    <div ref={containerRef}>
      <div className="section-label fade-up" style={{ marginBottom: 4 }}>archive → photo rolls</div>
      <h1
        className="fade-up"
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 42,
          marginBottom: 16,
          fontWeight: 400,
        }}
      >
        Photo Rolls.
      </h1>
      <div className="line-grow" style={{ height: 1, background: 'var(--color-border-warm)', marginBottom: 30 }} />

      {/* Tags */}
      <div className="fade-up" style={{ display: 'flex', gap: 10, marginBottom: 30, flexWrap: 'wrap' }}>
        {allTags.map(tag => (
          <span key={tag} className="tag-pill" data-hover>{tag}</span>
        ))}
      </div>

      {/* Masonry Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {allItems.map((item, i) => (
          <div key={`${item.categoryId}-${item.id}`} className="scale-fade" style={{ transitionDelay: `${i * 80}ms` }}>
            <Link to={`/gallery/${item.categoryId}/${item.id}`} data-hover>
              <div className="photo-card" style={{ height: [220, 280, 200, 260, 180, 240][i % 6] }}>
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(180deg, var(--color-border-warm) 0%, var(--color-bg-linen) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-fg-muted)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 24,
                  }}>
                    {item.title.charAt(0)}
                  </div>
                )}
                <div className="caption-overlay">{item.title}{item.date ? ` — ${item.date}` : ''}</div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Category links */}
      <div style={{ marginTop: 50 }}>
        <div className="line-grow" style={{ height: 1, background: 'var(--color-border-warm)', marginBottom: 30 }} />
        <div className="section-label fade-up" style={{ marginBottom: 16 }}>BROWSE BY CATEGORY</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {allRolls.map(({ id }) => {
            const cat = getCategoryData(id)
            return cat ? (
              <Link
                key={id}
                to={`/gallery/${id}`}
                data-hover
                className="tag-pill fade-up"
                style={{ fontSize: 14, padding: '8px 20px' }}
              >
                {cat.title}
              </Link>
            ) : null
          })}
        </div>
      </div>
    </div>
  )
}
