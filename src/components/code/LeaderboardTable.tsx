export interface LeaderboardRow {
  userId: number
  name: string
  rank: number
  score: number
  problemsSolved: number
  time: number
}

export default function LeaderboardTable({ entries }: { entries: LeaderboardRow[] }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="py-12 border border-white/5 bg-[#080808] text-center">
        <p className="font-mono text-white/20 text-xs tracking-widest uppercase">Leaderboard is empty.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-white/5 bg-[#060606]">
      <table className="w-full text-left font-mono text-sm whitespace-nowrap">
        <thead className="bg-[#0A0A0A] border-b border-white/10 text-[#D4AF37] uppercase tracking-widest text-[10px]">
          <tr>
            <th className="py-4 px-6 text-center">Rank</th>
            <th className="py-4 px-6">Name</th>
            <th className="py-4 px-6">Score</th>
            <th className="py-4 px-6 text-center">Solved</th>
            <th className="py-4 px-6 text-right">Time (s)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-white/70">
          {entries.map((entry) => (
            <tr key={entry.userId} className="hover:bg-white/5 transition-colors">
              <td className="py-4 px-6">
                 {entry.rank === 1 && <span className="text-[#D4AF37] mr-2">★</span>}
                 {entry.rank}
              </td>
              <td className="py-4 px-6 font-inter text-white">{entry.name}</td>
              <td className="py-4 px-6 font-bold">{entry.score}</td>
              <td className="py-4 px-6 text-center">{entry.problemsSolved}</td>
              <td className="py-4 px-6 text-right text-white/40">{entry.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
