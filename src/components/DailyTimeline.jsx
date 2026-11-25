import { Link } from 'react-router'
import { useEffect, useRef, useMemo } from 'react'

/**
 * Vertical scrolling timeline for the "daily" category.
 * Items are grouped by year, then rendered chronologically with
 * alternating left / right cards connected by a central spine.
 */
export function DailyTimeline({ items }) {
  const timelineRef = useRef(null)

  // Scroll-triggered reveal
  useEffect(() => {
    const el = timelineRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    el.querySelectorAll('.tl-year-label, .tl-node, .tl-card').forEach(child => {
      observer.observe(child)
    })
    return () => observer.disconnect()
  }, [items])

  // Group items by year (sorted chronologically, earliest first)
  const yearGroups = useMemo(() => {
    const sorted = [...items].sort((a, b) => new Date(a.date) - new Date(b.date))
    const groups = []
    let current = null
    for (const item of sorted) {
      const year = item.date.slice(0, 4)
      if (!current || current.year !== year) {
        current = { year, items: [] }
        groups.push(current)
      }
      current.items.push(item)
    }
    return groups
  }, [items])

  // Format a date string to something like "Sep 23"
  const shortDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Global alternation counter for left/right placement
  let cardIndex = 0

  return (
    <div className="tl-container" ref={timelineRef}>
      {/* The vertical spine */}
      <div className="tl-spine" />

      {yearGroups.map(group => {
        return (
          <div key={group.year} className="tl-year-group">
            {/* Year marker */}
            <div className="tl-year-label scale-fade">
              <span>{group.year}</span>
            </div>

            {group.items.map((item) => {
              const side = cardIndex % 2 === 0 ? 'left' : 'right'
              cardIndex++
              return (
                <div key={item.id} className={`tl-entry tl-entry-${side}`}>
                  {/* Dot on the spine */}
                  <div className="tl-node">
                    <div className="tl-dot" />
                    <span className="tl-date-badge">{shortDate(item.date)}</span>
                  </div>

                  {/* Card */}
                  <Link
                    to={`/gallery/daily/${item.id}`}
                    data-hover
                    className={`tl-card tl-card-${side}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="tl-card-image">
                      {item.coverImage ? (
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="tl-card-placeholder">
                          {item.title.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="tl-card-body">
                      <p className="tl-card-title">{item.title}</p>
                      <p className="tl-card-meta">{item.count} photos</p>
                      {item.note && (
                        <p className="tl-card-note">{item.note}</p>
                      )}
                    </div>
                    {/* Arrow connector pointing toward the spine */}
                    <div className="tl-card-arrow" />
                  </Link>
                </div>
              )
            })}
          </div>
        )
      })}

      {/* End cap */}
      <div className="tl-end-cap">
        <div className="tl-dot" />
      </div>
    </div>
  )
}
