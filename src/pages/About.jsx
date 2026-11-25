import { Fragment, useState } from 'react'
import { Link } from 'react-router'
import { categoryItems } from '../gallery'
import { notes, categories as noteCategories } from '../notes/index.js'
import { profile, practice, equations, links, colophon } from '../about'
import { useScrollAnimator } from '../lib/useScrollAnimator'

const accent = { color: 'var(--color-accent-sage)' }

/** Renders the *starred* words of a string in the sage accent colour. */
function Accent({ text }) {
  return text
    .split(/\*(.+?)\*/g)
    .map((part, i) => (i % 2 ? <span key={i} style={accent}>{part}</span> : part))
}

/** `a/b.webp` -> `a/thumbs/b.webp`; undefined when the path is already a thumbnail. */
const thumbOf = (src) =>
  !src || src.includes('/thumbs/') ? undefined : src.replace(/\/([^/]+)$/, '/thumbs/$1')

/** An <img> that falls back thumbnail -> full size -> neutral placeholder. */
function Frame({ src, thumb, alt = '', eager = false }) {
  const [stage, setStage] = useState(thumb ? 'thumb' : 'full')

  if (stage === 'missing') return <div className="about-frame-missing" aria-hidden="true" />

  return (
    <img
      src={stage === 'thumb' ? thumb : src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setStage((s) => (s === 'thumb' ? 'full' : 'missing'))}
    />
  )
}

function FrameStrip({ covers }) {
  return (
    <div className="about-frames">
      {covers.map((item) => (
        <div key={item.id} className="about-frame">
          <Frame src={item.coverImage} thumb={thumbOf(item.coverImage)} />
        </div>
      ))}
    </div>
  )
}

function EquationList({ items }) {
  return (
    <ol className="about-equations">
      {items.map(({ eq, label }) => (
        <li key={label}>
          <span className="about-eq">{eq}</span>
          <span className="about-eq-label">{label}</span>
        </li>
      ))}
    </ol>
  )
}

/** A card that links into one half of the site, with a small specimen of its contents. */
function Panel({ item, cta, delay, children }) {
  return (
    // The delay sits on this wrapper so it staggers the reveal but not the hover.
    <div className="scale-fade" style={{ transitionDelay: delay }}>
      <Link to={item.to} data-hover className="about-panel">
        <div className="about-panel-head">
          <span className="about-panel-glyph" aria-hidden="true">{item.glyph}</span>
          <span className="section-label">{item.eyebrow}</span>
        </div>
        <h3>{item.title}</h3>
        <p>{item.blurb}</p>
        <div className="about-specimen" aria-hidden="true">{children}</div>
        <span className="about-panel-cta">{cta} <span>→</span></span>
      </Link>
    </div>
  )
}

export function About() {
  const containerRef = useScrollAnimator()

  // Everything numeric is derived from the registries the other pages already use.
  const allItems = Object.values(categoryItems).flat()
  const totalPhotos = allItems.reduce((sum, item) => sum + (item.count || 0), 0)
  const covers = Object.values(categoryItems)
    .map((items) => items.find((item) => item.coverImage))
    .filter(Boolean)

  const stats = [
    { value: totalPhotos, label: 'photographs', caption: 'film & digital' },
    { value: allItems.length, label: 'rolls', caption: `${Object.keys(categoryItems).length} collections` },
    { value: notes.length, label: 'notes', caption: noteCategories.join(' · ') },
  ]

  const { portrait } = profile
  const portraitFrame = (
    <div className="photo-card">
      <Frame src={portrait.src} thumb={portrait.thumb} alt={portrait.alt} eager />
      {portrait.to && <div className="caption-overlay">View the roll →</div>}
    </div>
  )

  return (
    <div ref={containerRef} style={{ maxWidth: 980, margin: '0 auto' }}>

      {/* Header */}
      <header>
        <div className="section-label fade-up" style={{ marginBottom: 4 }}>
          about → {profile.name.toLowerCase()}
        </div>
        <h1
          className="fade-up"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 42,
            marginBottom: 8,
            fontWeight: 400,
          }}
        >
          About<span style={accent}>.</span>
        </h1>
        <p className="fade-up" style={{ color: 'var(--color-fg-muted)', fontSize: 14, marginBottom: 24 }}>
          {profile.tagline}
        </p>
        <div className="line-grow about-hairline" style={{ marginBottom: 48 }} />
      </header>

      {/* Introduction: statement, story and a photograph */}
      <section className="about-intro" aria-label="Introduction">
        <div className="about-intro-text">
          <p className="about-lede fade-up">
            <Accent text={profile.lede} />
          </p>

          <div className="about-body">
            {profile.paragraphs.map((paragraph, i) => (
              <p key={i} className="fade-up" style={{ transitionDelay: `${i * 80}ms` }}>
                {paragraph}
              </p>
            ))}

            <blockquote className="about-quote fade-up">{profile.quote}</blockquote>

            <dl className="about-facts">
              {profile.facts.map((fact, i) => (
                <div key={fact.label} className="about-fact slide-left" style={{ transitionDelay: `${i * 60}ms` }}>
                  <dt>{fact.label}</dt>
                  <dd>
                    {fact.values.map((value, j) => (
                      <Fragment key={value}>
                        {j > 0 && (
                          <>
                            <span className="about-sep" aria-hidden="true">{' · '}</span>
                            <span className="sr-only">, </span>
                          </>
                        )}
                        {value}
                      </Fragment>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <figure className="about-portrait scale-fade">
          {portrait.to ? (
            <Link
              to={portrait.to}
              data-hover
              className="about-portrait-link"
              aria-label={`${portrait.caption} — view this roll`}
            >
              {portraitFrame}
            </Link>
          ) : (
            portraitFrame
          )}
          <figcaption className="about-portrait-caption">
            <span>{portrait.caption}</span>
            <span className="about-frame-no" aria-hidden="true">▸ {portrait.frame}</span>
          </figcaption>
        </figure>
      </section>

      {/* The archive in numbers */}
      <section aria-label="The archive in numbers" style={{ marginBottom: 80 }}>
        <div className="line-grow about-hairline" />
        <div className="about-stats">
          {stats.map((stat, i) => (
            <div key={stat.label} className="about-stat fade-up" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="about-stat-num">{stat.value}</div>
              <div className="section-label">{stat.label}</div>
              <div className="about-stat-caption">{stat.caption}</div>
            </div>
          ))}
        </div>
        <div className="line-grow about-hairline" />
      </section>

      {/* Practice: the two halves of the site */}
      <section aria-labelledby="about-practice-title" style={{ marginBottom: 80 }}>
        <div className="section-label fade-up" style={{ marginBottom: 4 }}>practice</div>
        <h2 id="about-practice-title" className="about-h2 fade-up">Two ways of keeping light.</h2>
        <div className="line-grow about-hairline" style={{ margin: '20px 0 28px' }} />

        <div className="about-practice">
          <Panel item={practice.photographs} cta={`${totalPhotos} photographs`} delay="0ms">
            <FrameStrip covers={covers} />
          </Panel>
          <Panel item={practice.notes} cta={`${notes.length} entries`} delay="80ms">
            <EquationList items={equations} />
          </Panel>
        </div>
      </section>

      {/* Elsewhere: only when the owner has added links */}
      {links.length > 0 && (
        <section aria-labelledby="about-elsewhere-title" style={{ marginBottom: 80 }}>
          <div className="section-label fade-up" style={{ marginBottom: 4 }}>contact</div>
          <h2 id="about-elsewhere-title" className="about-h2 fade-up">Elsewhere.</h2>
          <p className="fade-up" style={{ color: 'var(--color-fg-muted)', fontSize: 14, marginTop: 8, maxWidth: 520 }}>
            {profile.contactNote}
          </p>
          <div className="line-grow about-hairline" style={{ margin: '20px 0 12px' }} />

          <ul>
            {links.map((link, i) => {
              const external = /^https?:/i.test(link.href)
              return (
                <li key={link.label} className="slide-left" style={{ transitionDelay: `${i * 60}ms` }}>
                  <a
                    href={link.href}
                    className="note-row about-link"
                    data-hover
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <span className="note-row-date" style={{ minWidth: 96 }}>{link.label}</span>
                    <span style={{ width: 1, height: 20, background: 'var(--color-border-warm)', flexShrink: 0 }} />
                    <span style={{ flex: 1, minWidth: 0, fontSize: 15, overflowWrap: 'anywhere' }}>{link.handle}</span>
                    <span className="note-row-arrow">{external ? '↗' : '→'}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* Colophon */}
      <footer>
        <div className="line-grow about-hairline" style={{ marginBottom: 20 }} />
        <div className="about-colophon fade-up">
          <p>{colophon.join(' · ')}</p>
          <p>© {new Date().getFullYear()} {profile.name}</p>
        </div>
      </footer>
    </div>
  )
}
