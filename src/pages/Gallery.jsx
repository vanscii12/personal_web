import { Link } from 'react-router'
import { motion } from 'motion/react'

const categories = [
  {
    id: 'travel',
    title: 'Destinations',
    subtitle: "Travel sets organized by destination, with film and digital work grouped together.",
    image: '/img-webp/travel/dali/1.webp',
    tags: ['Travel', 'Destinations'],
    count: '1 destination'
  },
  {
    id: 'film',
    title: 'Film Rolls',
    subtitle: "Analog roll scans grouped into a dedicated film archive.",
    image: '/img-webp/film/Roll1/Roll1_139107JW204636-R1-E001.webp',
    tags: ['Film', 'Rolls'],
    count: '2 rolls'
  },
  {
    id: 'daily',
    title: 'Santa Barbara Daily',
    subtitle: "A date-based archive for daily sequences and ongoing additions.",
    image: '/img-webp/us-daily/2021/9-23/1-1.webp',
    tags: ['Timeline', 'Daily'],
    count: 'Ongoing'
  }
]

export function Gallery() {
  return (
    <div className="pt-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-xs uppercase tracking-widest text-[#8C8A82] mb-4">Photo Archive</p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter mb-6 font-serif">
          Selected <span className="text-[#8C8A82] italic">Archives</span>.
        </h1>
        <p className="text-lg font-light text-[#55544E] max-w-xl mb-8">
          A cleaner landing page for the photo work: travel destinations, film rolls, and daily sequences.
        </p>
        <div className="flex flex-wrap gap-3">
          <span className="px-4 py-2 rounded-full bg-white/60 border border-black/5 text-[#55544E] text-sm">3 collections</span>
          <span className="px-4 py-2 rounded-full bg-white/60 border border-black/5 text-[#55544E] text-sm">Travel + Film + Daily</span>
          <span className="px-4 py-2 rounded-full bg-white/60 border border-black/5 text-[#55544E] text-sm">Static archive</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        {categories.map((cat, i) => (
          <motion.article 
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: i * 0.15 }}
            className="group"
          >
            <Link to={`/gallery/${cat.id}`} className="block">
              <div className="overflow-hidden bg-[#D1CFC7] aspect-[3/4] mb-6 rounded-2xl">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover grayscale-[30%] group-hover:scale-105 group-hover:grayscale-0 transition-all duration-[1.5s] ease-out"
                />
              </div>
              <div className="px-2">
                <p className="text-xs uppercase tracking-widest text-[#8C8A82] mb-2">{cat.id}</p>
                <h2 className="text-3xl font-light tracking-tight mb-3 group-hover:italic transition-all duration-300 font-serif">
                  {cat.title}
                </h2>
                <p className="text-[#55544E] text-sm leading-relaxed mb-4">
                  {cat.subtitle}
                </p>
                <div className="flex flex-wrap gap-2">
                  {cat.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-white/60 border border-black/5 text-[#55544E] text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  )
}
