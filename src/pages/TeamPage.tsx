import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
}

interface MemberCardProps {
  name: string
  role: string
  index: number
}

function MemberCard({ name, role, index }: MemberCardProps) {
  // Generate deterministic initials for avatar
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      custom={index * 0.5}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="group border border-white/8 bg-[#080808] p-5 space-y-4 hover:border-[#D4AF37]/30 transition-all duration-300 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/0 to-transparent group-hover:via-[#D4AF37]/40 transition-all duration-500" />

      {/* Avatar */}
      <div className="relative w-14 h-14 mx-auto">
        <div className="w-14 h-14 border border-[#D4AF37]/30 bg-[#0d0d0d] flex items-center justify-center group-hover:border-[#D4AF37]/60 transition-colors duration-300">
          <span className="font-orbitron text-base font-bold text-[#D4AF37]">{initials}</span>
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b border-r border-[#D4AF37]/60" />
      </div>

      {/* Info */}
      <div className="text-center space-y-1">
        <p className="font-inter font-semibold text-sm text-[#F5F5F5] leading-tight">{name}</p>
        <p className="font-mono text-[10px] text-white/40 tracking-widest uppercase">{role}</p>
      </div>
    </motion.div>
  )
}

interface TeamSectionProps {
  label: string
  title: string
  members: { name: string; role: string }[]
  index: number
}

function TeamSection({ label, title, members, index }: TeamSectionProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      custom={index}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-6 h-px bg-[#D4AF37]" />
        <span className="font-mono text-[#D4AF37] text-[10px] tracking-[0.3em] uppercase">{label}</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>
      <h3 className="font-orbitron font-bold text-xl text-[#F5F5F5] tracking-wide -mt-4">{title}</h3>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {members.map((m, i) => (
          <MemberCard key={m.name + i} name={m.name} role={m.role} index={i} />
        ))}
      </div>
    </motion.div>
  )
}

const teams = [
  {
    label: '01 / Leadership',
    title: 'Leadership',
    members: [
      { name: 'Kryptonex President', role: 'President' },
      { name: 'Kryptonex Vice President', role: 'Vice President' },
    ],
  },
  {
    label: '02 / Core',
    title: 'Technical Team',
    members: [
      { name: 'Tech Member 01', role: 'Technical Lead' },
      { name: 'Tech Member 02', role: 'Full Stack Dev' },
      { name: 'Tech Member 03', role: 'AI Engineer' },
      { name: 'Tech Member 04', role: 'Security Analyst' },
    ],
  },
  {
    label: '03 / Operations',
    title: 'Events Team',
    members: [
      { name: 'Events Head', role: 'Events Lead' },
      { name: 'Events Member 01', role: 'Coordinator' },
      { name: 'Events Member 02', role: 'Coordinator' },
      { name: 'Events Member 03', role: 'Logistics' },
    ],
  },
  {
    label: '04 / Documentation',
    title: 'Documentation Team',
    members: [
      { name: 'Docs Lead', role: 'Documentation Head' },
      { name: 'Docs Member 01', role: 'Technical Writer' },
      { name: 'Docs Member 02', role: 'Content Lead' },
    ],
  },
  {
    label: '05 / Growth',
    title: 'Sponsorship Team',
    members: [
      { name: 'Sponsorship Lead', role: 'Sponsorship Head' },
      { name: 'Sponsor Member 01', role: 'Outreach' },
      { name: 'Sponsor Member 02', role: 'Partnerships' },
    ],
  },
]

export default function TeamPage() {
  return (
    <main className="min-h-screen pt-24 pb-20 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/20 to-transparent" />

      <div className="relative max-w-6xl mx-auto space-y-12 md:space-y-20">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="pt-10 space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-[#D4AF37]" />
            <span className="font-mono text-[#D4AF37] text-xs tracking-[0.3em] uppercase">
              System / Personnel
            </span>
          </div>
          <h1 className="font-orbitron font-black text-3xl sm:text-5xl md:text-7xl text-[#F5F5F5] tracking-tight">
            The Team
          </h1>
          <p className="font-inter text-white/40 text-base max-w-xl">
            The humans behind the systems. Every member a specialist. Every role a function.
          </p>
          {/* Divider */}
          <div className="h-px w-full bg-white/5 mt-8" />
        </motion.div>

        {/* Team Sections */}
        {teams.map((team, i) => (
          <TeamSection
            key={team.title}
            label={team.label}
            title={team.title}
            members={team.members}
            index={i}
          />
        ))}
      </div>
    </main>
  )
}
