import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

// ────────────────────────────────────────────────────────────
// Particle Canvas — particles gather to reveal logo, then drift
// ────────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const PARTICLE_COUNT = 280
    const PHASE_DRIFT = 0      // 0–2s: spawn & drift
    const PHASE_GATHER = 2.0   // 2–4.5s: gather to center
    const PHASE_FORM = 4.5     // 4.5–7s: orbiting logo
    const PHASE_DISPERSE = 7.0 // 7s+: gentle float

    let startTime: number | null = null

    interface Particle {
      x: number
      y: number
      tx: number      // target x
      ty: number      // target y
      ox: number      // origin x
      oy: number      // origin y
      vx: number
      vy: number
      size: number
      opacity: number
      color: string
      angle: number
      radius: number  // orbit radius
      speed: number   // orbit speed
      phase: number   // per-particle phase offset
    }

    // Spawn particles scattered across screen
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => {
      const x = Math.random() * width
      const y = Math.random() * height
      const angle = Math.random() * Math.PI * 2
      const radius = 60 + Math.random() * 120
      const colors = ['#D4AF37', '#F5F5F5', '#D4AF37', '#b8962e', '#ffffff']
      return {
        x,
        y,
        ox: x,
        oy: y,
        tx: width / 2 + (Math.random() - 0.5) * 60,
        ty: height / 2 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 0.8 + Math.random() * 1.8,
        opacity: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle,
        radius,
        speed: 0.003 + Math.random() * 0.005,
        phase: Math.random() * Math.PI * 2,
      }
    })

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

    const draw = (ts: number) => {
      if (!startTime) startTime = ts
      const t = (ts - startTime) / 1000 // seconds

      ctx.clearRect(0, 0, width, height)

      particles.forEach((p, i) => {
        const iOff = (i / PARTICLE_COUNT) * 1.5

        if (t < PHASE_GATHER) {
          // Phase 0: fade in and slow drift
          const fadeProgress = Math.min(1, (t - iOff * 0.01) / 2)
          p.opacity = Math.max(0, fadeProgress * (0.4 + 0.3 * Math.sin(ts * 0.001 + p.phase)))
          p.x += p.vx
          p.y += p.vy
        } else if (t < PHASE_FORM) {
          // Phase 1: gather to center
          const gt = (t - PHASE_GATHER) / (PHASE_FORM - PHASE_GATHER)
          const ease = easeInOut(Math.min(1, gt))
          p.opacity = lerp(p.opacity, 0.7 + 0.3 * Math.sin(ts * 0.002 + p.phase), 0.06)
          p.x = lerp(p.x, p.tx, ease * 0.04)
          p.y = lerp(p.y, p.ty, ease * 0.04)
        } else if (t < PHASE_DISPERSE) {
          // Phase 2: orbit the logo
          p.angle += p.speed
          const cx = width / 2
          const cy = height / 2
          const orbitR = p.radius * (0.6 + 0.4 * Math.sin(ts * 0.0005 + p.phase))
          const tx = cx + Math.cos(p.angle) * orbitR
          const ty = cy + Math.sin(p.angle) * orbitR
          p.x = lerp(p.x, tx, 0.04)
          p.y = lerp(p.y, ty, 0.04)
          p.opacity = 0.25 + 0.15 * Math.sin(ts * 0.002 + p.phase)
        } else {
          // Phase 3: slow disperse
          const dt = (t - PHASE_DISPERSE)
          p.x += p.vx * 0.5
          p.y += p.vy * 0.5
          p.opacity = Math.max(0, 0.25 - dt * 0.04)
        }

        // Draw glow + dot
        ctx.save()
        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity))
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
        grad.addColorStop(0, p.color)
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    const onResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}

// ────────────────────────────────────────────────────────────
// Hero Section
// ────────────────────────────────────────────────────────────
export default function HeroSection() {
  const [phase, setPhase] = useState<'particles' | 'logo' | 'text' | 'buttons'>('particles')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('logo'), 3800)
    const t2 = setTimeout(() => setPhase('text'), 5600)
    const t3 = setTimeout(() => setPhase('buttons'), 7000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505] scroll-mt-24"
    >
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-40" style={{ zIndex: 0 }} />

      {/* Particle canvas */}
      <ParticleCanvas />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, #050505 80%)',
          zIndex: 2,
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center text-center px-6 gap-6" style={{ zIndex: 3 }}>

        {/* Logo */}
        <AnimatePresence>
          {(phase === 'logo' || phase === 'text' || phase === 'buttons') && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="logo-glow"
            >
              <img
                src="/Logo.png"
                alt="Kryptonex"
                className="w-36 h-36 md:w-48 md:h-48 object-contain select-none"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(193,18,31,0.6)) drop-shadow(0 0 60px rgba(193,18,31,0.25))',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text block — cinematic shadow emergence */}
        <AnimatePresence>
          {(phase === 'text' || phase === 'buttons') && (
            <motion.div
              key="text"
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center gap-3"
            >
              {/* KRYPTONEX title — emerges first */}
              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 25, filter: 'blur(12px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
                }}
                transition={{ duration: 0.8, delay: 0, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="font-orbitron font-black text-3xl sm:text-5xl md:text-7xl lg:text-8xl tracking-[0.18em] text-[#F5F5F5] uppercase"
                style={{ textShadow: '0 0 40px rgba(212,175,55,0.2)' }}
              >
                KRYPTONEX
              </motion.h1>

              {/* Gold divider */}
              <motion.div
                variants={{
                  hidden: { scaleX: 0, opacity: 0 },
                  visible: { scaleX: 1, opacity: 1 },
                }}
                transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                className="h-px w-48 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent origin-center"
              />

              {/* Subtitle — 0.2s after title */}
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 25, filter: 'blur(12px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
                }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="font-orbitron text-sm md:text-base tracking-[0.35em] text-[#D4AF37] uppercase"
              >
                Tech &amp; Innovation Club
              </motion.p>

              {/* Tagline — 0.4s after title */}
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 25, filter: 'blur(12px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
                }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="font-inter text-white/50 text-sm md:text-base tracking-widest mt-1 font-light"
              >
                Build. Innovate. Lead.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <AnimatePresence>
          {phase === 'buttons' && (
            <motion.div
              key="buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="flex flex-col sm:flex-row items-center gap-4 mt-4"
            >
              <button
                onClick={() =>
                  document.getElementById('events')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="group relative w-full sm:w-auto px-8 py-3 font-orbitron text-xs tracking-[0.2em] uppercase font-semibold border border-[#D4AF37] text-[#D4AF37] overflow-hidden transition-all duration-300 hover:text-[#050505] bg-transparent cursor-pointer"
              >
                <span className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative">[ View Events ]</span>
              </button>
              <Link
                to="/team"
                className="group relative w-full sm:w-auto px-8 py-3 font-orbitron text-xs tracking-[0.2em] uppercase font-semibold border border-white/20 text-white/70 overflow-hidden transition-all duration-300 hover:text-[#050505] hover:border-white/50"
              >
                <span className="absolute inset-0 bg-white/90 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative">[ View Team ]</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanline indicator */}
        {phase === 'buttons' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-10 flex flex-col items-center gap-2"
          >
            <p className="font-mono text-[10px] text-white/25 tracking-widest uppercase"></p>
            <div className="w-px h-10 bg-gradient-to-b from-[#D4AF37]/50 to-transparent mx-auto animate-pulse" />
          </motion.div>
        )}
      </div>
    </section>
  )
}
