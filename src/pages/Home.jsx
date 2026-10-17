import { Link } from 'react-router'
import { useEffect, useRef } from 'react'

const featuredPhotos = [
  {
    src: '/img-webp/film/Roll1/Roll1_139107JW204636-R1-E001.webp',
    caption: 'Kamakura, temple',
    label: 'Kamakura',
    height: 240,
    offset: 30,
  },
  {
    src: '/img-webp/travel/dali/1.webp',
    caption: 'Dali, old town',
    label: 'Dali',
    height: 270,
    offset: 0,
  },
  {
    src: '/img-webp/us-daily/2021/9-23/1-1.webp',
    caption: 'Santa Barbara, daily',
    label: 'Santa Barbara',
    height: 220,
    offset: 50,
  },
  {
    src: '/img-webp/film/2025-xinjiang/000158310001.webp',
    caption: 'Xinjiang, road',
    label: 'Xinjiang',
    height: 260,
    offset: 10,
  },
]

function useScrollAnimator() {
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
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

export function Home() {
  const containerRef = useScrollAnimator()

  return (
    <div ref={containerRef}>
      {/* Hero section */}
      <section style={{ marginBottom: 100 }}>
        <div className="section-label fade-up" style={{ marginBottom: 8 }}>HOME</div>
        <h1
          className="fade-up"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 48,
            lineHeight: 1.15,
            marginBottom: 12,
            fontWeight: 400,
          }}
        >
          Collected <span style={{ color: 'var(--color-accent-sage)' }}>light</span>,
          <br />
          scattered <span style={{ color: 'var(--color-accent-sage)' }}>thoughts</span>.
        </h1>
        <p className="fade-up" style={{ color: 'var(--color-fg-muted)', fontSize: 15, marginBottom: 40 }}>
          Photography, field notes, and things worth remembering.
        </p>

        {/* Staggered Photo Strip */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', marginBottom: 50, flexWrap: 'wrap' }}>
          {featuredPhotos.map((photo, i) => (
            <div key={photo.label} className="scale-fade" style={{ transitionDelay: `${i * 80}ms` }}>
              <Link to="/gallery" data-hover>
                <div
                  className="photo-card"
                  style={{ width: 180, height: photo.height, marginTop: photo.offset }}
                >
                  <img
                    src={photo.src}
                    alt={photo.caption}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    loading="lazy"
                  />
                  <div className="caption-overlay">{photo.caption}</div>
                </div>
              </Link>
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 12,
                color: 'var(--color-fg-muted)',
                marginTop: 8,
              }}>
                {photo.label}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ marginBottom: 16 }}>
          <div className="line-grow" style={{ height: 1, background: 'var(--color-border-warm)' }} />
        </div>

        {/* Now section */}
        <div className="fade-up now-section" data-hover style={{ transitionDelay: '400ms', paddingTop: 16 }}>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 16,
          }}>now</span>
          <p style={{
            color: 'var(--color-fg-muted)',
            fontSize: 14,
            fontStyle: 'italic',
            marginTop: 6,
          }}>
            currently — reading <span className="now-word">Borges</span>, editing rolls from <span className="now-word">Hokkaido</span>
          </p>
        </div>
      </section>
    </div>
  )
}
