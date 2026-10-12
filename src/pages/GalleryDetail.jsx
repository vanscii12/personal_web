import { useParams, Link } from 'react-router'
import { ArrowLeft, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect } from 'react'
import { loadItemData, itemCategoryMap } from '../gallery/items'
import { GalleryGridImage } from '../components/GalleryGridImage'

export function GalleryDetail() {
  const { categoryId, itemId } = useParams()
  const [selectedImage, setSelectedImage] = useState(null)
  const [gallery, setGallery] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const key = itemId || categoryId
  const categoryPath = itemCategoryMap[key]
  
  useEffect(() => {
    setLoading(true)
    loadItemData(key).then(data => {
      setGallery(data)
      setLoading(false)
    })
  }, [key])

  useEffect(() => {
    if (!gallery || selectedImage === null) return
    const next = selectedImage + 1
    if (next >= gallery.images.length) return
    const preload = new Image()
    preload.src = gallery.images[next].src
  }, [gallery, selectedImage])
  
  if (loading) {
    return (
      <div className="pt-24 text-[#8C8A82] font-light">
        Loading...
      </div>
    )
  }
  
  if (!gallery) {
    return (
      <div className="pt-24 text-[#8C8A82] font-light">
        Gallery not found
      </div>
    )
  }

  return (
    <div className="pt-8">
      <header className="mb-12">
        <Link 
          to={categoryPath ? `/gallery/${categoryPath}` : '/gallery'} 
          className="inline-flex items-center gap-3 text-xs uppercase tracking-widest text-[#8C8A82] hover:text-[#1A1A1A] transition-colors group mb-8"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Return to {categoryPath || 'Archives'}
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4 font-serif">
            {gallery.title}
          </h1>
          <p className="text-sm text-[#8C8A82] mb-4">{gallery.date} · {gallery.images.length} photos</p>
          {gallery.subtitle && (
            <p className="text-[#55544E] max-w-xl">{gallery.subtitle}</p>
          )}
        </motion.div>
      </header>

      <motion.div
        className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
      >
        {gallery.images.map((img, index) => (
          <GalleryGridImage
            key={img.src}
            src={img.src}
            thumbSrc={img.thumbSrc}
            alt={img.alt}
            onActivate={() => setSelectedImage(index)}
          />
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-4 right-4 text-white p-2 hover:scale-110 transition-transform"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            
            {selectedImage > 0 && (
              <button 
                className="absolute left-4 text-white p-2 hover:scale-110 transition-transform"
                onClick={(e) => { e.stopPropagation(); setSelectedImage(selectedImage - 1); }}
              >
                <ArrowLeft className="w-8 h-8" />
              </button>
            )}
            
            {selectedImage < gallery.images.length - 1 && (
              <button 
                className="absolute right-4 text-white p-2 hover:scale-110 transition-transform"
                onClick={(e) => { e.stopPropagation(); setSelectedImage(selectedImage + 1); }}
              >
                <ArrowLeft className="w-8 h-8 rotate-180" />
              </button>
            )}

            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={gallery.images[selectedImage].src}
              alt={gallery.images[selectedImage].alt}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              decoding="async"
              fetchPriority="high"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="absolute bottom-4 text-white text-sm">
              {selectedImage + 1} / {gallery.images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
