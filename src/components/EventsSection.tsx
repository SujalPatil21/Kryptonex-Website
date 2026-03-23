import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
}

// ──────────────────────────────────────────
// Status Tag
// ──────────────────────────────────────────
function StatusTag({ type }: { type: 'UPCOMING' | 'COMPLETED' | 'FEATURED' }) {
  const styles = {
    UPCOMING: 'border-[#D4AF37]/50 text-[#D4AF37] bg-[#D4AF37]/5',
    COMPLETED: 'border-white/15 text-white/40 bg-white/3',
    FEATURED: 'border-[#D4AF37]/70 text-[#D4AF37] bg-[#D4AF37]/10',
  }
  return (
    <span className={`font-mono text-[10px] tracking-widest px-2 py-1 border ${styles[type]}`}>
      [ {type} ]
    </span>
  )
}

// ──────────────────────────────────────────
// Featured Event — GitSetGo (full width)
// ──────────────────────────────────────────
function FeaturedEvent() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      custom={1}
      className="relative border border-[#D4AF37]/25 bg-[#080808] overflow-hidden group hover:border-[#D4AF37]/55 transition-all duration-400"
      style={{ boxShadow: '0 0 30px rgba(212,175,55,0.04)' }}
    >
      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent" />

      <div className="p-5 md:p-10 grid md:grid-cols-3 gap-8 items-start">
        {/* Left — title block */}
        <div className="md:col-span-2 space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-white/25 text-[10px] tracking-widest">[ FEATURED EVENT ]</span>
            <StatusTag type="FEATURED" />
            <StatusTag type="UPCOMING" />
          </div>

          <div>
            <h3 className="font-orbitron font-black text-2xl md:text-3xl text-[#F5F5F5] leading-snug tracking-wide">
              GitSetGo
            </h3>
            <p className="font-inter text-white/50 text-base mt-1">Master Git &amp; GitHub</p>
          </div>

          <p className="font-inter text-white/40 text-sm leading-relaxed">
            A comprehensive session on version control, collaboration workflows, and mastering
            Git & GitHub for real-world development.
          </p>

          {/* Date / Time row */}
          <div className="flex flex-wrap gap-4 pt-1">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-mono text-white/50 text-xs tracking-wider">25 March 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono text-white/50 text-xs tracking-wider">2:00 PM – 4:00 PM</span>
            </div>
          </div>
        </div>

        {/* Right — instructor */}
        <div className="bg-[#0d0d0d] border border-white/5 p-5 space-y-2 self-start">
          <p className="font-mono text-white/25 text-[9px] tracking-widest uppercase mb-3">Instructor</p>
          <p className="font-orbitron font-semibold text-[#D4AF37] text-base leading-tight">Tejas Nalawade</p>
          <p className="font-inter text-white/50 text-sm">Codeforces Specialist</p>
          <div className="pt-2 border-t border-white/5 mt-2">
            <p className="font-mono text-white/35 text-xs">2750+ Problems Solved</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}



// ──────────────────────────────────────────
// System Logs — all completed events
// ──────────────────────────────────────────
function SystemLogs() {
  const logs = [
    {
      name: 'BLOCKCHAIN PODCAST',
      detail: 'AI & Blockchain session with Vishnu Korde',
    },
    {
      name: 'TECH RUSH',
      detail: '3 rounds: DSA • Debugging • Final Challenge',
    },
    {
      name: 'ETHICAL HACKING WORKSHOP',
      detail: 'Live hands-on cybersecurity session',
    },
  ]

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      custom={3}
      className="border border-white/8 bg-[#060606]"
    >
      {/* Terminal header bar */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#C1121F]/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
        </div>
        <span className="font-mono text-white/25 text-xs tracking-widest ml-2">[ SYSTEM LOGS ] — PAST EVENTS</span>
        <div className="ml-auto">
          <StatusTag type="COMPLETED" />
        </div>
      </div>

      {/* Log entries */}
      <div className="p-6 md:p-8 space-y-5">
        {logs.map((log, i) => (
          <motion.div
            key={log.name}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.18, duration: 0.5 }}
            viewport={{ once: true }}
            className="group"
          >
            <div className="flex items-start gap-2">
              <span className="font-mono text-white/20 text-xs mt-0.5 shrink-0">&gt;</span>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[#F5F5F5]/70 text-sm font-medium group-hover:text-[#F5F5F5] transition-colors">
                    {log.name}
                  </span>
                  <span className="font-mono text-[10px] text-white/25 tracking-widest">— COMPLETED</span>
                </div>
                <div className="flex items-center gap-1.5 pl-0">
                  <span className="font-mono text-white/15 text-xs">&gt;</span>
                  <span className="font-mono text-white/30 text-xs">{log.detail}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Blinking cursor */}
        <div className="flex items-center gap-2 pt-1">
          <span className="font-mono text-white/15 text-xs">&gt;</span>
          <span className="font-mono text-[#D4AF37]/35 text-xs cursor-blink">_</span>
        </div>
      </div>
    </motion.div>
  )
}

// ──────────────────────────────────────────
// Main Events Section
// ──────────────────────────────────────────
export default function EventsSection() {
  return (
    <section id="events" className="relative py-20 md:py-32 px-6 overflow-hidden scroll-mt-24">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative max-w-6xl mx-auto space-y-6">
        {/* Section header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          custom={0}
          className="mb-10 space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-[#D4AF37]" />
            <span className="font-mono text-[#D4AF37] text-xs tracking-[0.3em] uppercase">
              System / Events
            </span>
          </div>
          <h2 className="font-orbitron font-black text-4xl md:text-5xl text-[#F5F5F5] tracking-tight">
            Events
          </h2>
          <p className="font-inter text-white/35 text-sm tracking-wide">
            Real sessions. Real skills. Real impact.
          </p>
        </motion.div>

        {/* 1 — Featured */}
        <FeaturedEvent />

        {/* 2 — System Logs (completed) */}
        <SystemLogs />
      </div>
    </section>
  )
}
