import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Background blur on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // IntersectionObserver scroll spy (only on home page)
  useEffect(() => {
    if (location.pathname !== '/') return

    const sectionIds = ['home', 'events']
    const observers: IntersectionObserver[] = []

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id)
        },
        { threshold: 0.35 }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [location.pathname])

  // Reset active section when leaving home page
  useEffect(() => {
    if (location.pathname !== '/') setActiveSection('')
  }, [location.pathname])

  const handleNavClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault()
    setMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const isActive = (key: string) => {
    if (location.pathname === '/team') return key === 'team'
    return activeSection === key
  }

  const linkClass = (key: string) =>
    `font-inter text-sm font-medium tracking-wider uppercase transition-all duration-300 relative group ${
      isActive(key) ? 'text-[#D4AF37]' : 'text-white/70 hover:text-[#F5F5F5]'
    }`

  const underlineClass = (key: string) =>
    `absolute -bottom-1 left-0 h-px bg-[#D4AF37] transition-all duration-300 ${
      isActive(key) ? 'w-full' : 'w-0 group-hover:w-full'
    }`

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#050505]/90 backdrop-blur-xl border-b border-[#D4AF37]/20 shadow-[0_0_40px_rgba(193,18,31,0.08)]'
            : 'bg-transparent backdrop-blur-sm border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo + Brand */}
          <button
            onClick={(e) => handleNavClick(e, 'home')}
            className="flex items-center gap-3 group bg-transparent border-0 cursor-pointer"
          >
            <div className="relative">
              <img
                src="/Logo.png"
                alt="Kryptonex Logo"
                className="h-9 w-auto object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(193,18,31,0.7)]"
              />
            </div>
            <span className="font-orbitron font-bold text-lg text-[#F5F5F5] tracking-widest group-hover:text-[#D4AF37] transition-colors duration-300">
              KRYPTONEX
            </span>
          </button>

          {/* Desktop Nav Links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={(e) => handleNavClick(e, 'home')}
              className={`${linkClass('home')} bg-transparent border-0 cursor-pointer`}
            >
              Home
              <span className={underlineClass('home')} />
            </button>

            <button
              onClick={(e) => handleNavClick(e, 'events')}
              className={`${linkClass('events')} bg-transparent border-0 cursor-pointer`}
            >
              Events
              <span className={underlineClass('events')} />
            </button>

            <Link to="/team" className={linkClass('team')}>
              Team
              <span className={underlineClass('team')} />
            </Link>
          </div>

          {/* Hamburger — visible on mobile only */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden flex flex-col justify-center items-center gap-1.5 w-8 h-8 bg-transparent border-0 cursor-pointer z-60"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-px bg-[#F5F5F5] transition-all duration-300 ${
                menuOpen ? 'rotate-45 translate-y-[7px]' : ''
              }`}
            />
            <span
              className={`block w-6 h-px bg-[#F5F5F5] transition-all duration-300 ${
                menuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-6 h-px bg-[#F5F5F5] transition-all duration-300 ${
                menuOpen ? '-rotate-45 -translate-y-[7px]' : ''
              }`}
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-40 bg-[#050505]/97 backdrop-blur-xl md:hidden flex flex-col items-center justify-center gap-10"
          >
            {/* Close tap area (full background) */}
            <div
              className="absolute inset-0"
              onClick={() => setMenuOpen(false)}
            />

            <div className="relative flex flex-col items-center gap-8 z-10">
              <button
                onClick={(e) => handleNavClick(e, 'home')}
                className="font-orbitron text-2xl tracking-[0.2em] uppercase text-white/80 hover:text-[#D4AF37] transition-colors duration-300 bg-transparent border-0 cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={(e) => handleNavClick(e, 'events')}
                className="font-orbitron text-2xl tracking-[0.2em] uppercase text-white/80 hover:text-[#D4AF37] transition-colors duration-300 bg-transparent border-0 cursor-pointer"
              >
                Events
              </button>
              <Link
                to="/team"
                onClick={() => setMenuOpen(false)}
                className="font-orbitron text-2xl tracking-[0.2em] uppercase text-white/80 hover:text-[#D4AF37] transition-colors duration-300"
              >
                Team
              </Link>

              {/* Gold divider */}
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
              <p className="font-mono text-[10px] text-white/25 tracking-widest uppercase">Kryptonex — Tech & Innovation Club</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
