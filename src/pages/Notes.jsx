import { Link } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import { notes, categories } from '../notes/index.js'

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

// Map category → symbol
const categoryMeta = {
  Physics:     { icon: '⟨ψ⟩', color: 'var(--color-accent-sage)' },
  Mathematics: { icon: '∑',   color: '#A0896E' },
}

export function Notes() {
  const [activeFilter, setActiveFilter] = useState('All')
  const containerRef = useScrollAnimator([activeFilter])

  const allCategories = ['All', ...categories]

  const filteredNotes = activeFilter === 'All'
    ? notes
    : notes.filter(n => n.category === activeFilter)

  // Group filtered notes by category for sectioned layout
  const grouped = {}
  filteredNotes.forEach(note => {
    const cat = note.category || 'Other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(note)
  })

  const totalNotes = notes.length

  return (
    <div ref={containerRef} style={{ maxWidth: 800, margin: '0 auto' }}>

      {/* Header */}
      <div className="section-label fade-up" style={{ marginBottom: 4 }}>archive → notes</div>
      <h1
        className="fade-up"
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 42,
          marginBottom: 8,
          fontWeight: 400,
        }}
      >
        Notes<span style={{ color: 'var(--color-accent-sage)' }}>.</span>
      </h1>
      <p className="fade-up" style={{ color: 'var(--color-fg-muted)', fontSize: 14, marginBottom: 24 }}>
        {totalNotes} entries · {categories.join(' · ')}
      </p>
      <div className="line-grow" style={{ height: 1, background: 'var(--color-border-warm)', marginBottom: 32 }} />

      {/* Filter Pills */}
      <div className="fade-up" style={{ display: 'flex', gap: 10, marginBottom: 40, flexWrap: 'wrap' }}>
        {allCategories.map(cat => (
          <button
            key={cat}
            className={`tag-pill ${activeFilter === cat ? 'tag-pill-active' : ''}`}
            onClick={() => setActiveFilter(cat)}
            data-hover
          >
            {cat !== 'All' && categoryMeta[cat] ? `${categoryMeta[cat].icon} ` : ''}{cat}
          </button>
        ))}
      </div>

      {/* Grouped Sections */}
      {Object.entries(grouped).map(([cat, catNotes], groupIdx) => {
        const meta = categoryMeta[cat] || { icon: '◇', color: 'var(--color-fg-muted)' }
        return (
          <section key={cat} style={{ marginBottom: 48 }}>

            {/* Section header — only show when "All" is selected */}
            {activeFilter === 'All' && (
              <div className="fade-up" style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 12,
                marginBottom: 8,
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 16,
                  color: meta.color,
                }}>
                  {meta.icon}
                </span>
                <h2 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 22,
                  fontWeight: 400,
                }}>
                  {cat}
                </h2>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--color-fg-muted)',
                }}>
                  {catNotes.length} {catNotes.length === 1 ? 'note' : 'notes'}
                </span>
              </div>
            )}

            <div className="line-grow" style={{ height: 1, background: 'var(--color-border-warm)', marginBottom: 16 }} />

            {/* Note rows */}
            {catNotes.map((note, i) => (
              <Link
                key={note.id}
                to={`/notes/${note.id}`}
                className="note-row slide-left"
                style={{ transitionDelay: `${(groupIdx * 4 + i) * 55}ms` }}
                data-hover
              >
                {/* Date column */}
                <div className="note-row-date">
                  {note.date || '—'}
                </div>

                {/* Thin divider */}
                <div style={{ width: 1, height: 36, background: 'var(--color-border-warm)', flexShrink: 0 }} />

                {/* Main content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 17,
                    lineHeight: 1.3,
                    marginBottom: note.description ? 4 : 0,
                  }}>
                    {note.title}
                  </div>
                  {note.description && (
                    <div style={{
                      fontSize: 12,
                      color: 'var(--color-fg-muted)',
                      lineHeight: 1.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {note.description}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {note.tags && note.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="tag-pill" style={{ fontSize: 11, padding: '3px 10px' }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                <span className="note-row-arrow">→</span>
              </Link>
            ))}
          </section>
        )
      })}

      {filteredNotes.length === 0 && (
        <div style={{ color: 'var(--color-fg-muted)', fontStyle: 'italic', fontSize: 14, paddingTop: 16 }}>
          No notes in this category yet.
        </div>
      )}
    </div>
  )
}
