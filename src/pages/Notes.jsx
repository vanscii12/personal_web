import { Link } from 'react-router'
import { motion } from 'motion/react'
import { notes, categories } from '../notes/index.js'

export function Notes() {
  return (
    <div className="pt-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <aside className="lg:col-span-1">
            <div className="sticky top-32">
              <p className="text-xs uppercase tracking-widest text-[#8C8A82] mb-4">Browse Notes</p>
              <p className="text-sm text-[#55544E] leading-relaxed mb-6">
                按学科和主题浏览，已经发布的笔记可以直接进入正文页。
              </p>
              <nav className="space-y-2">
                {categories.map(cat => (
                  <Link 
                    key={cat}
                    to={`/notes/${cat.toLowerCase()}`}
                    className="block px-4 py-2 rounded-lg text-sm text-[#55544E] hover:bg-white/60 transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="p-12 bg-white/75 rounded-[28px] border border-white/60 mb-10">
              <p className="text-xs uppercase tracking-widest text-[#8C8A82] mb-4">Knowledge Base</p>
              <h1 className="text-5xl md:text-6xl font-light tracking-tighter mb-6 font-serif">
                Notes<span className="text-[#8C8A82] italic">.</span>
              </h1>
              <p className="text-lg font-light text-[#55544E] max-w-xl mb-8">
                这里更像一个笔记主页：左边是目录树，右边是按学科整理后的卡片区。已发布的内容可以直接点进具体笔记页，未完成的条目先保留为占位。
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 rounded-full bg-white/60 border border-black/5 text-[#55544E] text-sm">
                  {categories.length} categories
                </span>
                <span className="px-4 py-2 rounded-full bg-white/60 border border-black/5 text-[#55544E] text-sm">
                  {notes.length} notes
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notes.map((note, index) => (
                <motion.article 
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <Link 
                    to={`/notes/${note.id}`}
                    className="block p-6 bg-white/70 rounded-2xl border border-white/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-xs uppercase tracking-widest text-[#8C8A82]">{note.category}</span>
                      <span className="text-xs text-[#8C8A82]">{note.date}</span>
                    </div>
                    <h2 className="text-2xl font-light tracking-tight mb-3 font-serif group-hover:italic transition-all">
                      {note.title}
                    </h2>
                    <p className="text-sm text-[#55544E] leading-relaxed mb-4">
                      {note.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 rounded-full bg-white/60 border border-black/5 text-[#55544E] text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
