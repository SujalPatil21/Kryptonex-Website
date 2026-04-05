import { Link } from "react-router-dom"

export interface ProblemData {
  id: number
  title: string
  difficulty: string
}

export default function ProblemList({ problems }: { problems: ProblemData[] }) {
  if (!problems || problems.length === 0) {
    return (
      <div className="py-12 border border-white/5 bg-[#080808] text-center">
        <p className="font-mono text-white/20 text-xs tracking-widest uppercase">No problems indexed yet.</p>
      </div>
    )
  }

  const diffColors: any = {
    EASY: 'text-green-500',
    MEDIUM: 'text-[#D4AF37]',
    HARD: 'text-[#C1121F]'
  }

  return (
    <div className="space-y-4">
      {problems.map((prob) => (
        <div key={prob.id} className="flex flex-col md:flex-row md:items-center justify-between bg-[#080808] border border-white/5 p-4 md:p-6 hover:border-white/10 transition-colors">
          <div>
            <h3 className="font-orbitron text-lg font-bold text-white uppercase">{prob.title}</h3>
            <p className={`font-mono text-xs tracking-wider mt-1 ${diffColors[prob.difficulty] || 'text-white'}`}>
              Level: {prob.difficulty}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
             <Link 
              to={`/code/problem/${prob.id}`} 
              className="inline-block border border-white/20 text-white/70 px-6 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
            >
              Solve
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
