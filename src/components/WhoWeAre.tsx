import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { supabase } from '../lib/supabase'

interface ProfileData {
  name: string
  birth: string
  profession: string
  badside: string
  image: string
}

// 3D tilt card component
function TiltCard({
  children,
  className = '',
  glowColor = 'rgba(255,143,163,0.15)',
}: {
  children: React.ReactNode
  className?: string
  glowColor?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 })

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative ${className}`}
    >
      {/* Dynamic glow that follows cursor */}
      <motion.div
        className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
        style={{
          background: `radial-gradient(circle at ${50}% ${50}%, ${glowColor}, transparent 70%)`,
        }}
      />
      {children}
    </motion.div>
  )
}

// Scramble text effect — re-scrambles on scroll back in
function ScrambleText({ text, className = '' }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState('')
  const ref = useRef<HTMLSpanElement>(null)
  const [isInView, setIsInView] = useState(false)
  const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isInView) {
      let iteration = 0
      const interval = setInterval(() => {
        setDisplayed(
          text.split('').map((char, i) => {
            if (char === ' ') return ' '
            if (i < iteration) return text[i]
            return chars[Math.floor(Math.random() * chars.length)]
          }).join('')
        )
        iteration += 0.5
        if (iteration >= text.length) clearInterval(interval)
      }, 40)
      return () => clearInterval(interval)
    } else {
      setDisplayed('')
    }
  }, [isInView, text])

  return <span ref={ref} className={className}>{displayed || (isInView ? text : '')}</span>
}

// Magnetic element
function Magnetic({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useSpring(0, { stiffness: 300, damping: 20 })
  const y = useSpring(0, { stiffness: 300, damping: 20 })

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * 0.3)
    y.set((e.clientY - centerY) * 0.3)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      style={{ x, y }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function WhoWeAre() {
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [bgImage, setBgImage] = useState('')
  const [activeCard, setActiveCard] = useState<number | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const bgY = useTransform(scrollYProgress, [0, 1], ['-15%', '15%'])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  useEffect(() => {
    async function fetchData() {
      const { data: section } = await supabase
        .from('sections')
        .select('*')
        .eq('name', 'who-we-are')
        .single()

      const { data: images } = await supabase
        .from('images')
        .select('*')
        .eq('section', 'profile')

      const { data: bgData } = await supabase
        .from('images')
        .select('path')
        .eq('section', 'background')
        .eq('description', 'Who We Are Background')
        .single()

      if (bgData) setBgImage(bgData.path)

      const yupiImg = images?.find((i: any) => i.description === 'Yupi Profile')?.path || ''
      const nataImg = images?.find((i: any) => i.description === 'Nata Profile')?.path || ''
      const p = section?.profiles || {}

      setProfiles([
        {
          name: 'YUPI COKLAT',
          birth: p.yupi?.birth || '2002-12-27',
          profession: p.yupi?.profession || 'Gangster',
          badside: p.yupi?.badside || '69 Hoover',
          image: yupiImg,
        },
        {
          name: 'NATA GORICX',
          birth: p.nata?.birth || '2002-02-22',
          profession: p.nata?.profession || 'Mafia',
          badside: p.nata?.badside || 'Black Dragon',
          image: nataImg,
        },
      ])
    }
    fetchData()
  }, [])

  return (
    <section ref={sectionRef} id="who-we-are" className="relative min-h-screen py-32 overflow-hidden">
      {/* Parallax background */}
      {bgImage && (
        <motion.div
          className="absolute inset-0 -top-[15%] -bottom-[15%]"
          style={{ y: bgY }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${bgImage}')` }}
          />
          <div className="absolute inset-0 bg-black/80" />
        </motion.div>
      )}

      {/* Animated grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,143,163,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,143,163,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div style={{ opacity }} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="inline-block mb-4"
          >
            <span className="text-xs tracking-[0.4em] uppercase text-pink-accent/60 border border-pink-accent/20 px-4 py-2 rounded-full">
              Meet The Couple
            </span>
          </motion.div>

          <h2
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mt-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <ScrambleText text="WHO WE" className="block" />
            <span className="text-pink-accent italic">
              <ScrambleText text="ARE?" />
            </span>
          </h2>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="w-32 h-[1px] bg-gradient-to-r from-pink-accent via-white/20 to-sky mx-auto mt-8"
          />
        </div>

        {/* Profile cards */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {profiles.map((profile, index) => (
            <motion.div
              key={profile.name}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1, delay: index * 0.3, type: 'spring', stiffness: 60 }}
              className="group flex flex-col items-center text-center"
              onMouseEnter={() => setActiveCard(index)}
              onMouseLeave={() => setActiveCard(null)}
            >
              <TiltCard
                glowColor={index === 0 ? 'rgba(255,143,163,0.2)' : 'rgba(135,206,235,0.2)'}
                className="flex flex-col items-center"
              >
                {/* Circular avatar with ring */}
                <Magnetic>
                  <div className="relative mb-8">
                    {/* Animated ring */}
                    <motion.div
                      className={`absolute -inset-3 rounded-full border-2 ${
                        index === 0 ? 'border-pink-accent/30' : 'border-sky/30'
                      }`}
                      animate={{
                        rotate: 360,
                        scale: activeCard === index ? 1.05 : 1,
                      }}
                      transition={{
                        rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                        scale: { duration: 0.5 },
                      }}
                      style={{
                        borderStyle: 'dashed',
                      }}
                    />
                    {/* Glow behind avatar */}
                    <motion.div
                      className={`absolute -inset-6 rounded-full blur-2xl ${
                        index === 0 ? 'bg-pink-accent' : 'bg-sky'
                      }`}
                      animate={{
                        opacity: activeCard === index ? 0.15 : 0.05,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                    {/* Avatar image — small & circular */}
                    <motion.div
                      className={`relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-2 ${
                        index === 0 ? 'border-pink-accent/40' : 'border-sky/40'
                      }`}
                      animate={{
                        scale: activeCard === index ? 1.05 : 1,
                      }}
                      transition={{ duration: 0.5, type: 'spring' }}
                    >
                      <img
                        src={profile.image}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    {/* Empty - badge removed */}
                  </div>
                </Magnetic>

                {/* Name */}
                <motion.h3
                  className="text-3xl md:text-4xl font-bold text-white mb-6"
                  style={{ fontFamily: 'var(--font-display)' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + index * 0.3, type: 'spring' }}
                >
                  {profile.name}
                </motion.h3>

                {/* Stats card */}
                <div className={`w-full max-w-sm rounded-2xl bg-dark-surface/60 backdrop-blur-sm border p-6 transition-all duration-700 ${
                  activeCard === index
                    ? index === 0
                      ? 'border-pink-accent/30 shadow-[0_0_40px_rgba(255,143,163,0.08)]'
                      : 'border-sky/30 shadow-[0_0_40px_rgba(135,206,235,0.08)]'
                    : 'border-white/[0.06]'
                }`}>
                  {[
                    {
                      label: 'BORN',
                      value: new Date(profile.birth).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric',
                      }),
                    },
                    { label: 'PROFESSION', value: profile.profession },
                    { label: 'AFFILIATION', value: profile.badside },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.9 + i * 0.15 + index * 0.3, type: 'spring', stiffness: 80 }}
                      className="group/item flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0 hover:border-white/10 transition-colors cursor-default"
                    >
                      <span className="text-[10px] tracking-[0.25em] uppercase text-white/30 group-hover/item:text-white/50 transition-colors">
                        {item.label}
                      </span>
                      <motion.span
                        className={`text-sm font-medium ${
                          index === 0 ? 'text-pink-accent' : 'text-sky'
                        }`}
                        whileHover={{ x: 4 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        {item.value}
                      </motion.span>
                    </motion.div>
                  ))}
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Connecting line between cards */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 1 }}
          className="hidden md:block w-px h-0 mx-auto mt-16"
        >
          <div className="flex items-center justify-center gap-4">
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent to-pink-accent/40" />
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-pink-accent text-xl"
            >
              ♥
            </motion.span>
            <div className="w-20 h-[1px] bg-gradient-to-l from-transparent to-sky/40" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
