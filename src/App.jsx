import { Routes, Route } from 'react-router'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Gallery } from './pages/Gallery'
import { GalleryCategory } from './pages/GalleryCategory'
import { GalleryDetail } from './pages/GalleryDetail'
import { Notes } from './pages/Notes'
import { NotesDetail } from './pages/NotesDetail'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="gallery/:categoryId" element={<GalleryCategory />} />
        <Route path="gallery/:categoryId/:itemId" element={<GalleryDetail />} />
        <Route path="notes" element={<Notes />} />
        <Route path="notes/:noteId" element={<NotesDetail />} />
      </Route>
    </Routes>
  )
}
