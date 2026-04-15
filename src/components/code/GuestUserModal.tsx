import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { API } from "../../config/api"

interface GuestUserModalProps {
  onSuccess: (userId: number) => void
  onClose?: () => void
}

export default function GuestUserModal({ onSuccess, onClose }: GuestUserModalProps) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API.USERS}/guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })

      if (response.status === 400) {
        const errorData = await response.json()
        if (errorData.error === "Username already exists") {
          setError("Username already taken. Try another.")
          return
        }
        throw new Error(errorData.message || "Invalid request")
      }

      if (!response.ok) throw new Error("Failed to create guest user")

      const data = await response.json()
      localStorage.setItem("userId", data.id.toString())
      onSuccess(data.id)
    } catch (err) {
      setError("Something went wrong. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-pointer"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 p-8 shadow-2xl"
      >
        {/* Close Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-orbitron font-black text-2xl text-white uppercase tracking-tight">
              Identify Yourself
            </h2>
            <p className="font-mono text-white/40 text-[10px] uppercase tracking-[0.2em]">
              Enter your name to join the contest
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-mono text-[#D4AF37] text-[10px] uppercase tracking-widest block">
                [ Username ]
              </label>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Sujal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 px-4 py-3 font-mono text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors placeholder:text-white/10"
              />
            </div>

            {error && (
              <p className="font-mono text-[#C1121F] text-[10px] uppercase tracking-widest animate-pulse">
                Error: {error}
              </p>
            )}

            <button
              disabled={!name.trim() || loading}
              className="w-full bg-[#D4AF37] text-black font-mono font-bold text-xs uppercase tracking-widest py-4 hover:bg-[#b5952f] transition-all disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <span className="relative z-10">
                {loading ? "Registering Node..." : "Join Contest"}
              </span>
              {!loading && (
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              )}
            </button>
          </form>

          <p className="font-mono text-white/20 text-[8px] text-center uppercase tracking-[0.3em] pt-4 border-t border-white/5">
            // Guest session will be stored locally
          </p>
        </div>
      </motion.div>
    </div>
  )
}
