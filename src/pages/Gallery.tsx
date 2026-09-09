import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ZoomIn, X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Footer from '../components/Footer'

interface ImageItem {
  id: number
  path: string
  description: string
  section: string
  display_order: number
}

function ScrollRevealImage({ img, onClick }: { img: ImageItem; onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [clipValue, setClipValue] = useState(100)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const center = (rect.top + rect.height / 2) / window.innerHeight
      const dist = Math.abs(center - 0.5)
      if (dist < 0.35) setClipValue(0)
      else if (dist > 0.75) setClipValue(100)
      else setClipValue(((dist - 0.35) / 0.4) * 100)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div ref={ref} className="break-inside-avoid group relative cursor-pointer" onClick={onClick}>
      <div className="relative overflow-hidden rounded-xl">
        <div style={{ clipPath: `inset(0 0 ${clipValue}% 0)` }} className="transition-[clip-path] duration-100 ease-out">
          <img
            src={img.path}
            alt={img.description}
            className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
            loading="lazy"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 rounded-xl" />
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

export default function Gallery() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
    supabase
      .from('images')
      .select('*')
      .in('section', ['intimate', 'gallery'])
      .order('display_order')
      .then(({ data }) => { if (data) setImages(data) })
  }, [])

  const closeLightbox = () => setSelectedIndex(null)

  const navLightbox = useCallback(
    (dir: 'prev' | 'next') => {
      if (selectedIndex === null) return
      if (dir === 'prev') setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)
      else setSelectedIndex((selectedIndex + 1) % images.length)
    },
    [selectedIndex, images.length]
  )

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') navLightbox('prev')
      if (e.key === 'ArrowRight') navLightbox('next')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedIndex, navLightbox])

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
      className="bg-dark min-h-screen"
    >
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 z-50 flex items-center rounded-full bg-black/60 backdrop-blur-xl border border-white/10 hover:border-pink-accent/30 transition-all duration-300 group cursor-pointer"
        style={{ padding: '8px 20px', gap: '12px' }}
      >
        <ArrowLeft size={14} className="text-white/50 group-hover:text-pink-accent transition-colors" />
        <span className="text-white/50 text-xs tracking-wider uppercase group-hover:text-white transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
          Back
        </span>
      </motion.button>

      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
            className="inline-block mb-4"
          >
            <span className="text-xs tracking-[0.3em] uppercase text-pink-accent/60 border border-pink-accent/20 px-4 py-2 rounded-full">
              Every frame tells a story
            </span>
          </motion.div>

          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white uppercase tracking-tight mt-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            OUR{' '}
            <span className="italic" style={{
              background: 'linear-gradient(90deg, #FF8FA3 0%, #FFB6C1 30%, #FFE4E8 50%, #B0E2FF 70%, #87CEEB 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>GALLERY</span>
          </h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="w-20 h-[1px] bg-gradient-to-r from-pink-accent/40 to-sky/40 mx-auto mt-8"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white/40 text-sm italic leading-relaxed text-center"
            style={{ fontFamily: 'var(--font-display)', maxWidth: '28rem', margin: '1.5rem auto 0' }}
          >
            {images.length} moments we've captured together. Each photo holds a memory, a laugh, a look that words could never describe.
          </motion.p>
        </motion.div>

        {/* Masonry grid with scroll-reveal */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {images.map((img, index) => (
            <ScrollRevealImage
              key={img.id}
              img={img}
              onClick={() => setSelectedIndex(index)}
            />
          ))}
        </div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase">
            {images.length} photos · Our story in frames
          </p>
        </motion.div>
      </div>

      <Footer />

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && images[selectedIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} className="text-white/60" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navLightbox('prev') }}
              className="absolute left-4 md:left-8 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronLeft size={18} className="text-white/60" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navLightbox('next') }}
              className="absolute right-4 md:right-8 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronRight size={18} className="text-white/60" />
            </button>

            <motion.img
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              src={images[selectedIndex].path}
              alt={images[selectedIndex].description}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-6 left-0 right-0 text-center">
              <p className="text-white/40 text-xs">{images[selectedIndex].description}</p>
              <p className="text-white/20 text-[10px] mt-1">{selectedIndex + 1} / {images.length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
