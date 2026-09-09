import { createContext, useContext, useEffect, useState, useRef, useCallback, type ReactNode } from 'react'
import { supabase } from './supabase'

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

interface MusicContextType {
  songs: Song[]
  currentIndex: number
  currentSong: Song | null
  isPlaying: boolean
  isReady: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isRepeat: boolean
  isShuffle: boolean
  setCurrentIndex: (i: number) => void
  setIsPlaying: (v: boolean) => void
  setVolume: (v: number) => void
  setIsMuted: (v: boolean) => void
  setIsRepeat: (v: boolean) => void
  setIsShuffle: (v: boolean) => void
  handleNext: () => void
  handlePrev: () => void
  handleSeek: (time: number) => void
}

const MusicContext = createContext<MusicContextType | null>(null)

export function useMusicPlayer() {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusicPlayer must be used within MusicProvider')
  return ctx
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentSong = songs[currentIndex] || null

  // Init audio element once
  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.volume = 0.7
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  // Fetch songs
  useEffect(() => {
    supabase
      .from('songs')
      .select('*')
      .order('display_order', { ascending: true })
      .then(({ data }) => { if (data) setSongs(data) })
  }, [])

  // Load song when index changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong?.audio_url) return

    setIsReady(false)

    const onLoaded = () => {
      setDuration(audio.duration)
      setIsReady(true)
    }
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0
        audio.play().catch(() => setIsPlaying(false))
      } else {
        handleNextInternal()
      }
    }
    const onError = () => setIsPlaying(false)

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    audio.src = currentSong.audio_url
    audio.load()

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [currentSong?.audio_url])

  // Play/pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !isReady) return
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [isPlaying, isReady])

  // Volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  const handleNextInternal = useCallback(() => {
    setSongs(prev => {
      if (isShuffle) {
        setCurrentIndex(Math.floor(Math.random() * prev.length))
      } else {
        setCurrentIndex(i => (i >= prev.length - 1 ? 0 : i + 1))
      }
      return prev
    })
  }, [isShuffle])

  const handleNext = useCallback(() => {
    if (isShuffle) {
      setCurrentIndex(Math.floor(Math.random() * songs.length))
    } else {
      setCurrentIndex(i => (i >= songs.length - 1 ? 0 : i + 1))
    }
  }, [isShuffle, songs.length])

  const handlePrev = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0
    } else {
      setCurrentIndex(i => (i <= 0 ? songs.length - 1 : i - 1))
    }
  }, [songs.length])

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time)
    if (audioRef.current) audioRef.current.currentTime = time
  }, [])

  return (
    <MusicContext.Provider value={{
      songs, currentIndex, currentSong, isPlaying, isReady,
      currentTime, duration, volume, isMuted, isRepeat, isShuffle,
      setCurrentIndex, setIsPlaying, setVolume, setIsMuted, setIsRepeat, setIsShuffle,
      handleNext, handlePrev, handleSeek,
    }}>
      {children}
    </MusicContext.Provider>
  )
}
