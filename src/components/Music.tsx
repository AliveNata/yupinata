import { useEffect, useState, useRef } from 'react'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Music as MusicIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useMusicPlayer } from '../lib/MusicContext'

/* ── Scramble Text (same as WhoWeAre) ── */
function ScrambleText({ text, className = '' }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState('')
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { margin: '-80px' })
  const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  const hasScrambled = useRef(false)

  useEffect(() => {
    if (isInView && !hasScrambled.current) {
      hasScrambled.current = true
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
    } else if (!isInView) {
      hasScrambled.current = false
      setDisplayed('')
    }
  }, [isInView, text])

  return <span ref={ref} className={className}>{displayed || (isInView ? text : '')}</span>
}

interface Song {
  id: number
  title: string
  artist: string
  album: string
  audio_url: string
  cover_url: string
  lyrics: string | null
  display_order: number
}

function formatTime(s: number) {
  if (!s || isNaN(s)) return '0:00'
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`
}

/* ── Vinyl Record Animation ── */
function VinylDisc({ cover, isPlaying }: { cover: string; isPlaying: boolean }) {
  return (
    <div className="relative w-48 h-48 md:w-56 md:h-56 mx-auto">
      {/* Vinyl disc */}
      <motion.div
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={isPlaying ? { duration: 4, repeat: Infinity, ease: 'linear' } : { duration: 0.5 }}
        className="w-full h-full rounded-full relative"
        style={{
          background: 'conic-gradient(from 0deg, #1a1a1a 0%, #2a2a2a 25%, #1a1a1a 50%, #2a2a2a 75%, #1a1a1a 100%)',
          boxShadow: '0 0 40px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.3)',
        }}
      >
        {/* Grooves */}
        {[30, 38, 46, 54, 62, 70, 78].map((size) => (
          <div
            key={size}
            className="absolute rounded-full border border-white/[0.03]"
            style={{
              width: `${size}%`,
              height: `${size}%`,
              top: `${(100 - size) / 2}%`,
              left: `${(100 - size) / 2}%`,
            }}
          />
        ))}

        {/* Center label with cover art */}
        <div
          className="absolute rounded-full overflow-hidden"
          style={{
            width: '38%',
            height: '38%',
            top: '31%',
            left: '31%',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
          }}
        >
          <img
            src={cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'}
            alt="Album cover"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop' }}
          />
        </div>

        {/* Center hole */}
        <div
          className="absolute rounded-full bg-black"
          style={{ width: '6%', height: '6%', top: '47%', left: '47%' }}
        />
      </motion.div>

      {/* Glow when playing */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: '0 0 60px rgba(255,143,163,0.15), 0 0 120px rgba(135,206,235,0.1)',
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Equalizer Bars ── */
function EqualizerBars({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{
            background: i % 2 === 0
              ? 'linear-gradient(to top, rgba(255,143,163,0.6), rgba(255,143,163,0.2))'
              : 'linear-gradient(to top, rgba(135,206,235,0.6), rgba(135,206,235,0.2))',
          }}
          animate={isPlaying ? {
            height: [4, 12 + Math.random() * 8, 6, 16 + Math.random() * 4, 4],
          } : { height: 4 }}
          transition={isPlaying ? {
            duration: 0.8 + Math.random() * 0.4,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          } : { duration: 0.3 }}
        />
      ))}
    </div>
  )
}

/* ── Song List Item ── */
function SongItem({ song, index, isActive, onClick }: {
  song: Song; index: number; isActive: boolean; onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-left group ${
        isActive
          ? 'bg-white/10 border border-pink-accent/20'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      <span className={`text-xs w-5 text-center ${isActive ? 'text-pink-accent' : 'text-white/20'}`}>
        {isActive ? '♪' : index + 1}
      </span>
      <img
        src={song.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'}
        alt={song.album}
        className="w-9 h-9 rounded object-cover"
        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop' }}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${isActive ? 'text-pink-accent' : 'text-white/70 group-hover:text-white/90'} transition-colors`}>
          {song.title}
        </p>
        <p className="text-[10px] text-white/30 truncate">{song.artist}</p>
      </div>
    </motion.button>
  )
}

/* ── Main Music Component ── */
export default function Music() {
  const {
    songs, currentIndex, currentSong, isPlaying, currentTime, duration,
    volume, isMuted, isRepeat, isShuffle,
    setCurrentIndex, setIsPlaying, setVolume, setIsMuted, setIsRepeat, setIsShuffle,
    handleNext, handlePrev, handleSeek,
  } = useMusicPlayer()

  const [bgImage, setBgImage] = useState('')
  const sectionRef = useRef<HTMLDivElement>(null)
  useInView(sectionRef, { margin: '-10% 0px' })

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

  useEffect(() => {
    supabase
      .from('images')
      .select('path')
      .eq('description', 'About Background')
      .single()
      .then(({ data }) => { if (data) setBgImage(data.path) })
  }, [])

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => handleSeek(parseFloat(e.target.value))

  const progressPercent = duration ? (currentTime / duration) * 100 : 0

  return (
    <section ref={sectionRef} id="music" className="relative py-24 overflow-hidden bg-black" style={{ scrollMarginTop: '80px' }}>
      {/* Background — same as About Us */}
      {bgImage && (
        <motion.div className="absolute inset-0 -top-[10%] -bottom-[10%]" style={{ y: bgY }}>
          <div className="absolute inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('${bgImage}')` }} />
          <div className="absolute inset-0 bg-black/92" />
        </motion.div>
      )}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/90 to-transparent z-[1]" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent z-[1]" />
      {/* Ambient glow */}
      <motion.div
        animate={isPlaying ? { opacity: [0.03, 0.08, 0.03] } : { opacity: 0.02 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full z-[2] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,143,163,0.15) 0%, rgba(135,206,235,0.1) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Title */}
        <div className="text-center" style={{ marginBottom: '80px' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, margin: '-80px' }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="inline-block mb-4"
          >
            <span className="text-xs tracking-[0.3em] uppercase text-pink-accent/60 border border-pink-accent/20 px-4 py-2 rounded-full">
              Last but not least, so listen together
              <MusicIcon size={12} className="inline ml-2 -mt-0.5" />
            </span>
          </motion.div>

          <h2
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mt-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <ScrambleText text="OUR " />{' '}
            <span className="text-pink-accent italic">
              <ScrambleText text="SONG" />
            </span>
          </h2>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false, margin: '-80px' }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="w-32 h-[1px] bg-gradient-to-r from-pink-accent via-white/20 to-sky mx-auto mt-8"
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-80px' }}
            transition={{ delay: 0.6 }}
            className="text-white/50 text-sm tracking-[0.3em] uppercase mt-10"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            The soundtrack of our love
          </motion.p>
        </div>

        {songs.length > 0 && currentSong ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-start">
            {/* Left — Player */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              {/* Vinyl */}
              <VinylDisc cover={currentSong.cover_url} isPlaying={isPlaying} />

              {/* Song info */}
              <div className="text-center mt-8 mb-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSong.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3
                      className="text-xl md:text-2xl font-bold text-white"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {currentSong.title}
                    </h3>
                    <p className="text-white/40 text-sm mt-1">
                      {currentSong.artist} <span className="text-white/20 mx-1">·</span> <span className="italic text-white/25">{currentSong.album}</span>
                    </p>
                    <div className="flex items-center justify-center mt-2">
                      <EqualizerBars isPlaying={isPlaying} />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-sm">
                <div className="relative h-1 bg-white/10 rounded-full overflow-hidden group cursor-pointer">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all"
                    style={{
                      width: `${progressPercent}%`,
                      background: 'linear-gradient(to right, #FF8FA3, #87CEEB)',
                    }}
                  />
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={onSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-white/25">{formatTime(currentTime)}</span>
                  <span className="text-[10px] text-white/25">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-5 mt-5">
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`transition-colors ${isShuffle ? 'text-pink-accent' : 'text-white/25 hover:text-white/50'}`}
                >
                  <Shuffle size={14} />
                </button>
                <button onClick={handlePrev} className="text-white/50 hover:text-white transition-colors">
                  <SkipBack size={18} fill="currentColor" />
                </button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,143,163,0.3), rgba(135,206,235,0.3))',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {isPlaying ? (
                    <Pause size={18} className="text-white" />
                  ) : (
                    <Play size={18} className="text-white ml-0.5" fill="currentColor" />
                  )}
                </motion.button>
                <button onClick={handleNext} className="text-white/50 hover:text-white transition-colors">
                  <SkipForward size={18} fill="currentColor" />
                </button>
                <button
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={`transition-colors ${isRepeat ? 'text-sky' : 'text-white/25 hover:text-white/50'}`}
                >
                  <Repeat size={14} />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                >
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <div className="relative w-20 h-1 bg-white/10 rounded-full">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full bg-white/20"
                    style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false) }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Audio managed by MusicContext — persists across pages */}
            </motion.div>

            {/* Center — Playlist */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-1 max-h-[420px] overflow-y-auto pr-2"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,143,163,0.3) transparent',
              }}
            >
              <p className="text-white/45 text-[10px] tracking-[0.3em] uppercase mb-3 px-4 cursor-default hover:text-pink-accent transition-colors duration-300" style={{ fontFamily: 'var(--font-display)' }}>
                Playlist · {songs.length} songs
              </p>
              {songs.map((song, i) => (
                <SongItem
                  key={song.id}
                  song={song}
                  index={i}
                  isActive={i === currentIndex}
                  onClick={() => {
                    setCurrentIndex(i)
                    setIsPlaying(true)
                  }}
                />
              ))}
            </motion.div>

            {/* Right — Lyrics */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col"
            >
              <p className="text-white/45 text-[10px] tracking-[0.3em] uppercase mb-3 cursor-default hover:text-sky transition-colors duration-300" style={{ fontFamily: 'var(--font-display)' }}>
                Lyrics
              </p>
              {currentSong.lyrics ? (
                <div
                  className="p-4 rounded-lg bg-black/40 border border-white/5 max-h-[380px] overflow-y-auto"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255,143,163,0.2) transparent',
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentSong.title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-white/35 text-sm leading-relaxed whitespace-pre-wrap italic"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {currentSong.lyrics}
                    </motion.p>
                  </AnimatePresence>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center h-40">
                  <p className="text-white/15 text-sm italic" style={{ fontFamily: 'var(--font-display)' }}>
                    No lyrics available
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-white/20 py-20"
          >
            <MusicIcon size={40} className="mx-auto mb-4 text-white/10" />
            <p style={{ fontFamily: 'var(--font-display)' }}>Loading songs...</p>
          </motion.div>
        )}
      </div>
    </section>
  )
}
