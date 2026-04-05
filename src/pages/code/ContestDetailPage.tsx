import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import ProblemList, { ProblemData } from "../../components/code/ProblemList"
import { ContestData } from "../../components/code/ContestCard"
import { API } from "../../config/api"
import { useAuth } from "../../context/AuthContext"

export default function ContestDetailPage() {
  const { id } = useParams()
  const [contest, setContest] = useState<ContestData | null>(null)
  const [problems, setProblems] = useState<ProblemData[]>([])
  const [loading, setLoading] = useState(true)
  const { isAdmin } = useAuth()

  useEffect(() => {
    Promise.all([
      fetch(`${API.CONTEST}/contests/${id}`).then(r => r.json()),
      fetch(`${API.CONTEST}/contests/${id}/problems`).then(r => r.json())
    ])
    .then(([contestData, problemsData]) => {
      setContest(contestData)
      setProblems(problemsData)
      setLoading(false)
    })
    .catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <span className="font-mono text-[#D4AF37] text-[10px] tracking-widest animate-pulse">Loading Ruleset...</span>
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="min-h-screen pt-32 text-center text-white/50 font-mono">
        Contest data unavailable.
      </div>
    )
  }

  return (
    <div className="relative pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-3">
             <Link to="/code" className="font-mono text-white/30 text-[10px] tracking-widest hover:text-white uppercase transition-colors">
               &lt; Back to Arena
             </Link>
             <h2 className="font-orbitron font-black text-3xl md:text-4xl text-[#F5F5F5] tracking-tight uppercase">
               {contest.title}
             </h2>
             <p className="font-mono text-[#D4AF37] text-xs tracking-widest uppercase">
               Ends: {new Date(contest.endTime).toLocaleString()}
             </p>
          </div>
          <div>
            <Link 
              to={`/code/leaderboard/${id}`} 
              className="inline-block border border-[#C1121F]/50 text-[#C1121F] bg-[#C1121F]/5 px-6 py-2.5 text-xs font-mono uppercase tracking-widest hover:bg-[#C1121F] hover:text-white transition-colors"
            >
              View Leaderboard
            </Link>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-white/50 text-xs tracking-widest uppercase">[ Available Problems ]</h3>
            {isAdmin && contest && (new Date() < new Date(contest.startTime)) && (
              <Link
                to={`/admin/create-problem?contestId=${contest.id}`}
                className="font-mono text-[#D4AF37] text-[10px] tracking-widest uppercase border border-[#D4AF37]/50 px-4 py-1.5 hover:bg-[#D4AF37] hover:text-black transition-colors"
              >
                + Add Problem
              </Link>
            )}
          </div>
          
          {problems.length === 0 ? (
             <div className="py-12 border border-white/5 bg-[#080808] text-center flex flex-col items-center justify-center gap-4">
                <p className="font-mono text-white/30 text-xs tracking-widest uppercase">No problems added yet.</p>
                {isAdmin && contest && (new Date() < new Date(contest.startTime)) && (
                  <Link
                    to={`/admin/create-problem?contestId=${contest.id}`}
                    className="font-mono text-[#D4AF37] text-[10px] tracking-widest uppercase border border-[#D4AF37]/30 px-6 py-2 hover:bg-[#D4AF37]/10 transition-colors"
                  >
                    + Add First Problem
                  </Link>
                )}
             </div>
          ) : (
            <ProblemList problems={problems} />
          )}
        </div>

      </div>
    </div>
  )
}
