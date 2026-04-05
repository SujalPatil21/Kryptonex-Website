import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { API } from "../../config/api"

export default function CreateContestPage() {
  const navigate = useNavigate()
  
  const [title, setTitle] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!title.trim()) {
      setError("Title is required.")
      return
    }
    if (!startTime || !endTime) {
      setError("Start time and End time are required.")
      return
    }
    if (new Date(startTime) >= new Date(endTime)) {
      setError("Start time must be before end time.")
      return
    }

    setLoading(true)

    try {
      const payload = {
        title: title.trim(),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        createdBy: 2
      }

      const res = await fetch(`${API.CONTEST}/contests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        throw new Error("Failed to create contest. Check server logs.")
      }

      navigate("/code")
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="relative pt-32 pb-20 px-6 min-h-[80vh] flex flex-col justify-center items-center">
      <div className="w-full max-w-lg border border-white/5 bg-[#080808] p-8 space-y-8">
        
        <div className="space-y-2">
          <Link to="/code" className="font-mono text-white/30 text-[10px] tracking-widest hover:text-white uppercase transition-colors">
            &lt; Back to Arena
          </Link>
          <h2 className="font-orbitron font-black text-2xl md:text-3xl text-[#F5F5F5] tracking-tight uppercase">
            Create Contest
          </h2>
          <p className="font-inter text-[#D4AF37] text-xs tracking-wide">
            Admin access sequence
          </p>
        </div>

        {error && (
          <div className="border border-red-500/30 bg-red-500/5 p-4">
            <p className="font-mono text-red-500 text-xs uppercase tracking-widest">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="font-mono text-white/50 text-[10px] uppercase tracking-widest">
              Contest Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 text-white p-3 font-inter text-sm focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
              placeholder="e.g. Weekly Algorithm Sprint"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-white/50 text-[10px] uppercase tracking-widest">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 text-white p-3 font-mono text-sm uppercase focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-white/50 text-[10px] uppercase tracking-widest">
              End Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 text-white p-3 font-mono text-sm uppercase focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4AF37] text-black font-orbitron font-bold text-sm tracking-[0.2em] uppercase py-4 hover:bg-[#b5952f] transition-all duration-300 disabled:opacity-50 mt-4"
          >
            {loading ? "INITIALIZING..." : "LAUNCH CONTEST"}
          </button>
        </form>
      </div>
    </div>
  )
}
