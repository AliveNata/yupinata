import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import { Heart, MapPin, MessageCircleHeart, Gem, Church } from 'lucide-react'
import { supabase } from '../lib/supabase'

const timeline = [
  { date: '21 Feb 2020', title: 'First Meet', desc: 'Our paths crossed for the first time at the Casino parking lot. A moment that would change everything.', icon: <MapPin size={16} /> },
  { date: '27 Feb 2020', title: 'Started Our Journey', desc: 'Six days later, the feelings were undeniable. We confessed and officially started our relationship.', icon: <MessageCircleHeart size={16} /> },
  { date: '24 Apr 2020', title: 'The Proposal', desc: 'Through hard times, laughter and tears, we grew stronger. The moment came to take it to the next level.', icon: <Gem size={16} /> },
  { date: '29 Jun 2020', title: 'Married', desc: 'We finally said "I do." The beginning of forever, together until the very end.', icon: <Church size={16} /> },
]

const nodeOrder = [0, 2, 1, 3]

const romanticWords = [
  'Forever Yours',
  'Endless Love',
  'Soulmates',
  'My Everything',
  'Two Hearts, One Soul',
  'Written in the Stars',
  'Meant to Be',
  'Until the End',
  'You Complete Me',
  'Always & Forever',
]

const hoverColors = [
  'rgba(255,143,163,0.7)',
  'rgba(135,206,235,0.7)',
  'rgba(255,182,193,0.7)',
  'rgba(176,226,255,0.7)',
  'rgba(232,96,122,0.7)',
  'rgba(91,163,201,0.7)',
]

function useDaysSince(dateStr: string) {
  const calc = useCallback(() => Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000), [dateStr])
  const [days, setDays] = useState(calc)
  useEffect(() => {
    const now = new Date()
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()
    const timeout = setTimeout(() => {
      setDays(calc())
      const interval = setInterval(() => setDays(calc()), 86400000)
      return () => clearInterval(interval)
    }, msUntilMidnight)
    return () => clearTimeout(timeout)
  }, [calc])
  return days
}

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    let s = 0
    const step = (t: number) => { if (!s) s = t; const p = Math.min((t - s) / 2000, 1); setN(Math.floor((1 - (1 - p) ** 3) * target)); if (p < 1) requestAnimationFrame(step) }
    requestAnimationFrame(step)
  }, [inView, target])
  return <span ref={ref}>{n}{suffix}</span>
}

function FloatingWord({ word, x, y, onRemove, id }: {
  word: string; x: number; y: number; id: number; onRemove: (id: number) => void
}) {
  const [color] = useState(() => hoverColors[Math.floor(Math.random() * hoverColors.length)])
  const [hovered, setHovered] = useState(false)
  const hoveredRef = useRef(false)

  useEffect(() => {
    const duration = 3500 + Math.random() * 1500
    const check = () => {
      if (!hoveredRef.current) onRemove(id)
      else setTimeout(check, 500)
    }
    const t = setTimeout(check, duration)
    return () => clearTimeout(t)
  }, [id, onRemove])

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: -8 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      onMouseEnter={() => { hoveredRef.current = true; setHovered(true) }}
      onMouseLeave={() => { hoveredRef.current = false; setHovered(false) }}
      className="absolute text-xs md:text-sm italic cursor-default select-none transition-colors duration-300"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        fontFamily: 'var(--font-display)',
        transform: 'translate(-50%, -50%)',
        color: hovered ? color : 'rgba(255,255,255,0.25)',
      }}
    >
      {word}
    </motion.span>
  )
}

function FloatingWords() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { margin: '-20px' })
  const [activeWords, setActiveWords] = useState<{ word: string; x: number; y: number; id: number }[]>([])
  const idRef = useRef(0)

  const positions = useMemo(() => [
    { x: 8, y: 20 }, { x: 72, y: 15 }, { x: 35, y: 55 },
    { x: 88, y: 60 }, { x: 15, y: 75 }, { x: 55, y: 25 },
    { x: 42, y: 80 }, { x: 78, y: 45 }, { x: 25, y: 40 },
    { x: 65, y: 70 },
  ], [])

  const removeWord = useCallback((id: number) => {
    setActiveWords(prev => prev.filter(w => w.id !== id))
  }, [])

  const spawnWord = useCallback(() => {
    setActiveWords(prev => {
      if (prev.length >= 5) return prev
      const usedPos = new Set(prev.map(w => `${w.x},${w.y}`))
      const usedWords = new Set(prev.map(w => w.word))
      const freePos = positions.filter(p => !usedPos.has(`${p.x},${p.y}`))
      const freeWords = romanticWords.filter(w => !usedWords.has(w))
      if (!freePos.length || !freeWords.length) return prev
      const pos = freePos[Math.floor(Math.random() * freePos.length)]
      const word = freeWords[Math.floor(Math.random() * freeWords.length)]
      return [...prev, { word, x: pos.x, y: pos.y, id: idRef.current++ }]
    })
  }, [positions])

  useEffect(() => {
    if (!isInView) {
      setActiveWords([])
      return
    }
    const delays = [0, 300, 700, 1200, 1800]
    const timeouts = delays.map(d => setTimeout(spawnWord, d))
    const interval = setInterval(spawnWord, 1200)
    return () => {
      timeouts.forEach(clearTimeout)
      clearInterval(interval)
    }
  }, [isInView, spawnWord])

  return (
    <div ref={ref} className="relative w-full max-w-4xl overflow-hidden" style={{ height: '120px' }}>
      <AnimatePresence>
        {activeWords.map((w) => (
          <FloatingWord key={w.id} {...w} onRemove={removeWord} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function TimelineNode({ item, i, visible, exiting }: { item: typeof timeline[0]; i: number; visible: boolean; exiting: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const appearOrder = nodeOrder.indexOf(i)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={exiting
        ? { opacity: 0, y: -20, scale: 0.9 }
        : visible
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 30, scale: 0.8 }
      }
      transition={{ duration: 0.6, ease: 'easeOut', delay: visible && !exiting ? appearOrder * 0.15 : 0 }}
      className="flex flex-col items-center text-center"
    >
      <motion.div
        animate={visible && !exiting ? { boxShadow: ['0 0 0 0 rgba(255,143,163,0)', '0 0 0 10px rgba(255,143,163,0.1)', '0 0 0 0 rgba(255,143,163,0)'] } : {}}
        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
        className="w-11 h-11 rounded-full bg-black border-2 border-pink-accent/40 flex items-center justify-center text-pink-accent mb-4"
      >
        {item.icon}
      </motion.div>
      <span className="text-[9px] tracking-[0.2em] uppercase text-pink-accent/70 font-medium">{item.date}</span>
      <h3 className="text-sm md:text-base font-bold text-white mt-1.5 mb-2" style={{ fontFamily: 'var(--font-display)' }}>{item.title}</h3>
      <p className="text-white/45 text-xs leading-relaxed hover:text-sky transition-colors duration-500 cursor-default">{item.desc}</p>
    </motion.div>
  )
}

function DashedTimeline({ visible, exiting }: { visible: boolean; exiting: boolean }) {
  return (
    <div className="absolute top-[22px] left-0 w-full h-[2px] z-0">
      <div
        className="absolute inset-0"
        style={{ borderTop: '2px dashed rgba(255,143,163,0.08)' }}
      />
      <motion.div
        className="absolute top-0 left-0 h-full overflow-hidden"
        initial={{ width: '0%' }}
        animate={{ width: exiting ? '0%' : visible ? '100%' : '0%' }}
        transition={{ duration: exiting ? 0.6 : 1.8, ease: 'easeInOut' }}
        style={{ originX: 0 }}
      >
        <div
          className="w-[calc(100vw)] h-full"
          style={{ borderTop: '2px dashed rgba(255,143,163,0.4)' }}
        />
      </motion.div>
    </div>
  )
}

function TimelineSection() {
  const timelineRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(timelineRef, { margin: '-50px 0px -50px 0px' })
  const [hasEntered, setHasEntered] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (isInView) {
      setHasEntered(true)
      setIsExiting(false)
    } else if (hasEntered) {
      setIsExiting(true)
      const t = setTimeout(() => setHasEntered(false), 800)
      return () => clearTimeout(t)
    }
  }, [isInView, hasEntered])

  return (
    <div ref={timelineRef} className="relative w-full max-w-4xl overflow-x-clip overflow-y-visible px-2">
      <DashedTimeline visible={hasEntered} exiting={isExiting} />
      <div className="relative z-10 grid grid-cols-4 gap-4">
        {timeline.map((item, i) => (
          <TimelineNode key={item.date} item={item} i={i} visible={hasEntered && !isExiting} exiting={isExiting} />
        ))}
      </div>
    </div>
  )
}

export default function AboutUs() {
  const [bgImage, setBgImage] = useState('')
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

  useEffect(() => {
    supabase.from('images').select('path').eq('description', 'About Background').single().then(({ data }) => { if (data) setBgImage(data.path) })
  }, [])

  const days = useDaysSince('2020-02-27')

  return (
    <section ref={sectionRef} id="about" className="relative py-24 overflow-hidden bg-black" style={{ scrollMarginTop: '80px' }}>
      {/* BG */}
      {bgImage && (
        <motion.div className="absolute inset-0 -top-[10%] -bottom-[10%]" style={{ y: bgY }}>
          <div className="absolute inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('${bgImage}')` }} />
          <div className="absolute inset-0 bg-black/92" />
        </motion.div>
      )}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/90 to-transparent z-[1]" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent z-[1]" />

      <div className="relative z-10 flex flex-col items-center w-full px-6">

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white uppercase tracking-tight text-center"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ABOUT{' '}
          <span style={{
            background: 'linear-gradient(90deg, #FF8FA3 0%, #FFB6C1 30%, #FFE4E8 50%, #B0E2FF 70%, #87CEEB 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>US</span>
        </motion.h2>

        {/* Intro */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-white/45 text-base md:text-lg text-center max-w-md mt-6 mb-14"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          We are one of the happy couples in the city of Los Santos (Nusa V)!
        </motion.p>

        {/* Stats */}
        <div className="w-full max-w-2xl grid grid-cols-4 gap-2">
          {[
            { v: days, s: '', l: 'Days Together' },
            { v: 4, s: '', l: 'Milestones' },
            { v: 1, s: '', l: 'Wedding' },
            { v: 100, s: '%', l: 'Love' },
          ].map((st, i) => (
            <motion.div key={st.l} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.1 }} className="text-center py-4">
              <div className="text-xl md:text-3xl font-bold text-pink-accent" style={{ fontFamily: 'var(--font-display)' }}>
                <Counter target={st.v} suffix={st.s} />
              </div>
              <p className="text-white/30 text-[8px] md:text-[10px] tracking-[0.15em] uppercase mt-1">{st.l}</p>
            </motion.div>
          ))}
        </div>

        {/* Floating romantic words */}
        <FloatingWords />

        {/* Timeline */}
        <TimelineSection />


        {/* End heart */}
        <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', delay: 0.2 }} className="mt-14">
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2.5, repeat: Infinity }} className="w-12 h-12 rounded-full bg-pink-accent/10 border border-pink-accent/30 flex items-center justify-center">
            <Heart size={16} className="text-pink-accent" fill="currentColor" />
          </motion.div>
        </motion.div>
        <p className="text-white/45 text-xs tracking-wider mt-3 hover:text-pink-accent transition-colors duration-500 cursor-default" style={{ fontFamily: 'var(--font-display)' }}>To be continued...</p>

        {/* Quote */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-12 max-w-lg">
          <div className="w-8 h-[1px] bg-white/10 mx-auto mb-6" />
          <p className="text-white/40 text-lg md:text-xl leading-relaxed italic hover:text-sky transition-colors duration-500 cursor-default" style={{ fontFamily: 'var(--font-display)' }}>
            "Please pray for us to continue together until our end"
          </p>
          <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mt-5 hover:text-pink-accent transition-colors duration-500 cursor-default" style={{ fontFamily: 'var(--font-display)' }}>Yupi & Nata</p>
        </motion.div>
      </div>
    </section>
  )
}
