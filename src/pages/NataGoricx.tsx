import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function NataGoricx() {
  const navigate = useNavigate()

  return (
    <motion.div
      className="relative w-full min-h-screen bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
        onClick={() => navigate('/')}
        className="sticky top-6 left-6 z-50 ml-6 mt-6 flex items-center rounded-full bg-black/60 backdrop-blur-xl border border-white/10 hover:border-pink-accent/30 transition-all duration-300 group cursor-pointer"
        style={{ padding: '8px 20px', gap: '12px' }}
      >
        <ArrowLeft size={14} className="text-white/50 group-hover:text-pink-accent transition-colors" />
        <span className="text-white/50 text-xs tracking-wider uppercase group-hover:text-white transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
          Back
        </span>
      </motion.button>

      <div className="w-full -mt-12">
        <img
          src="https://bmuglekfjylmubukthjc.supabase.co/storage/v1/object/public/images/nata-goricx.png"
          alt="Nata Profile"
          className="w-full h-auto"
        />
      </div>
    </motion.div>
  )
}
