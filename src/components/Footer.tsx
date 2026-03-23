import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-10 px-6">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 text-center md:text-left">
          <img src="/Logo.png" alt="Kryptonex" className="h-7 w-auto opacity-80" />
          <div>
            <p className="font-orbitron font-bold text-sm tracking-widest text-[#F5F5F5]">KRYPTONEX</p>
            <p className="font-inter text-xs text-white/40 tracking-wide">Tech & Innovation Club</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
          <span className="font-mono text-xs text-white/30 tracking-widest">SYSTEM ACTIVE</span>
        </div>

        <p className="font-inter text-xs text-white/30 text-center md:text-left">
          © 2026 Kryptonex. All rights reserved.
        </p>
      </motion.div>
    </footer>
  )
}
