import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import CodeEditor from "../../components/code/CodeEditor"
import { API } from "../../config/api"

interface ProblemDetail {
  id: number
  title: string
  description: string
  difficulty: string
  contestId: number 
  constraints?: string
  timeLimit?: number
  sampleInput?: string
  sampleOutput?: string
}

const STARTER_CODE: Record<string, string> = {
  Java: "public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}",
  Python: "def solve():\n    # Your code here\n    pass\n\nif __name__ == '__main__':\n    solve()",
  "C++": "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}"
}

export default function ProblemPage() {
  const { id } = useParams()
  const [problem, setProblem] = useState<ProblemDetail | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [language, setLanguage] = useState("Java")
  const [code, setCode] = useState(STARTER_CODE["Java"])
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    fetch(`${API.CONTEST}/problems/${id}`)
      .then(r => {
        if (!r.ok) throw new Error("Problem not found")
        return r.json()
      })
      .then(data => {
        setProblem(data || null)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setProblem(null)
        setLoading(false)
      })
  }, [id])

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value
    setLanguage(newLang)
    setCode(STARTER_CODE[newLang])
    setResult(null)
  }

  const submitCode = async () => {
    if (!problem) return
    setSubmitting(true)
    setResult(null)
    try {
      // Mocking User ID 1 for now
      const payload = {
        userId: 1,
        problemId: problem.id,
        code,
        language
      }
      
      const res = await fetch(`${API.CONTEST}/contests/${problem.contestId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ status: 'ERROR', verdictMessage: 'Network error or system failure.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen pt-32 text-center text-[#D4AF37] font-mono animate-pulse">Loading Engine...</div>
  }

  if (!problem) {
    return <div className="min-h-screen pt-32 text-center text-white/50 font-mono">Problem not found.</div>
  }

  const resColor = result?.status === 'ACCEPTED' ? 'text-green-500' : 'text-[#C1121F]'

  return (
    <div className="relative pt-24 min-h-screen flex flex-col">
      <div className="flex-1 max-w-[1400px] w-full mx-auto grid lg:grid-cols-2 gap-4 p-4 lg:p-6 pb-20">
        
        {/* Left: Description */}
        <div className="bg-[#0A0A0A] border border-white/5 p-6 md:p-8 overflow-y-auto max-h-[80vh]">
           <Link to={`/code/contest/${problem.contestId}`} className="font-mono text-white/30 text-[10px] tracking-widest hover:text-white uppercase line-clamp-1 mb-8 inline-block transition-colors">
              &lt; Back to Contest
           </Link>
           <div className="flex flex-wrap items-center gap-3 mb-4">
             <span className="font-mono text-white/50 text-xs uppercase tracking-widest">Problem #{problem.id}</span>
             <span className="font-mono text-[#D4AF37] text-[10px] px-2 py-0.5 border border-[#D4AF37]/30 bg-[#D4AF37]/5 tracking-widest">{problem.difficulty}</span>
             {problem.timeLimit && (
                 <span className="font-mono text-white/40 text-[10px] uppercase border border-white/10 px-2 py-0.5">Time Limit: {problem.timeLimit}ms</span>
             )}
           </div>
           <h1 className="font-orbitron font-bold text-2xl md:text-3xl text-white uppercase mb-8">{problem.title}</h1>
           
           <div className="prose prose-invert prose-p:text-white/60 prose-p:font-inter prose-p:leading-relaxed max-w-none mb-10">
             <p>{problem.description}</p>
           </div>
           
           {problem.constraints && (
             <div className="mb-8">
               <h3 className="font-orbitron font-bold text-[#F5F5F5] uppercase tracking-widest text-sm mb-3">Constraints</h3>
               <div className="bg-[#050505] border border-white/5 p-4 font-mono text-sm text-white/70 whitespace-pre-wrap">
                 {problem.constraints}
               </div>
             </div>
           )}

           {(problem.sampleInput || problem.sampleOutput) && (
             <div className="mb-8 space-y-6">
               {problem.sampleInput && (
                 <div>
                   <h3 className="font-orbitron font-bold text-[#F5F5F5] uppercase tracking-widest text-sm mb-3">Sample Input</h3>
                   <div className="bg-[#050505] border border-white/5 p-4 font-mono text-sm text-white/70 whitespace-pre-wrap">
                     {problem.sampleInput}
                   </div>
                 </div>
               )}
               {problem.sampleOutput && (
                 <div>
                   <h3 className="font-orbitron font-bold text-[#F5F5F5] uppercase tracking-widest text-sm mb-3">Sample Output</h3>
                   <div className="bg-[#050505] border border-white/5 p-4 font-mono text-sm text-white/70 whitespace-pre-wrap">
                     {problem.sampleOutput}
                   </div>
                 </div>
               )}
             </div>
           )}
        </div>

        {/* Right: Editor */}
        <div className="flex flex-col gap-4">
           {/* Controls */}
           <div className="flex items-center justify-between bg-[#080808] border border-white/5 p-4">
             <div className="flex items-center gap-4">
                <label className="font-mono text-white/40 text-xs uppercase tracking-widest">Language</label>
                <select 
                  value={language} 
                  onChange={handleLanguageChange}
                  className="bg-[#050505] border border-white/10 text-white font-mono text-xs px-3 py-1.5 focus:outline-none focus:border-[#D4AF37]/50"
                >
                  <option value="Java">Java</option>
                  <option value="Python">Python</option>
                  <option value="C++">C++</option>
                </select>
             </div>
             
             <button 
                onClick={submitCode}
                disabled={submitting}
                className="bg-[#D4AF37] text-black font-mono font-bold text-xs uppercase tracking-widest px-6 py-2 hover:bg-[#b5952f] transition-colors disabled:opacity-50"
             >
                {submitting ? 'Running...' : 'Submit Output'}
             </button>
           </div>

           {/* Editor Render */}
           <div className="block flex-1 border border-white/5 overflow-hidden">
             <CodeEditor 
               language={language}
               code={code}
               onChange={(val) => setCode(val || "")}
             />
           </div>
           
           {/* Result Block */}
           {result && (
             <div className="bg-[#0A0A0A] border border-white/5 p-5 mt-2">
                <span className="font-mono text-white/30 text-[10px] uppercase tracking-widest mb-2 block">Execution Result</span>
                <div className={`font-orbitron font-bold tracking-wide uppercase ${resColor}`}>
                  {result.status}
                </div>
                <div className="font-mono text-white/60 text-xs mt-2">
                  <span className="text-white/30">&gt; </span> {result.verdictMessage}
                </div>
                {result.executionTime !== undefined && (
                  <div className="font-mono text-[#D4AF37]/80 text-[10px] tracking-widest mt-4">
                    Execution Time: {result.executionTime}ms
                  </div>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
