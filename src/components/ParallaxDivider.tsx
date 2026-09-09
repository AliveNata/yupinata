import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { supabase } from '../lib/supabase'

/* ── Shooting Star ── */
function ShootingStar() {
  const [key, setKey] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => setKey(1), 4000)
    const interval = setInterval(() => setKey(k => k + 1), 15000)
    return () => { clearTimeout(timeout); clearInterval(interval) }
  }, [])

  // Trajectory: top-right to bottom-left (yellow line in screenshot)
  // Start: top-right corner, End: left side ~55% down
  // Angle ≈ 22deg downward from horizontal
  return (
    <motion.div
      key={key}
      className="absolute pointer-events-none"
      style={{ top: '5%', right: '-2%', zIndex: 15 }}
      initial={{ x: 0, y: 0 }}
      animate={{
        x: [0, -1200],
        y: [0, 350],
      }}
      transition={{
        duration: 9,
        ease: 'linear',
      }}
    >
      {/* Head — fades out first */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.9, 0.9, 0] }}
        transition={{ duration: 9, ease: 'linear', times: [0, 0.03, 0.35, 0.42] }}
        style={{
          width: '3px',
          height: '3px',
          background: 'white',
          borderRadius: '50%',
          boxShadow: '0 0 8px 3px rgba(255,255,255,0.8), 0 0 20px rgba(200,220,255,0.4)',
        }}
      />
      {/* Tail — shrinks from head-end after head fades, tip lingers last */}
      <motion.div
        initial={{ opacity: 0, clipPath: 'inset(0 0 0 0%)' }}
        animate={{
          opacity: [0, 0.7, 0.7, 0.5, 0],
          clipPath: [
            'inset(0 0 0 0%)',
            'inset(0 0 0 0%)',
            'inset(0 0 0 0%)',
            'inset(0 0 0 60%)',
            'inset(0 0 0 100%)',
          ],
        }}
        transition={{ duration: 9, ease: 'linear', times: [0, 0.03, 0.38, 0.46, 0.52] }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '120px',
          height: '1.5px',
          background: 'linear-gradient(to right, rgba(255,255,255,0.7), rgba(200,220,255,0.3), transparent)',
          transformOrigin: 'left center',
          transform: 'translateY(-50%) rotate(-16deg)',
        }}
      />
    </motion.div>
  )
}

/* ── Twinkling Stars ── */
function TwinklingStars() {
  const stars = useRef(
    Array.from({ length: 60 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 25,
      size: 1 + Math.random() * 2.5,
      duration: 1.5 + Math.random() * 3,
      delay: Math.random() * 6,
      minOpacity: 0.03,
      maxOpacity: 0.3 + Math.random() * 0.6,
    }))
  ).current

  return (
    <>
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: 'white',
            zIndex: 15,
            boxShadow: star.size > 2
              ? `0 0 ${star.size * 2}px rgba(255,255,255,0.4), 0 0 ${star.size * 4}px rgba(200,220,255,0.2)`
              : 'none',
          }}
          animate={{
            opacity: [star.minOpacity, star.maxOpacity, star.minOpacity],
            scale: [0.6, 1.3, 0.6],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  )
}

/* ── Scroll-driven Handwriting Text ── */
function ScrollHandwriting({ text, progress }: { text: string; progress: number }) {
  const charCount = Math.floor(progress * text.length)

  return (
    <span>
      <span>{text.slice(0, charCount)}</span>
      {charCount > 0 && charCount < text.length && (
        <motion.span
          className="inline-block w-[2px] bg-white/60 ml-0.5 align-middle"
          style={{ height: '0.7em' }}
          animate={{ opacity: [0.8, 0.3, 0.8] }}
          transition={{ duration: 0.4, repeat: Infinity }}
        />
      )}
    </span>
  )
}

/* ── Main Component ── */
export default function ParallaxDivider() {
  const [bgImage, setBgImage] = useState('')
  const [textProgress, setTextProgress] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const overlayOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.85, 0.15, 0.15, 0.85])
  // 0.25 = section top at viewport top (fully entered)
  // 0.5 = section centered in viewport
  // Text: empty before section enters, full when section is 100% in view
  const textWrite = useTransform(scrollYProgress, [0.1, 0.5], [0, 1])

  useEffect(() => {
    const unsubscribe = textWrite.on('change', (v) => setTextProgress(v))
    return unsubscribe
  }, [textWrite])

  useEffect(() => {
    supabase
      .from('images')
      .select('path')
      .eq('section', 'parallax')
      .maybeSingle()
      .then(({ data }) => { if (data?.path) setBgImage(data.path) })
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: '100vh' }}
    >
      {/* True CSS parallax background — fixed, doesn't move on scroll */}
      {bgImage ? (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${bgImage}')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-accent/20 via-dark to-sky/20" />
      )}

      {/* Dynamic dark overlay */}
      <motion.div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)' }}
      />

      {/*
        Fixed layer for stars & shooting star.
        position:fixed makes them stay in place like the bg photo.
        Clip to this section via the overflow:hidden on the parent.
      */}
      <div className="absolute inset-0" style={{ clipPath: 'inset(0)' }}>
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {/* Twinkling stars — fixed, won't scroll */}
          <TwinklingStars />

          {/* Shooting star — fixed, auto-hides at ~50% height via opacity timing
              The green box boundary is roughly the bottom half.
              The star fades out at times[2]=0.7 which is ~50% of viewport height */}
          <ShootingStar />
        </div>
      </div>

      {/* Handwritten quote — lower area, above gradient */}
      <div className="absolute inset-0 z-20 flex items-end justify-center pointer-events-none" style={{ paddingBottom: '12vh' }}>
        <p
          className="text-white/50 text-3xl md:text-5xl lg:text-6xl italic text-center max-w-4xl px-10 leading-snug"
          style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          <ScrollHandwriting
            text="You and me, against the world, until our very last breath."
            progress={textProgress}
          />
        </p>
      </div>

      {/* Scan line effect */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.006) 2px, rgba(255,255,255,0.006) 4px)',
        }}
      />

      {/* Top/bottom fade edges */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent z-30" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-30" />
    </section>
  )
}
