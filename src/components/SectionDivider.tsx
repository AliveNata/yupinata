import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface Props {
  icon?: string
  text?: string
}

export default function SectionDivider({ icon = '♥', text }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const lineScale = useTransform(scrollYProgress, [0.2, 0.5], [0, 1])
  const iconScale = useTransform(scrollYProgress, [0.3, 0.5], [0, 1])
  const opacity = useTransform(scrollYProgress, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0])

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className="relative py-16 overflow-hidden bg-dark"
    >
      {/* Background gelap senada */}
      <div className="absolute inset-0 bg-black/90" />

      <div className="relative z-10 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-6">
          <motion.div
            className="w-16 md:w-28 h-[1px] origin-left"
            style={{
              scaleX: lineScale,
              background: 'linear-gradient(to right, transparent, rgba(255,143,163,0.35))',
            }}
          />

          <motion.div style={{ scale: iconScale }} className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-4"
            >
              <div className="absolute top-0 left-1/2 w-1 h-1 rounded-full bg-pink-accent/40 -translate-x-1/2" />
              <div className="absolute bottom-0 left-1/2 w-1 h-1 rounded-full bg-sky/30 -translate-x-1/2" />
            </motion.div>

            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-xl block text-pink-accent/60"
            >
              {icon}
            </motion.span>
          </motion.div>

          <motion.div
            className="w-16 md:w-28 h-[1px] origin-right"
            style={{
              scaleX: lineScale,
              background: 'linear-gradient(to left, transparent, rgba(135,206,235,0.35))',
            }}
          />
        </div>

        {text && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] tracking-[0.4em] uppercase text-white/40"
          >
            {text}
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}
