import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Heart, ArrowUp } from 'lucide-react'

export default function CallToAction() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { margin: '-15% 0px' })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const bgOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1])

  const scrollToTop = () => {
    const hero = document.getElementById('hero')
    if (hero) hero.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={sectionRef}
      className="relative py-32 md:py-40 overflow-hidden bg-black"
    >
      {/* Ambient gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: bgOpacity }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px]"
          style={{
            background: 'radial-gradient(ellipse, rgba(255,143,163,0.06) 0%, rgba(135,206,235,0.04) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Heart icon */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -20 }}
          transition={{ type: 'spring', duration: 0.8, delay: 0.1 }}
          className="mx-auto mb-8"
        >
          <motion.div
            animate={isInView ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-16 h-16 rounded-full bg-pink-accent/10 border border-pink-accent/20 flex items-center justify-center mx-auto"
          >
            <Heart size={24} className="text-pink-accent/60" fill="currentColor" />
          </motion.div>
        </motion.div>

        {/* Main text */}
        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-3xl md:text-5xl font-bold text-white leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Want to know{' '}
          <span className="inline-block [perspective:400px] cursor-default group/flip">
            <span
              className="inline-block italic text-pink-accent group-hover/flip:text-sky group-hover/flip:[transform:rotateY(360deg)] transition-all duration-700 [transform-style:preserve-3d]"
            >more</span>
          </span>
          {' '}about us?
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-white/60 text-base md:text-lg mt-6 leading-relaxed italic"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Our story is just beginning. Scroll back to the top and relive every moment with us, from the very first day.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12"
        >
          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-3 rounded-full cursor-pointer overflow-hidden"
            style={{
              padding: '5px 14px',
              background: 'linear-gradient(135deg, rgba(255,143,163,0.15), rgba(135,206,235,0.15))',
              border: '1px solid rgba(255,143,163,0.25)',
            }}
          >
            {/* Hover shimmer */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, rgba(255,143,163,0.25), rgba(135,206,235,0.25))',
              }}
            />
            <span
              className="relative text-[10px] tracking-[0.2em] uppercase text-white/70 group-hover:text-white transition-colors duration-300"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Back to the beginning
            </span>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <ArrowUp size={16} className="text-pink-accent/70 group-hover:text-pink-accent transition-colors" />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="w-24 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto mt-16"
        />
      </div>
    </section>
  )
}
