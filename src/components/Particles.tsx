import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  type: 'heart' | 'sparkle' | 'dot'
}

export default function Particles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const items: Particle[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 8 + 4,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 15,
      type: ['heart', 'sparkle', 'dot'][Math.floor(Math.random() * 3)] as Particle['type'],
    }))
    setParticles(items)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            bottom: '-20px',
            animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
          }}
        >
          {p.type === 'heart' ? (
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="rgba(255,143,163,0.5)">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          ) : p.type === 'sparkle' ? (
            <div
              className="rounded-full bg-sky/40"
              style={{ width: p.size * 0.6, height: p.size * 0.6 }}
            />
          ) : (
            <div
              className="rounded-full bg-pink-accent/30"
              style={{ width: p.size * 0.4, height: p.size * 0.4 }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
