import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function TeamPromo() {
  return (
    <section id="team-cta" className="relative py-20 md:py-32 px-6 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#D4AF37]/3 blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center space-y-10">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="w-8 h-px bg-[#D4AF37]" />
          <span className="font-mono text-[#D4AF37] text-xs tracking-[0.3em] uppercase">
            System / Team
          </span>
          <div className="w-8 h-px bg-[#D4AF37]" />
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-orbitron font-black text-3xl sm:text-4xl md:text-6xl text-[#F5F5F5] tracking-tight"
        >
          The Team
        </motion.h2>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="h-px w-32 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto"
        />

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="font-inter text-white/55 text-lg md:text-xl leading-relaxed"
        >
          Behind every system is a team.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Link
            to="/team"
            className="group inline-flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 font-orbitron text-xs tracking-[0.25em] uppercase font-semibold border border-[#D4AF37] text-[#D4AF37] relative overflow-hidden transition-all duration-300 hover:text-[#050505]"
          >
            <span className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative">[ View Team Members </span>
            <span className="relative transition-transform duration-300 group-hover:translate-x-1">→ ]</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
