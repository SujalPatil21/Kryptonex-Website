import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import LeaderboardTable, { LeaderboardRow } from "../../components/code/LeaderboardTable"
import { API } from "../../config/api"

export default function LeaderboardPage() {
  const { id } = useParams()
  const [entries, setEntries] = useState<LeaderboardRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API.CONTEST}/contests/${id}/leaderboard`)
      .then(res => res.json())
      .then(data => {
        setEntries(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

  return (
    <div className="relative pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-10">
        
        <div className="border-b border-white/5 pb-8 space-y-3">
           <Link to={`/code/contest/${id}`} className="font-mono text-white/30 text-[10px] tracking-widest hover:text-white uppercase transition-colors">
              &lt; Back to Contest Overview
           </Link>
           <h2 className="font-orbitron font-black text-3xl md:text-4xl text-[#D4AF37] tracking-tight uppercase">
             Leaderboard
           </h2>
           <p className="font-mono text-white/40 text-xs tracking-widest uppercase">
             Global Ranking
           </p>
        </div>

        {loading ? (
             <div className="py-20 text-center">
                <span className="font-mono text-[#D4AF37] text-[10px] tracking-widest animate-pulse">Computing Standings...</span>
             </div>
        ) : (
          <LeaderboardTable entries={entries} />
        )}
      </div>
    </div>
  )
}
