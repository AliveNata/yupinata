import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Heart, ZoomIn, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface ImageItem {
  id: string
  path: string
  description: string
  display_order: number
}

// Image with scroll-driven clip reveal
function ScrollRevealImage({
  img,
  onClick,
}: {
  img: ImageItem
  onClick: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [clipValue, setClipValue] = useState(100)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const windowH = window.innerHeight

      // Center of element position in viewport, 0.5 = dead center
      const center = (rect.top + rect.height / 2) / windowH

      // Distance from viewport center (0.5), clamped 0-1
      // Closer to center = more revealed, further = more closed
      const distFromCenter = Math.abs(center - 0.5)

      // Start closing when element is far from center
      // 0-0.4 distance = fully open, 0.4-0.8 = closing, 0.8+ = fully closed
      if (distFromCenter < 0.35) {
        setClipValue(0)
      } else if (distFromCenter > 0.75) {
        setClipValue(100)
      } else {
        const progress = (distFromCenter - 0.35) / 0.4
        setClipValue(progress * 100)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // initial check
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      ref={ref}
      className="break-inside-avoid group relative cursor-pointer"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-xl">
        <div
          style={{ clipPath: `inset(0 0 ${clipValue}% 0)` }}
          className="transition-[clip-path] duration-100 ease-out"
        >
          <img
            src={img.path}
            alt={img.description}
            className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
            loading="lazy"
          />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 rounded-xl" />

        {/* Hover info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Heart size={10} className="text-pink-accent" fill="currentColor" />
              <span className="text-white/70 text-[11px]">{img.description}</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <ZoomIn size={10} className="text-white/70" />
            </div>
          </div>
        </div>

        <div className="absolute inset-0 rounded-xl border border-white/0 group-hover:border-white/10 transition-all duration-400" />
      </div>
    </div>
  )
}

const MAX_DISPLAY = 14

export default function OurIntimate() {
  const [allImages, setAllImages] = useState<ImageItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const nav = useNavigate()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const titleY = useTransform(scrollYProgress, [0, 0.25], [60, 0])
  const titleOpacity = useTransform(scrollYProgress, [0.05, 0.18], [0, 1])

  useEffect(() => {
    async function fetchImages() {
      const { data } = await supabase
        .from('images')
        .select('*')
        .in('section', ['intimate', 'gallery'])
        .order('display_order')
      if (data) setAllImages(data)
    }
    fetchImages()
  }, [])

  const displayImages = allImages.slice(0, MAX_DISPLAY)
  const remainingCount = Math.max(0, allImages.length - MAX_DISPLAY)

  const closeLightbox = () => setSelectedIndex(null)

  const navigate = useCallback(
    (dir: 'prev' | 'next') => {
      if (selectedIndex === null) return
      if (dir === 'prev') setSelectedIndex(selectedIndex === 0 ? displayImages.length - 1 : selectedIndex - 1)
      else setSelectedIndex((selectedIndex + 1) % displayImages.length)
    },
    [selectedIndex, displayImages.length]
  )

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') navigate('prev')
      if (e.key === 'ArrowRight') navigate('next')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedIndex, navigate])

  return (
    <section ref={sectionRef} id="our-intimate" className="relative py-28 overflow-hidden bg-dark">
      {/* Background — gelap seperti Who We Are */}
      <div className="absolute inset-0 bg-black/90" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,143,163,0.2) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,143,163,0.2) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight tracking-tight uppercase"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            OUR{' '}
            <span className="italic" style={{
              background: 'linear-gradient(90deg, #FF8FA3 0%, #FFB6C1 30%, #FFE4E8 50%, #B0E2FF 70%, #87CEEB 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>INTIMATE</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-white/20 text-xs tracking-[0.25em] uppercase"
          >
            Explore our gallery of happiness
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            className="w-20 h-[1px] bg-gradient-to-r from-pink-accent/40 to-sky/40 mx-auto mt-6"
          />
        </motion.div>

        {/* Masonry grid — scroll-linked reveal/close animation */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 mb-8">
          {displayImages.map((img, index) => (
            <ScrollRevealImage
              key={img.id}
              img={img}
              onClick={() => setSelectedIndex(index)}
            />
          ))}
        </div>

        {/* CTA — See all in Gallery */}
        {remainingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 50 }}
            className="" style={{ marginTop: '30px' }}
          >
            <motion.div
              onClick={() => nav('/gallery')}
              className="group relative block w-full overflow-hidden rounded-3xl border border-white/[0.04] hover:border-pink-accent/20 transition-all duration-1000 cursor-pointer"
              whileHover={{ scale: 1.008 }}
              whileTap={{ scale: 0.995 }}
            >
              {/* Animated background — scrolling photo strip */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="flex h-full"
                  animate={{ x: ['0%', '-50%'] }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                >
                  {[...allImages.slice(MAX_DISPLAY, MAX_DISPLAY + 8), ...allImages.slice(MAX_DISPLAY, MAX_DISPLAY + 8)].map((img, i) => (
                    <div key={`strip-${i}`} className="flex-shrink-0 w-48 h-full">
                      <img src={img.path} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </motion.div>
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/75 group-hover:bg-black/65 transition-all duration-700" />
                {/* Gradient edges */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
              </div>

              {/* Glow effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(255,143,163,0.08), transparent 70%)',
                }}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8" style={{ padding: '0.5rem 2.5rem 0.5rem 3rem' }}>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Animated stacked photos */}
                  <div className="relative w-28 h-20 flex-shrink-0">
                    {allImages.slice(MAX_DISPLAY, MAX_DISPLAY + 4).map((img, i) => (
                      <motion.div
                        key={img.id}
                        className="absolute w-14 h-18 rounded-xl overflow-hidden border border-white/15 shadow-2xl"
                        style={{
                          left: i * 14,
                          top: i % 2 === 0 ? 0 : 4,
                          zIndex: 4 - i,
                        }}
                        animate={{
                          rotate: [(i - 1.5) * 5, (i - 1.5) * 7, (i - 1.5) * 5],
                          y: [0, -3, 0],
                        }}
                        transition={{
                          duration: 3 + i * 0.5,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      >
                        <img src={img.path} alt="" className="w-full h-full object-cover" />
                      </motion.div>
                    ))}
                  </div>

                  <div className="text-center md:text-left">
                    <motion.h3
                      className="text-white text-2xl md:text-3xl font-bold group-hover:text-pink-accent transition-colors duration-500"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      Explore Full Gallery
                    </motion.h3>
                    <p className="text-white/30 text-sm mt-2 group-hover:text-white/45 transition-colors duration-500">
                      +{remainingCount} more moments waiting to be discovered
                    </p>
                  </div>
                </div>

                {/* Animated arrow circle */}
                <motion.div className="relative flex-shrink-0">
                  {/* Spinning ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-1"
                  >
                    <svg viewBox="0 0 60 60" className="w-full h-full">
                      <circle
                        cx="30" cy="30" r="28"
                        fill="none"
                        stroke="rgba(255,143,163,0.2)"
                        strokeWidth="1"
                        strokeDasharray="8 6"
                        className="group-hover:stroke-[rgba(255,143,163,0.5)] transition-all duration-500"
                      />
                    </svg>
                  </motion.div>

                  <motion.div
                    className="w-14 h-14 rounded-full border border-white/10 group-hover:border-pink-accent/50 group-hover:bg-pink-accent/15 flex items-center justify-center transition-all duration-500"
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight size={20} className="text-white/40 group-hover:text-pink-accent transition-colors duration-500" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}

      </div>

      {/* Minimal stats — centered to full viewport */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative z-10 mt-6 w-full text-center text-white/40 text-[10px] tracking-[0.4em] uppercase"
      >
        {displayImages.length} of {allImages.length} photos · Click to enlarge
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && displayImages[selectedIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />

            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-10 w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <X size={16} className="text-white" />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={(e) => { e.stopPropagation(); navigate('prev') }}
              className="absolute left-4 md:left-8 z-10 w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <ChevronLeft size={16} className="text-white" />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={(e) => { e.stopPropagation(); navigate('next') }}
              className="absolute right-4 md:right-8 z-10 w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <ChevronRight size={16} className="text-white" />
            </motion.button>

            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -30 }}
              transition={{ type: 'spring', stiffness: 250, damping: 25 }}
              className="relative max-w-[90vw] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={displayImages[selectedIndex].path}
                alt={displayImages[selectedIndex].description}
                className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-5 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10"
            >
              <span className="text-white/50 text-sm">{displayImages[selectedIndex].description}</span>
              <div className="w-[1px] h-3 bg-white/10" />
              <span className="text-white/25 text-xs font-mono">{selectedIndex + 1} / {displayImages.length}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
