import { Link, useLocation, Outlet } from 'react-router'
import { motion } from 'motion/react'
import { cn } from '../lib/utils'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Notes', path: '/notes' },
]

export function Layout() {
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-[#EBE9E1] text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-[#EBE9E1] relative overflow-x-hidden">
      <div className="fixed top-8 left-8 z-40">
        <Link to="/" className="text-2xl font-light tracking-tighter hover:italic transition-all font-serif">
          VanScii©
        </Link>
      </div>

      <div className="fixed bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-50 w-[90%] md:w-auto flex justify-center">
        <nav className="flex items-center gap-1 p-1.5 bg-[#1A1A1A]/95 backdrop-blur-xl rounded-full shadow-2xl shadow-black/20 border border-white/10 w-full md:w-auto justify-between md:justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="relative px-6 py-3 rounded-full text-xs uppercase tracking-widest transition-colors duration-300 w-full md:w-auto text-center"
            >
              {isActive(link.path) && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-0 bg-[#EBE9E1] rounded-full shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className={cn("relative z-10 font-medium", isActive(link.path) ? "text-[#1A1A1A]" : "text-[#A1A1AA] hover:text-white")}>
                {link.name}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      <main className="pt-32 pb-48 px-6 md:px-12 min-h-screen max-w-5xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
