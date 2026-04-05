import { useEffect, useState } from "react"
import ContestCard, { ContestData } from "../../components/code/ContestCard"
import { API } from "../../config/api"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function ContestPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [contests, setContests] = useState<ContestData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API.CONTEST}/contests`)
      .then(res => res.json())
      .then(data => {
        setContests(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to load contests:", err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="relative pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-10">
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-[#D4AF37]" />
            <span className="font-mono text-[#D4AF37] text-xs tracking-[0.3em] uppercase">
              System / Arena
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-orbitron font-black text-4xl md:text-5xl text-[#F5F5F5] tracking-tight uppercase">
                Coding Arena
              </h2>
              <p className="font-inter text-white/35 text-sm tracking-wide mt-2">
                Test your skills. Compete with the best.
              </p>
            </div>
            
            {isAdmin && (
              <button 
                onClick={() => navigate('/admin/create-contest')}
                className="font-mono text-[10px] md:text-xs font-bold tracking-[0.2em] border border-[#D4AF37]/50 bg-[#D4AF37]/5 px-6 py-2.5 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all duration-300 uppercase"
              >
                Create Contest
              </button>
            )}
          </div>
        </div>

        {loading ? (
           <div className="py-20 text-center">
              <span className="font-mono text-[#D4AF37] text-[10px] tracking-widest animate-pulse">Initializing Arena...</span>
           </div>
        ) : contests.length === 0 ? (
           <div className="py-20 border border-white/5 bg-[#080808] text-center space-y-4">
              <p className="font-mono text-white/50 text-sm tracking-widest uppercase">No contests available</p>
              {!isAdmin && <p className="font-mono text-white/30 text-xs tracking-widest">Check back later</p>}
              {isAdmin && (
                <div className="pt-4">
                  <button 
                    onClick={() => navigate('/admin/create-contest')}
                    className="font-mono text-[10px] font-bold tracking-[0.2em] border border-[#D4AF37]/50 px-6 py-2.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all duration-300 uppercase"
                  >
                    Create Contest
                  </button>
                </div>
              )}
           </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests.map((c) => (
              <ContestCard key={c.id} contest={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
