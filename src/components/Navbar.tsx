import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Heart, ChevronDown } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  { title: 'Home', section: 'hero' },
  { title: 'Who We Are?', section: 'who-we-are' },
  { title: 'Our Intimate', section: 'our-intimate' },
  { title: 'About Us', section: 'about' },
  { title: 'Music', section: 'music' },
]

const extrasItems = [
  { title: 'Gallery', path: '/gallery', newTab: false },
  { title: 'Yupi Coklat', path: '/yupi-coklat', newTab: false },
  { title: 'Nata Goricx', path: '/nata-goricx', newTab: false },
]

export default function Navbar() {
  const [hidden, setHidden] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [extrasOpen, setExtrasOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Only do hero-based hide/show on home page
    if (location.pathname !== '/') {
      setHidden(false)
      setScrolled(true)
      return
    }

    const handleScroll = () => {
      const heroEl = document.getElementById('hero')
      const heroBottom = heroEl ? heroEl.offsetTop + heroEl.offsetHeight : window.innerHeight
      if (window.scrollY < heroBottom - 100) {
        setHidden(true)
        setScrolled(false)
      } else {
        setHidden(false)
        setScrolled(true)
      }
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [location.pathname])

  const scrollTo = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 900)
    } else {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
    setMenuOpen(false)
    setExtrasOpen(false)
  }

  const handleExtrasClick = (item: typeof extrasItems[0]) => {
    setExtrasOpen(false)
    setMenuOpen(false)
    if (item.newTab) {
      window.open(item.path, '_blank', 'noopener,noreferrer')
    } else {
      navigate(item.path)
    }
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => scrollTo('hero')} className="flex items-center gap-2 group cursor-pointer">
          <Heart
            size={20}
            className="text-pink-accent group-hover:scale-110 transition-transform"
            fill="currentColor"
          />
          <span
            className="text-lg font-bold tracking-wider text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Y & N
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.section}
              onClick={() => scrollTo(item.section)}
              className="text-sm tracking-wider text-white/60 hover:text-pink-accent transition-colors uppercase cursor-pointer"
            >
              {item.title}
            </button>
          ))}

          {/* EXTRAS dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setExtrasOpen(true)}
            onMouseLeave={() => setExtrasOpen(false)}
          >
            <button
              className="flex items-center gap-1 text-sm tracking-wider text-white/60 hover:text-pink-accent transition-colors uppercase cursor-pointer"
              onClick={() => setExtrasOpen(!extrasOpen)}
            >
              Extras
              <ChevronDown size={14} className={`transition-transform duration-300 ${extrasOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {extrasOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden min-w-[160px]"
                >
                  {extrasItems.map((item) => (
                    <button
                      key={item.title}
                      onClick={() => handleExtrasClick(item)}
                      className="w-full text-left px-4 py-2.5 text-sm text-white/60 hover:text-pink-accent hover:bg-white/5 transition-all duration-200 uppercase tracking-wider cursor-pointer"
                    >
                      {item.title}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white/80 cursor-pointer"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/5 overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              {navItems.map((item) => (
                <button
                  key={item.section}
                  onClick={() => scrollTo(item.section)}
                  className="text-left text-sm tracking-wider text-white/60 hover:text-pink-accent transition-colors uppercase py-2 cursor-pointer"
                >
                  {item.title}
                </button>
              ))}
              <div className="border-t border-white/5 pt-3 mt-1">
                <p className="text-[10px] tracking-[0.3em] uppercase text-white/25 mb-2">Extras</p>
                {extrasItems.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => handleExtrasClick(item)}
                    className="block w-full text-left text-sm tracking-wider text-white/60 hover:text-pink-accent transition-colors uppercase py-2 cursor-pointer"
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
