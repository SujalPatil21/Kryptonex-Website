import { motion, useAnimation } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] },
  }),
}

function Counter({ target, start }: { target: number; start: boolean }) {
  const [count, setCount] = useState(0)
  const hasRun = useRef(false)
  const controls = useAnimation()

  useEffect(() => {
    if (!start || hasRun.current) return
    hasRun.current = true

    const duration = 2800 // 2.8 seconds — slow, premium, intentional
    let startTime: number | null = null
    let rafId: number

    const tick = (now: number) => {
      if (startTime === null) startTime = now

      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic — feels natural, slows at end
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))

      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        // Subtle scale settle: 1 → 1.05 → 1 over 200ms
        controls.start({
          scale: [1, 1.05, 1],
          transition: { duration: 0.2, ease: 'easeOut' },
        })
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [start, target, controls])

  return <motion.span animate={controls}>{count}</motion.span>
}

export default function AboutSection() {
  const colRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = colRef.current
    if (!el) return

    // Small delay so the observer doesn't fire on initial scroll-position check
    // (prevents false trigger on page load / HMR reload when already scrolled)
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true)
            observer.disconnect()
          }
        },
        { threshold: 0.4 }
      )
      observer.observe(el)

      // Cleanup bound to the closure
      ;(el as any).__observer = observer
    }, 150)

    return () => {
      clearTimeout(timer)
      const obs = (el as any).__observer
      if (obs) obs.disconnect()
    }
  }, [])

  return (
    <section
      id="about"
      className="relative min-h-screen flex items-center py-20 md:py-32 px-6 overflow-hidden"
    >
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/30 to-transparent" />

      <div className="relative max-w-5xl mx-auto w-full">
        {/* Section tag */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          custom={0}
          className="flex items-center gap-3 mb-12"
        >
          <div className="w-8 h-px bg-[#D4AF37]" />
          <span className="font-mono text-[#D4AF37] text-xs tracking-[0.3em] uppercase">
            System / About
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          custom={1}
          className="font-orbitron font-black text-4xl md:text-6xl lg:text-7xl text-[#F5F5F5] leading-tight mb-16 tracking-tight"
        >
          What is{' '}
          <span className="text-gold-gradient bg-gradient-to-r from-[#D4AF37] to-[#f0d060] bg-clip-text text-transparent">
            Kryptonex
          </span>
        </motion.h2>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left — main paragraph */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={2}
            className="space-y-6"
          >
            <p className="font-inter text-white/70 text-lg md:text-xl leading-relaxed">
              Kryptonex is a <span className="text-[#F5F5F5] font-medium">student-driven technology lab.</span>
            </p>
            <p className="font-inter text-white/60 text-base md:text-lg leading-relaxed">
              We design, build, and deploy real systems —<br />
              from AI tools to scalable platforms.
            </p>
          </motion.div>

          {/* Right — execution statement + stats */}
          {/* ref here: observer watches this column (larger hit area, more reliable) */}
          <motion.div
            ref={colRef}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={3}
            className="space-y-4"
          >
            <div className="border-l-2 border-[#D4AF37] pl-6 space-y-4">
              <p className="font-orbitron text-xl md:text-2xl text-[#F5F5F5] font-semibold tracking-wide">
                This is not theory.
              </p>
              <p className="font-orbitron text-xl md:text-2xl text-[#D4AF37] font-bold tracking-wide">
                This is execution.
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mt-10 pt-10 border-t border-white/5">
              {[
                { target: 38, label: 'Active Members', gold: false },
                { target: 3, label: 'Events Completed', gold: false },
                { target: 1, label: 'Upcoming Session', gold: true },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p
                    className={`font-orbitron text-2xl font-bold ${
                      s.gold ? 'text-[#D4AF37]' : 'text-[#F5F5F5]'
                    }`}
                  >
                    <Counter target={s.target} start={inView} />
                  </p>
                  <p
                    className={`font-inter text-xs mt-1 tracking-widest uppercase ${
                      s.gold ? 'text-[#D4AF37]/60' : 'text-white/40'
                    }`}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
