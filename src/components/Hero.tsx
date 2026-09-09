import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Particles from './Particles'

interface HeroImage {
  path: string
  description: string
}

const kenburnsClasses = ['kenburns-1', 'kenburns-2', 'kenburns-3']

export default function Hero() {
  const [images, setImages] = useState<HeroImage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [heroTitle, setHeroTitle] = useState('YUPI & NATA')
  const [heroSubtitle, setHeroSubtitle] = useState('THE PARTNER OF CRIME')

  useEffect(() => {
    async function fetchData() {
      // Fetch hero section data
      const { data: sectionData } = await supabase
        .from('sections')
        .select('*')
        .eq('name', 'hero')
        .single()

      if (sectionData) {
        setHeroTitle(sectionData.title)
        setHeroSubtitle(sectionData.content)
      }

      // Fetch hero/intimate images for slideshow
      const { data: imageData } = await supabase
        .from('images')
        .select('path, description')
        .in('section', ['intimate', 'gallery'])
        .order('display_order')

      if (imageData && imageData.length > 0) {
        setImages(imageData)
      }
    }
    fetchData()
  }, [])

  // Auto-rotate images
  useEffect(() => {
    if (images.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [images.length])

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      {/* Background slideshow with Ken Burns */}
      <AnimatePresence mode="wait">
        {images.length > 0 && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <div
              className={`absolute inset-0 bg-cover bg-center ${kenburnsClasses[currentIndex % 3]}`}
              style={{ backgroundImage: `url('${images[currentIndex].path}')` }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-[1]" />

      {/* Aurora gradient overlay */}
      <div className="absolute inset-0 aurora-bg z-[2]" />

      {/* Floating particles */}
      <Particles />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4">
        {/* Decorative line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="h-[1px] bg-gradient-to-r from-transparent via-pink-accent to-transparent mb-8"
        />

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-wider"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span className="text-white">{heroTitle.split('&')[0]}</span>
          <span className="text-pink-accent">&</span>
          <span className="text-white">{heroTitle.split('&')[1] || ''}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-4 text-sm md:text-base tracking-[0.3em] uppercase text-white/70 font-light"
        >
          {heroSubtitle}
        </motion.p>

        {/* Decorative line bottom */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ duration: 1.5, delay: 1 }}
          className="h-[1px] bg-gradient-to-r from-transparent via-sky to-transparent mt-8"
        />

        {/* Image indicator dots */}
        {images.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex gap-2 mt-12"
          >
            {images.slice(0, Math.min(images.length, 8)).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  i === currentIndex % Math.min(images.length, 8)
                    ? 'bg-pink-accent w-6'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 2 },
          y: { duration: 2, repeat: Infinity },
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-xs tracking-[0.2em] uppercase text-white/40">Scroll</span>
        <ChevronDown className="text-white/40" size={20} />
      </motion.div>
    </section>
  )
}
