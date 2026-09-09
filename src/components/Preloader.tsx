import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

const quotes = [
  'Preparing our memories...',
  'Gathering moments together...',
  'Painting the stars...',
  'Connecting two hearts...',
  'Loading our story...',
  'Almost there...',
]

// Interactive particle that follows mouse with delay
function Particle({ index, mousePos, progress }: {
  index: number; mousePos: { x: number; y: number }; progress: number
}) {
  const config = useMemo(() => {
    const angle = (index / 20) * Math.PI * 2
    const radius = 80 + Math.random() * 160
    const speed = 0.3 + Math.random() * 0.7
    const size = 2 + Math.random() * 4
    const delay = index * 0.05
    const isPink = Math.random() > 0.5
    return { angle, radius, speed, size, delay, isPink }
  }, [index])

  // Orbit center follows mouse slightly
  const cx = 50 + (mousePos.x - 50) * 0.15
  const cy = 50 + (mousePos.y - 50) * 0.15

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: progress > 5 ? [0, 0.6, 0.3, 0.6] : 0,
        scale: progress > 5 ? 1 : 0,
        x: [
          `calc(${cx}vw + ${Math.cos(config.angle) * config.radius}px)`,
          `calc(${cx}vw + ${Math.cos(config.angle + Math.PI) * config.radius}px)`,
          `calc(${cx}vw + ${Math.cos(config.angle + Math.PI * 2) * config.radius}px)`,
        ],
        y: [
          `calc(${cy}vh + ${Math.sin(config.angle) * config.radius}px)`,
          `calc(${cy}vh + ${Math.sin(config.angle + Math.PI) * config.radius}px)`,
          `calc(${cy}vh + ${Math.sin(config.angle + Math.PI * 2) * config.radius}px)`,
        ],
      }}
      transition={{
        opacity: { duration: 3, repeat: Infinity, delay: config.delay },
        scale: { duration: 0.6, delay: config.delay },
        x: { duration: 8 / config.speed, repeat: Infinity, ease: 'linear' },
        y: { duration: 8 / config.speed, repeat: Infinity, ease: 'linear' },
      }}
      className="absolute rounded-full pointer-events-none"
      style={{
        width: config.size,
        height: config.size,
        background: config.isPink ? '#FF8FA3' : '#87CEEB',
        filter: `blur(${config.size > 4 ? 1 : 0}px)`,
        left: 0,
        top: 0,
      }}
    />
  )
}

// Click/touch ripple effect
function Ripple({ x, y, id, onDone }: { x: number; y: number; id: number; onDone: (id: number) => void }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0.5 }}
      animate={{ scale: 3, opacity: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      onAnimationComplete={() => onDone(id)}
      className="absolute pointer-events-none rounded-full"
      style={{
        width: 60,
        height: 60,
        left: x - 30,
        top: y - 30,
        border: '1px solid rgba(255,143,163,0.4)',
        boxShadow: '0 0 20px rgba(255,143,163,0.15)',
      }}
    />
  )
}

// SVG heart that draws itself based on progress, with percentage inside
function HeartProgress({ progress }: { progress: number }) {
  const heartPath = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
  const pathLength = 65
  const drawn = (progress / 100) * pathLength
  const fillOpacity = progress >= 100 ? 0.2 : (progress / 100) * 0.08

  return (
    <motion.div
      className="relative"
      animate={progress >= 100 ? {
        scale: [1, 1.3, 0.9, 1.1, 1],
      } : {}}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 24 24" width="120" height="120" className="drop-shadow-lg">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8FA3" />
            <stop offset="100%" stopColor="#87CEEB" />
          </linearGradient>
        </defs>
        {/* Background heart outline (dim) */}
        <path
          d={heartPath}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.6"
        />
        {/* Drawing heart stroke */}
        <path
          d={heartPath}
          fill={`rgba(255,143,163,${fillOpacity})`}
          stroke="url(#heartGrad)"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={pathLength - drawn}
          filter="url(#glow)"
          style={{ transition: 'stroke-dashoffset 0.4s ease, fill 0.6s ease' }}
        />
      </svg>
      {/* Percentage inside the heart */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: '8px' }}>
        <span
          className="text-white/60 text-lg font-light tracking-wider"
          style={{ fontFamily: 'var(--font-body)', transition: 'color 0.4s ease', color: progress >= 100 ? 'rgba(255,143,163,0.8)' : 'rgba(255,255,255,0.5)' }}
        >
          {progress}
          <span className="text-[9px] ml-0.5" style={{ color: progress >= 100 ? 'rgba(255,143,163,0.5)' : 'rgba(255,255,255,0.25)' }}>%</span>
        </span>
      </div>
    </motion.div>
  )
}

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [exiting, setExiting] = useState(false)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])
  const rippleId = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Remove the HTML splash screen once React has mounted
  useEffect(() => {
    const splash = document.getElementById('splash')
    if (splash) {
      splash.style.opacity = '0'
      setTimeout(() => splash.remove(), 600)
    }
  }, [])

  // Rotate quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(i => (i + 1) % quotes.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  // Track mouse position (percentage)
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }
    const handleTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) {
        setMousePos({
          x: (t.clientX / window.innerWidth) * 100,
          y: (t.clientY / window.innerHeight) * 100,
        })
      }
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchmove', handleTouch)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleTouch)
    }
  }, [])

  // Click/touch creates ripple
  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = clientX - rect.left
    const y = clientY - rect.top
    setRipples(prev => [...prev, { x, y, id: rippleId.current++ }])
  }, [])

  const removeRipple = useCallback((id: number) => {
    setRipples(prev => prev.filter(r => r.id !== id))
  }, [])

  const loadAll = useCallback(async () => {
    try {
      setProgress(5)

      const { data: allImages } = await supabase
        .from('images')
        .select('path')

      const imageUrls: string[] = []

      if (allImages) {
        allImages.forEach((img: any) => {
          if (img.path) imageUrls.push(img.path)
        })
      }

      imageUrls.push(
        'https://bmuglekfjylmubukthjc.supabase.co/storage/v1/object/public/images/yupi-coklat.png',
        'https://bmuglekfjylmubukthjc.supabase.co/storage/v1/object/public/images/nata-goricx.png'
      )

      if (imageUrls.length === 0) {
        setProgress(100)
        setTimeout(() => { setExiting(true) }, 800)
        return
      }

      setProgress(10)

      let loaded = 0
      const total = imageUrls.length
      const batchSize = 4
      for (let i = 0; i < total; i += batchSize) {
        const batch = imageUrls.slice(i, i + batchSize)
        await Promise.all(batch.map(preloadImage))
        loaded += batch.length
        const p = 10 + Math.floor((loaded / total) * 85)
        setProgress(p)
      }

      setProgress(100)
      setTimeout(() => { setExiting(true) }, 1000)
    } catch {
      setProgress(100)
      setTimeout(() => { setExiting(true) }, 600)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const particles = useMemo(() => Array.from({ length: 20 }, (_, i) => i), [])

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!exiting && (
        <motion.div
          ref={containerRef}
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden cursor-crosshair select-none"
          onClick={(e) => handleInteraction(e.clientX, e.clientY)}
          onTouchStart={(e) => {
            const t = e.touches[0]
            if (t) handleInteraction(t.clientX, t.clientY)
          }}
        >
          {/* Subtle radial gradient following mouse */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-out"
            style={{
              background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,143,163,0.04), rgba(135,206,235,0.02), transparent 70%)`,
            }}
          />

          {/* Floating particles */}
          {particles.map(i => (
            <Particle key={i} index={i} mousePos={mousePos} progress={progress} />
          ))}

          {/* Click ripples */}
          <AnimatePresence>
            {ripples.map(r => (
              <Ripple key={r.id} {...r} onDone={removeRipple} />
            ))}
          </AnimatePresence>

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Heart SVG drawing itself with percentage inside */}
            <HeartProgress progress={progress} />

            {/* Rotating quotes */}
            <div className="h-5 overflow-hidden mt-6">
              <AnimatePresence mode="wait">
                <motion.p
                  key={quoteIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="text-white/30 text-[11px] tracking-[0.2em] uppercase text-center"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {progress >= 100 ? '✦ Welcome ✦' : quotes[quoteIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Tap hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 2 }}
              className="text-white/20 text-[9px] tracking-widest uppercase mt-8"
            >
              tap anywhere ✦
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
