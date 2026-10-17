import { Link, useLocation, Outlet } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '../lib/utils'
import { CustomCursor } from './CustomCursor'

const navLinks = [
  { name: 'archive', path: '/gallery' },
  { name: 'journal', path: '/notes' },
  { name: 'about', path: '/about' },
]

export function Layout() {
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <CustomCursor />

      {/* Side Navigation — vertical text labels */}
      <nav className="side-nav fixed left-0 top-0 h-full w-12 flex flex-col justify-center items-center gap-10 z-50">
        {navLinks.map((link, i) => (
          <Link
            key={link.name}
            to={link.path}
            data-hover
            className={cn(
              isActive(link.path) && 'active'
            )}
            style={{ transitionDelay: `${300 + i * 80}ms` }}
          >
            {link.name}
          </Link>
        ))}
      </nav>

      {/* Branding — top left */}
      <div className="fixed top-8 left-16 z-40">
        <Link
          to="/"
          data-hover
          className="font-heading text-lg tracking-tight hover:opacity-60 transition-opacity"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          VanScii
        </Link>
      </div>

      {/* Main content area */}
      <main className="ml-[60px] min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-8 md:px-16 pt-24 pb-16"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
