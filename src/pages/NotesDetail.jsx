import { useParams, Link } from 'react-router'
import { useEffect, useRef } from 'react'
import { getNote } from '../notes/index.js'

export function NotesDetail() {
  const { noteId } = useParams()
  const contentRef = useRef(null)
  const containerRef = useRef(null)
  const note = getNote(noteId)

  useEffect(() => {
    const loadMathJax = () => {
      if (!window.MathJax) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML'
        script.async = true
        script.onload = () => {
          window.MathJax.Hub.Config({
            tex2jax: {
              inlineMath: [['$', '$'], ['\\(', '\\)']],
              processEscapes: true
            },
            TeX: {
              equationNumbers: { autoNumber: 'AMS' }
            },
            "HTML-CSS": {
              availableFonts: ["TeX"]
            }
          })
          window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, contentRef.current])
        }
        document.head.appendChild(script)
      } else {
        window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, contentRef.current])
      }
    }
    loadMathJax()
  }, [noteId])

  // Scroll animations
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
    el.querySelectorAll('.fade-up, .slide-left').forEach(child => observer.observe(child))
    return () => observer.disconnect()
  }, [noteId])

  if (!note) {
    return (
      <div style={{ paddingTop: 96, color: 'var(--color-fg-muted)', fontWeight: 300 }}>
        Note not found
      </div>
    )
  }

  const renderContent = (text) => {
    const lines = text.trim().split('\n')
    const elements = []
    let key = 0
    let inDisplayMath = false
    let mathBuffer = []

    const pushDisplayMath = () => {
      const expression = mathBuffer.join(' ').trim()
      elements.push(
        <div key={key++} style={{ margin: '32px 0', textAlign: 'center' }}>
          {`$$ ${expression} $$`}
        </div>
      )
      mathBuffer = []
    }

    for (const line of lines) {
      const trimmed = line.trim()

      if (trimmed === '$$') {
        if (!inDisplayMath) {
          inDisplayMath = true
          mathBuffer = []
        } else {
          pushDisplayMath()
          inDisplayMath = false
        }
        continue
      }

      if (inDisplayMath) {
        if (trimmed) mathBuffer.push(trimmed)
        continue
      }

      if (trimmed === '') {
        elements.push(<br key={key++} />)
        continue
      }

      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={key++} style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            color: 'var(--color-fg-charcoal)',
            marginTop: 32,
            marginBottom: 16,
          }}>
            {trimmed.slice(4).trim()}
          </h3>
        )
        continue
      }

      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={key++} style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.5rem',
            color: 'var(--color-fg-charcoal)',
            marginTop: 40,
            marginBottom: 20,
          }}>
            {trimmed.slice(3).trim()}
          </h2>
        )
        continue
      }

      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={key++} style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.875rem',
            color: 'var(--color-fg-charcoal)',
            marginTop: 40,
            marginBottom: 24,
          }}>
            {trimmed.slice(2).trim()}
          </h1>
        )
        continue
      }

      if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
        elements.push(
          <div key={key++} style={{ margin: '32px 0', textAlign: 'center' }}>
            {trimmed}
          </div>
        )
        continue
      }

      if (trimmed.startsWith('$') && trimmed.endsWith('$')) {
        elements.push(<span key={key++} style={{ margin: '0 4px' }}>{trimmed}</span>)
        continue
      }

      elements.push(<p key={key++} style={{ marginBottom: 16 }}>{trimmed}</p>)
    }

    if (inDisplayMath) {
      pushDisplayMath()
    }

    return elements
  }

  return (
    <div ref={containerRef}>
      <header style={{ marginBottom: 48 }}>
        <Link
          to="/notes"
          data-hover
          className="section-label"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, textDecoration: 'none' }}
        >
          ← Return to Journal
        </Link>
        <div className="fade-up">
          <span className="section-label">{note.category}</span>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 36,
            fontWeight: 400,
            marginTop: 8,
            marginBottom: 8,
          }}>
            {note.title}
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--color-fg-muted)',
          }}>
            {note.date}
          </p>
        </div>
      </header>

      <div className="line-grow" style={{ height: 1, background: 'var(--color-border-warm)', marginBottom: 30 }} />

      <div
        ref={contentRef}
        className="fade-up"
        style={{
          maxWidth: 720,
          fontSize: '1.125rem',
          lineHeight: 1.75,
          color: 'var(--color-fg-muted)',
        }}
      >
        {renderContent(note.content)}
      </div>
    </div>
  )
}
