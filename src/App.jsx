import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Gallery } from './pages/Gallery'
import { GalleryCategory } from './pages/GalleryCategory'
import { GalleryDetail } from './pages/GalleryDetail'
import { Notes } from './pages/Notes'
import { NotesDetail } from './pages/NotesDetail'
import { About } from './pages/About'
import { Apps } from './pages/Apps'
import { apps } from './apps'

// Each app (src/apps/index.js) is its own chunk, fetched when its page opens, and runs
// full-screen outside <Layout />. Navigations are transitions, so the page you leave stays up
// while an app loads; the empty fallback only shows when an app's URL is opened directly.
const appPages = apps.map((app) => ({ id: app.id, Page: lazy(app.load) }))

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="gallery/:categoryId" element={<GalleryCategory />} />
          <Route path="gallery/:categoryId/:itemId" element={<GalleryDetail />} />
          <Route path="notes" element={<Notes />} />
          <Route path="notes/:noteId" element={<NotesDetail />} />
          <Route path="apps" element={<Apps />} />
          <Route path="about" element={<About />} />
        </Route>
        {appPages.map(({ id, Page }) => (
          <Route key={id} path={`apps/${id}`} element={<Page />} />
        ))}
      </Routes>
    </Suspense>
  )
}
