import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { API } from '../config/api'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
}

interface EventData {
  id: number | string
  title: string
  subtitle?: string
  description?: string
  date: string
  time: string
  instructorName?: string
  instructorRole?: string
  instructorStats?: string
  isFeatured?: boolean
}

// ──────────────────────────────────────────
// Helper: Date & Time Formatting
// ──────────────────────────────────────────
const formatDateTime = (date: string, time: string) => {
  const d = new Date(`${date}T${time}`)
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  })
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
// Featured Event — Dynamic
// ──────────────────────────────────────────
function FeaturedEvent({ event }: { event: EventData }) {
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
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent" />

      <div className="p-5 md:p-10 grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-white/25 text-[10px] tracking-widest">[ FEATURED EVENT ]</span>
            <StatusTag type="FEATURED" />
            <StatusTag type="UPCOMING" />
          </div>

          <div>
            <h3 className="font-orbitron font-black text-2xl md:text-3xl text-[#F5F5F5] leading-snug tracking-wide uppercase">
              {event.title}
            </h3>
            {event.subtitle && <p className="font-inter text-white/50 text-base mt-1">{event.subtitle}</p>}
          </div>

          <p className="font-inter text-white/40 text-sm leading-relaxed">
            {event.description}
          </p>

          <div className="flex flex-wrap gap-4 pt-1">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-mono text-white/50 text-xs tracking-wider uppercase">{formatDateTime(event.date, event.time)}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0d0d0d] border border-white/5 p-5 space-y-2 self-start">
          <p className="font-mono text-white/25 text-[9px] tracking-widest uppercase mb-3">Instructor</p>
          <p className="font-orbitron font-semibold text-[#D4AF37] text-base leading-tight uppercase">{event.instructorName || "Kryptonex Core"}</p>
          <p className="font-inter text-white/50 text-sm">{event.instructorRole || "Lead Developer"}</p>
          {event.instructorStats && (
            <div className="pt-2 border-t border-white/5 mt-2">
              <p className="font-mono text-white/35 text-xs">{event.instructorStats}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ──────────────────────────────────────────
// Upcoming Events Subsection
// ──────────────────────────────────────────
function UpcomingSection({ events }: { events: EventData[] }) {
  if (events.length === 0) return null
  return (
    <div className="grid md:grid-cols-2 gap-6 pt-4">
      {events.map((event, i) => (
        <motion.div
           key={event.id}
           variants={fadeUp}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           custom={i}
           className="bg-[#0A0A0A] border border-white/5 p-6 hover:border-[#D4AF37]/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <StatusTag type="UPCOMING" />
            <span className="font-mono text-white/10 text-[10px] tracking-widest">REG: AUTH_REQ</span>
          </div>
          <h4 className="font-orbitron font-bold text-lg text-white mb-2 uppercase tracking-wide">{event.title}</h4>
          <p className="font-mono text-[#D4AF37]/60 text-[10px] tracking-widest mb-4 uppercase">{formatDateTime(event.date, event.time)}</p>
          <p className="font-inter text-white/40 text-sm line-clamp-2">{event.description}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// System Logs — Merged Seed + Dynamic
// ──────────────────────────────────────────
function SystemLogs({ events }: { events: EventData[] }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      custom={3}
      className="border border-white/8 bg-[#060606]"
    >
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

      <div className="p-6 md:p-8 space-y-5">
        {events.length === 0 ? (
          <div className="py-4 text-center">
             <span className="font-mono text-white/10 text-xs tracking-widest uppercase">[ No completed events indexed ]</span>
          </div>
        ) : (
          events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-4 font-mono group"
            >
              <div className="flex items-start gap-2">
                <span className="text-white/20 text-xs mt-0.5 shrink-0">&gt;</span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#F5F5F5]/70 text-sm group-hover:text-[#F5F5F5] transition-colors uppercase">
                      {event.title} — COMPLETED
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 pl-0">
                    <span className="text-white/15 text-xs">&gt;</span>
                    <span className="text-white/30 text-xs tracking-tight">
                      {event.subtitle || event.description || ""}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}

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
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)

  // Seed Data
  const initialLogs: EventData[] = [
    {
      id: "seed-1",
      title: "Blockchain Podcast",
      subtitle: "AI & Blockchain session with Vishnu Korde",
      date: "2024-01-10",
      time: "10:00"
    },
    {
      id: "seed-2",
      title: "Tech Rush",
      subtitle: "3 rounds: DSA • Debugging • Final Challenge",
      date: "2024-01-15",
      time: "14:00"
    },
    {
      id: "seed-3",
      title: "Ethical Hacking Workshop",
      subtitle: "Live hands-on cybersecurity session",
      date: "2024-01-20",
      time: "16:00"
    }
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API.MAIN}/events`)
        const json = await res.json()
        if (json.success) {
          setEvents(json.data)
        }
      } catch (err) {
        console.error("Failed to fetch events", err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const now = new Date()
  
  const featuredEvent = events.find(e => e.isFeatured)
  
  const upcomingEvents = events.filter(e => 
    new Date(`${e.date}T${e.time}`) >= now && e.id !== featuredEvent?.id
  )

  // Filter and Merge Past Events
  const dynamicPastEvents = events.filter(e => 
    new Date(`${e.date}T${e.time}`) < now
  )

  const allPastEvents = [
    ...initialLogs,
    ...dynamicPastEvents
  ]

  // Sort Newest -> Oldest
  const sortedPast = [...allPastEvents].sort((a, b) => 
    new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()
  )

  return (
    <section id="events" className="relative py-20 md:py-32 px-6 overflow-hidden scroll-mt-24">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto space-y-6">
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
          <h2 className="font-orbitron font-black text-4xl md:text-5xl text-[#F5F5F5] tracking-tight uppercase">
            Events
          </h2>
          <p className="font-inter text-white/35 text-sm tracking-wide">
            Real sessions. Real skills. Real impact.
          </p>
        </motion.div>

        {loading ? (
           <div className="py-20 text-center">
              <span className="font-mono text-[#D4AF37] text-[10px] tracking-widest animate-pulse">Initializing Data Stream...</span>
           </div>
        ) : (
          <div className="space-y-10">
            {featuredEvent ? (
               <FeaturedEvent event={featuredEvent} />
            ) : (
               <div className="py-12 border border-white/5 bg-[#080808] text-center">
                  <p className="font-mono text-white/20 text-xs tracking-widest uppercase uppercase">No featured event broadcasting</p>
               </div>
            )}

            <UpcomingSection events={upcomingEvents} />

            <SystemLogs events={sortedPast} />
          </div>
        )}
      </div>
    </section>
  )
}
