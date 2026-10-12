import { Link } from 'react-router'
import { motion } from 'motion/react'

const categories = [
  {
    id: 'travel',
    title: 'Destinations',
    image: '/img-webp/travel/dali/1.webp',
    tags: ['Travel', 'Destinations']
  },
  {
    id: 'film',
    title: 'Film Rolls',
    image: '/img-webp/film/Roll1/Roll1_139107JW204636-R1-E001.webp',
    tags: ['Film', 'Rolls']
  },
  {
    id: 'daily',
    title: 'Santa Barbara Daily',
    image: '/img-webp/us-daily/2021/9-23/1-1.webp',
    tags: ['Timeline', 'Daily']
  }
]

export function Home() {
  return (
    <div className="pt-8 flex flex-col items-center">
      <div className="w-full max-w-xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs uppercase tracking-widest text-[#8C8A82] mb-4">Home Base</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter mb-6 font-serif">
            A quiet archive of <span className="text-[#8C8A82]">images</span>, notes, and <span className="text-[#55544E]">personal records</span>.
          </h1>
          <p className="text-lg font-light text-[#55544E] mb-8">
            A personal website for photography, study notes, and selected fragments of daily life. Built as a calm, browsable archive rather than a stream of updates.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded-full bg-white/60 border border-black/5 text-[#55544E] text-sm">Photo Archive</span>
            <span className="px-4 py-2 rounded-full bg-white/60 border border-black/5 text-[#55544E] text-sm">Reading Notes</span>
            <span className="px-4 py-2 rounded-full bg-white/60 border border-black/5 text-[#55544E] text-sm">Physics</span>
            <span className="px-4 py-2 rounded-full bg-white/60 border border-black/5 text-[#55544E] text-sm">Travel</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
          {categories.map((cat, i) => (
            <motion.div 
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
            >
              <Link to={`/gallery/${cat.id}`} className="group block">
                <div className="overflow-hidden bg-[#D1CFC7] aspect-[3/4] mb-4 rounded-xl">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover grayscale-[30%] group-hover:scale-105 group-hover:grayscale-0 transition-all duration-[1.5s]"
                  />
                </div>
                <h2 className="text-xl font-light tracking-tight group-hover:italic transition-all font-serif">
                  {cat.title}
                </h2>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20"
        >
          <div className="p-8 bg-white/75 rounded-[28px] border border-white/60">
            <p className="text-xs uppercase tracking-widest text-[#8C8A82] mb-4">Current</p>
            <h2 className="text-2xl font-light tracking-tight mb-4 font-serif">Reading, shooting, and building quietly</h2>
            <p className="text-[#55544E] mb-6">
              Recently focusing on electrodynamics notes, small travel archives, and refining this site.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1.5 rounded-full bg-white/60 border border-black/5 text-[#55544E] text-xs">Reading Maxwell</span>
              <span className="px-3 py-1.5 rounded-full bg-white/60 border border-black/5 text-[#55544E] text-xs">Editing photos</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-8 mt-16">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#8C8A82] mb-4">Recent Photos</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#8C8A82]" />
                <Link to="/gallery/travel" className="text-sm hover:underline">Dali</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#8C8A82]" />
                <Link to="/gallery/daily" className="text-sm hover:underline">Santa Barbara Daily</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#8C8A82]" />
                <Link to="/gallery/film" className="text-sm hover:underline">Film Rolls</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-[#8C8A82] mb-4">Recent Notes</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#8C8A82]" />
                <Link to="/notes/maxwell-equation" className="text-sm hover:underline">Maxwell's Equation</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
