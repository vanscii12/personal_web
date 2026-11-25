import { Link } from 'react-router'
import { apps, intro } from '../apps'
import { useScrollAnimator } from '../lib/useScrollAnimator'

const accent = { color: 'var(--color-accent-sage)' }

/** One app: a drawn specimen beside its name, description and a way in. */
function AppCard({ app }) {
  const { Specimen } = app

  return (
    <Link to={`/apps/${app.id}`} data-hover className="app-card">
      <div className="app-card-specimen" aria-hidden="true">
        {Specimen ? <Specimen /> : <span className="app-card-specimen-glyph">{app.glyph}</span>}
      </div>

      <div className="app-card-body">
        <div className="app-card-head">
          <span className="app-card-glyph" aria-hidden="true">{app.glyph}</span>
          <span className="section-label">{app.kind}</span>
        </div>
        <h2>{app.name}</h2>
        <p className="app-card-blurb">{app.blurb}</p>
        {app.tags?.length > 0 && (
          <ul className="app-card-tags" aria-label="Built with">
            {app.tags.map((tag) => (
              <li key={tag} className="tag-pill">{tag}</li>
            ))}
          </ul>
        )}
        <div className="app-card-foot">
          {app.meta && <span className="app-card-meta">{app.meta}</span>}
          <span className="app-card-cta">enter <span>→</span></span>
        </div>
      </div>
    </Link>
  )
}

export function Apps() {
  const containerRef = useScrollAnimator()

  return (
    <div ref={containerRef} style={{ maxWidth: 980, margin: '0 auto' }}>

      {/* Header */}
      <header>
        <div className="section-label fade-up" style={{ marginBottom: 4 }}>archive → apps</div>
        <h1
          className="fade-up"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 42,
            marginBottom: 8,
            fontWeight: 400,
          }}
        >
          My Apps<span style={accent}>.</span>
        </h1>
        <p className="fade-up" style={{ color: 'var(--color-fg-muted)', fontSize: 14, marginBottom: 24 }}>
          {apps.length} {apps.length === 1 ? 'app' : 'apps'} · {intro.tagline}
        </p>
        <div className="line-grow" style={{ height: 1, background: 'var(--color-border-warm)', marginBottom: 32 }} />
      </header>

      {/* One card per app; each opens full-screen at /apps/<id> */}
      <ul className="apps-list">
        {apps.map((app, i) => (
          // The delay sits on this wrapper so it staggers the reveal but not the hover.
          <li key={app.id} className="scale-fade" style={{ transitionDelay: `${i * 80}ms` }}>
            <AppCard app={app} />
          </li>
        ))}
      </ul>
    </div>
  )
}
