import { useParams, Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'motion/react'
import { getCategoryData } from '../gallery'

export function GalleryCategory() {
  const { categoryId } = useParams()
  const category = getCategoryData(categoryId)
  
  if (!categoryId || !category) {
    return (
      <div className="pt-24 text-[#8C8A82] font-light">
        Category not found
      </div>
    )
  }
  
  const { title, subtitle, items } = category

  return (
    <div className="pt-8">
      <header className="mb-16">
        <Link to="/gallery" className="inline-flex items-center gap-3 text-xs uppercase tracking-widest text-[#8C8A82] hover:text-[#1A1A1A] transition-colors group mb-8">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Return to Archives
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs uppercase tracking-widest text-[#8C8A82] mb-4">{categoryId} Archive</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter mb-6 font-serif">
            {title}<span className="text-[#8C8A82] italic">.</span>
          </h1>
          <p className="text-lg font-light text-[#55544E] max-w-xl mb-8">
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded-full bg-white/60 border border-black/5 text-[#55544E] text-sm">
              {items.length} {categoryId === 'daily' ? 'dates' : 'items'}
            </span>
            <span className="px-4 py-2 rounded-full bg-white/60 border border-black/5 text-[#55544E] text-sm">
              {categoryId === 'film' ? 'Analog scans' : categoryId === 'daily' ? 'Timeline' : 'Archive'}
            </span>
          </div>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, index) => (
          <motion.article 
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="group"
          >
            <Link 
              to={`/gallery/${categoryId}/${item.id}`} 
              className="block bg-white/70 rounded-2xl border border-white/60 overflow-hidden hover:shadow-xl transition-all duration-500"
            >
              <div className="aspect-[3/4] bg-[#D1CFC7] overflow-hidden">
                {item.coverImage ? (
                  <img 
                    src={item.coverImage} 
                    alt={item.title}
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#D1CFC7] to-[#EBE9E1] flex items-center justify-center text-[#8C8A82]">
                    <span className="text-4xl font-light font-serif">{item.title.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-light tracking-tight mb-2 group-hover:italic transition-all duration-300 font-serif">
                  {item.title}
                </h2>
                <p className="text-xs text-[#8C8A82] mb-3">{item.date} · {item.count} photos</p>
                {item.note && (
                  <p className="text-sm text-[#55544E] line-clamp-2">{item.note}</p>
                )}
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  )
}
