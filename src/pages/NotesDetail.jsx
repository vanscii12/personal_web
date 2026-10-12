import { useParams, Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { getNote } from '../notes/index.js'

export function NotesDetail() {
  const { noteId } = useParams()
  const contentRef = useRef(null)
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

  if (!note) {
    return (
      <div className="pt-24 text-[#8C8A82] font-light">
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
        <div key={key++} className="my-8 text-center">
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
          <h3 key={key++} className="text-xl md:text-2xl font-serif text-[#2C2B27] mt-8 mb-4">
            {trimmed.slice(4).trim()}
          </h3>
        )
        continue
      }

      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={key++} className="text-2xl md:text-3xl font-serif text-[#2C2B27] mt-10 mb-5">
            {trimmed.slice(3).trim()}
          </h2>
        )
        continue
      }

      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={key++} className="text-3xl md:text-4xl font-serif text-text-primary mt-10 mb-6">
            {trimmed.slice(2).trim()}
          </h1>
        )
        continue
      }

      if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
        elements.push(
          <div key={key++} className="my-8 text-center">
            {trimmed}
          </div>
        )
        continue
      }

      if (trimmed.startsWith('$') && trimmed.endsWith('$')) {
        elements.push(<span key={key++} className="mx-1">{trimmed}</span>)
        continue
      }

      elements.push(<p key={key++} className="mb-4">{trimmed}</p>)
    }

    if (inDisplayMath) {
      pushDisplayMath()
    }

    return elements
  }

  return (
    <div className="pt-8 pb-24">
      <header className="mb-12">
        <Link to="/notes" className="inline-flex items-center gap-3 text-xs uppercase tracking-widest text-[#8C8A82] hover:text-[#1A1A1A] transition-colors group mb-8">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Return to Notes
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-xs uppercase tracking-widest text-[#8C8A82]">{note.category}</span>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight mt-2 mb-4 font-serif">
            {note.title}
          </h1>
          <p className="text-sm text-[#8C8A82]">{note.date}</p>
        </motion.div>
      </header>

      <motion.div 
        ref={contentRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-3xl text-lg leading-relaxed text-[#55544E]"
      >
        {renderContent(note.content)}
      </motion.div>
    </div>
  )
}
