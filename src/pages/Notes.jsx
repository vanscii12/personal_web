import { Link } from 'react-router'
import { useEffect, useRef } from 'react'
import { notes } from '../notes/index.js'

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

export function Notes() {
  const containerRef = useScrollAnimator()

  return (
    <div ref={containerRef}>
      <div className="section-label fade-up" style={{ marginBottom: 4 }}>NOTES</div>
      <h1
        className="fade-up"
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 42,
          marginBottom: 16,
          fontWeight: 400,
        }}
      >
        Journal.
      </h1>
      <div className="line-grow" style={{ height: 1, background: 'var(--color-border-warm)', marginBottom: 20 }} />

      {/* Journal timeline rows */}
      {notes.map((note, index) => (
        <Link
          key={note.id}
          to={`/notes/${note.id}`}
          className="journal-row slide-left"
          style={{ transitionDelay: `${index * 60}ms` }}
          data-hover
        >
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--color-fg-muted)',
            minWidth: 100,
            flexShrink: 0,
          }}>
            {note.date || '—'}
          </span>
          <div style={{ width: 1, height: 30, background: 'var(--color-border-warm)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 18,
            }}>
              {note.title}
            </div>
            {note.description && (
              <div style={{
                fontSize: 13,
                color: 'var(--color-fg-muted)',
                marginTop: 2,
              }}>
                {note.description.length > 80 ? note.description.slice(0, 80) + '...' : note.description}
              </div>
            )}
          </div>
          {note.tags && note.tags.length > 0 && (
            <span className="tag-pill">{note.tags[0]}</span>
          )}
        </Link>
      ))}
    </div>
  )
}
