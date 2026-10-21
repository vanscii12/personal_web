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
      const configMathJax = () => {
        window.MathJax.Hub.Config({
          tex2jax: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            processEscapes: true
          },
          TeX: {
            equationNumbers: { autoNumber: 'AMS' },
            extensions: ['AMSmath.js', 'AMSsymbols.js'],
            Macros: {
              dd: ['\\mathrm{d}#1', 1],
              pdv: ['\\frac{\\partial #1}{\\partial #2}', 2],
              dv: ['\\frac{\\mathrm{d}#1}{\\mathrm{d}#2}', 2],
              qty: ['\\left(#1\\right)', 1],
              ket: ['\\left|#1\\right\\rangle', 1],
              bra: ['\\left\\langle#1\\right|', 1],
              braket: ['\\left\\langle#1\\middle|#2\\right\\rangle', 2],
              abs: ['\\left|#1\\right|', 1],
              norm: ['\\left\\|#1\\right\\|', 1],
              Ddot: ['\\ddot{#1}', 1],
              Dot: ['\\dot{#1}', 1],
              bm: ['\\boldsymbol{#1}', 1]
            }
          },
          "HTML-CSS": {
            availableFonts: ["TeX"],
            linebreaks: { automatic: true }
          }
        })
      }

      if (!window.MathJax) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML'
        script.async = true
        script.onload = () => {
          configMathJax()
          window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, contentRef.current])
        }
        document.head.appendChild(script)
      } else {
        configMathJax()
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

  const renderInline = (text) => {
    // Preserve inline math ($...$) so markdown replacement does not interfere with math symbols
    const segments = text.split(/(\$[^\$]+?\$)/g)
    return segments.map((seg, i) => {
      if (seg.startsWith('$') && seg.endsWith('$')) {
        return seg
      }
      const inlineRegex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g
      const pieces = seg.split(inlineRegex)
      return pieces.map((piece, j) => {
        if (piece.startsWith('**') && piece.endsWith('**')) {
          return (
            <strong key={`${i}-${j}`} style={{ fontWeight: 600, color: 'var(--color-fg-charcoal)' }}>
              {piece.slice(2, -2)}
            </strong>
          )
        }
        if (piece.startsWith('*') && piece.endsWith('*')) {
          return <em key={`${i}-${j}`}>{piece.slice(1, -1)}</em>
        }
        if (piece.startsWith('`') && piece.endsWith('`')) {
          return (
            <code key={`${i}-${j}`} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875em',
              backgroundColor: 'rgba(0,0,0,0.05)',
              padding: '2px 5px',
              borderRadius: 4
            }}>
              {piece.slice(1, -1)}
            </code>
          )
        }
        return piece
      })
    })
  }

  const renderContent = (rawText) => {
    if (!rawText) return null

    // Split on display math blocks ($$...$$, \[...\], and \begin{equation/align/gather/multline}...\end{...})
    const displayMathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\begin\{(?:equation\*?|align\*?|gather\*?|multline\*?)\}[\s\S]*?\\end\{(?:equation\*?|align\*?|gather\*?|multline\*?)\})/g
    const chunks = rawText.trim().split(displayMathRegex)
    const elements = []
    let key = 0

    for (const chunk of chunks) {
      const trimmedChunk = chunk.trim()
      if (!trimmedChunk) continue

      const isDisplayMath =
        (trimmedChunk.startsWith('$$') && trimmedChunk.endsWith('$$')) ||
        (trimmedChunk.startsWith('\\[') && trimmedChunk.endsWith('\\]')) ||
        /^\\begin\{(?:equation\*?|align\*?|gather\*?|multline\*?)\}/.test(trimmedChunk)

      if (isDisplayMath) {
        elements.push(
          <div key={key++} style={{ margin: '32px 0', textAlign: 'center', overflowX: 'auto' }}>
            {trimmedChunk}
          </div>
        )
        continue
      }

      // Non-math text blocks separated by double newlines
      const blocks = trimmedChunk.split(/\n\s*\n/)
      for (const block of blocks) {
        const trimmed = block.trim()
        if (!trimmed) continue

        // Headings
        if (trimmed.startsWith('#### ')) {
          elements.push(
            <h4 key={key++} style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.125rem',
              color: 'var(--color-fg-charcoal)',
              marginTop: 24,
              marginBottom: 12,
            }}>
              {renderInline(trimmed.slice(5).trim())}
            </h4>
          )
          continue
        }

        // Image
        const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)
        if (imgMatch) {
          elements.push(
            <figure key={key++} style={{ margin: '32px 0', textAlign: 'center' }}>
              <img
                src={imgMatch[2]}
                alt={imgMatch[1]}
                style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, margin: '0 auto' }}
              />
              {imgMatch[1] && (
                <figcaption style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  color: 'var(--color-fg-muted)',
                  marginTop: 8
                }}>
                  {imgMatch[1]}
                </figcaption>
              )}
            </figure>
          )
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
              {renderInline(trimmed.slice(4).trim())}
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
              {renderInline(trimmed.slice(3).trim())}
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
              {renderInline(trimmed.slice(2).trim())}
            </h1>
          )
          continue
        }

        // Unordered list
        const lines = trimmed.split('\n')
        if (lines.every(l => l.trim().startsWith('- ') || l.trim().startsWith('* '))) {
          elements.push(
            <ul key={key++} style={{ marginBottom: 20, paddingLeft: 24, listStyleType: 'disc' }}>
              {lines.map((l, idx) => (
                <li key={idx} style={{ marginBottom: 6 }}>
                  {renderInline(l.trim().slice(2))}
                </li>
              ))}
            </ul>
          )
          continue
        }

        // Ordered list
        if (lines.every(l => /^\d+\.\s/.test(l.trim()))) {
          elements.push(
            <ol key={key++} style={{ marginBottom: 20, paddingLeft: 24, listStyleType: 'decimal' }}>
              {lines.map((l, idx) => (
                <li key={idx} style={{ marginBottom: 6 }}>
                  {renderInline(l.trim().replace(/^\d+\.\s/, ''))}
                </li>
              ))}
            </ol>
          )
          continue
        }

        // Regular paragraph (join wrapped lines within the paragraph with space)
        const paragraphText = lines.map(l => l.trim()).join(' ')
        elements.push(
          <p key={key++} style={{ marginBottom: 20 }}>
            {renderInline(paragraphText)}
          </p>
        )
      }
    }

    return elements
  }

  return (
    <div ref={containerRef} style={{ maxWidth: 768, margin: '0 auto' }}>
      <header style={{ marginBottom: 48 }}>
        <Link
          to="/notes"
          data-hover
          className="section-label"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, textDecoration: 'none' }}
        >
          ← Return to Journal
        </Link>
        <div>
          <span className="section-label">{note.category}</span>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 36,
            fontWeight: 400,
            marginTop: 8,
            marginBottom: 8,
            color: 'var(--color-fg-charcoal)',
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

      <div style={{ height: 1, background: 'var(--color-border-warm)', marginBottom: 36 }} />

      <div
        ref={contentRef}
        style={{
          width: '100%',
          fontSize: '1.125rem',
          lineHeight: 1.8,
          color: 'var(--color-fg-charcoal)',
        }}
      >
        {renderContent(note.content)}
      </div>
    </div>
  )
}
