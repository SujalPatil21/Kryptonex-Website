import { useState } from "react"
import { useNavigate, Link, useSearchParams } from "react-router-dom"
import { API } from "../../config/api"

interface TestCaseInputs {
  parameterValues: Record<string, string>
  expectedOutput: string
  isHidden: boolean
}

interface ParameterInput {
  name: string
  type: string
}

export default function CreateProblemPage() {
  const navigate = useNavigate()
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [difficulty, setDifficulty] = useState("EASY")
  const [timeLimit, setTimeLimit] = useState<number | "">("")
  const [sampleInput, setSampleInput] = useState("")
  const [sampleOutput, setSampleOutput] = useState("")
  const [searchParams] = useSearchParams()
  const [contestId, setContestId] = useState<number | "">(searchParams.get("contestId") ? Number(searchParams.get("contestId")) : "")
  
  // Function Metadata for Backend Judge
  const [functionName, setFunctionName] = useState("")
  const [parameters, setParameters] = useState<ParameterInput[]>([{ name: "nums", type: "int_array" }, { name: "target", type: "int" }])
  const [returnType, setReturnType] = useState("int_array")
  
  const [testCases, setTestCases] = useState<TestCaseInputs[]>([
    { parameterValues: { nums: "", target: "" }, expectedOutput: "", isHidden: true }
  ])
  
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleTestCaseChange = (index: number, field: keyof TestCaseInputs, value: string | boolean | Record<string, string>) => {
    const updatedTestCases = [...testCases]
    updatedTestCases[index] = { ...updatedTestCases[index], [field]: value } as TestCaseInputs
    setTestCases(updatedTestCases)
  }

  const handleParamValueChange = (tcIndex: number, paramName: string, value: string) => {
    const updatedTestCases = [...testCases]
    updatedTestCases[tcIndex] = {
      ...updatedTestCases[tcIndex],
      parameterValues: {
        ...updatedTestCases[tcIndex].parameterValues,
        [paramName]: value
      }
    }
    setTestCases(updatedTestCases)
  }

  const addTestCase = () => {
    const freshParameterValues: Record<string, string> = {}
    parameters.forEach(p => {
      if (p.name) freshParameterValues[p.name] = ""
    })
    setTestCases([...testCases, { parameterValues: freshParameterValues, expectedOutput: "", isHidden: true }])
  }

  const removeTestCase = (index: number) => {
    if (testCases.length > 1) {
      const updated = testCases.filter((_, i) => i !== index)
      setTestCases(updated)
    }
  }

  const handleParameterChange = (index: number, field: keyof ParameterInput, value: string) => {
    const updated = [...parameters]
    const oldName = updated[index].name
    updated[index] = { ...updated[index], [field]: value }
    setParameters(updated)

    // If name changed, update all test cases to use the new name
    if (field === "name" && value !== oldName) {
      setTestCases(testCases.map(tc => {
        const newParamValues = { ...tc.parameterValues }
        if (oldName && newParamValues.hasOwnProperty(oldName)) {
          newParamValues[value] = newParamValues[oldName]
          delete newParamValues[oldName]
        } else {
          newParamValues[value] = ""
        }
        return { ...tc, parameterValues: newParamValues }
      }))
    }
  }

  const addParameter = () => {
    const newParamName = `param${parameters.length + 1}`
    setParameters([...parameters, { name: newParamName, type: "int" }])
    setTestCases(testCases.map(tc => ({
      ...tc,
      parameterValues: { ...tc.parameterValues, [newParamName]: "" }
    })))
  }

  const removeParameter = (index: number) => {
    if (parameters.length > 1) {
      const paramToRemove = parameters[index].name
      setParameters(parameters.filter((_, i) => i !== index))
      setTestCases(testCases.map(tc => {
        const newParamValues = { ...tc.parameterValues }
        delete newParamValues[paramToRemove]
        return { ...tc, parameterValues: newParamValues }
      }))
    }
  }

  const parseValue = (value: string, type: string) => {
    const trimmed = value.trim()
    if (type === "int") {
      const num = Number(trimmed)
      return isNaN(num) || trimmed === "" ? null : num
    }
    if (type === "int_array") {
      if (trimmed === "") return [] // or null? usually empty array is valid if planned
      const parts = trimmed.split(",").filter(s => s.trim() !== "")
      const nums = parts.map(s => Number(s.trim()))
      if (nums.some(n => isNaN(n))) return null
      return nums
    }
    if (type === "string_array") {
      return trimmed.split(",").map(s => s.trim()).filter(s => s !== "")
    }
    return trimmed // string
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim() || !description.trim() || !contestId || timeLimit === "" || !functionName.trim()) {
      setError("Please fill out all required problem fields.")
      return
    }

    setLoading(true)

    try {
      // 1. Create Problem
      const problemPayload = {
        title: title.trim(),
        description: description.trim(),
        difficulty: difficulty,
        timeLimit: Number(timeLimit),
        sampleInput: sampleInput.trim(),
        sampleOutput: sampleOutput.trim(),
        constraints: "",
        functionName: functionName.trim(),
        parameters: parameters,
        returnType: returnType.trim()
      }

      const problemRes = await fetch(`${API.CONTEST}/contests/${contestId}/problems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(problemPayload)
      })

      if (!problemRes.ok) throw new Error("Failed to create problem")
      const problemData = await problemRes.json()
      const problemId = problemData.id

      // 2. Create Test Cases iteratively
      for (const tc of testCases) {
        // Build inputJson object
        const inputJson: Record<string, any> = {}
        let isValid = true

        for (const param of parameters) {
          const rawValue = tc.parameterValues[param.name] || ""
          const parsed = parseValue(rawValue, param.type)
          if (parsed === null && param.type === "int") {
            setError(`Invalid integer for parameter "${param.name}" in one of the test cases.`)
            isValid = false
            break
          }
          if (parsed === null && param.type === "int_array") {
            setError(`Invalid integer array for parameter "${param.name}". Use comma separated numbers (e.g. 1,2,3).`)
            isValid = false
            break
          }
          inputJson[param.name] = parsed
        }

        if (!isValid) {
          setLoading(false)
          return
        }

        const expectedOutput = parseValue(tc.expectedOutput, returnType)
        if (expectedOutput === null && (returnType === "int" || returnType === "int_array")) {
          setError(`Invalid expected output format. Must match type: ${returnType}`)
          setLoading(false)
          return
        }

        const tcPayload = {
          inputJson: inputJson,
          expectedOutputJson: expectedOutput,
          isHidden: tc.isHidden
        }

        const tcRes = await fetch(`${API.CONTEST}/problems/${problemId}/testcases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tcPayload)
        })

        if (!tcRes.ok) throw new Error("Failed to create a test case")
      }

      navigate(`/code/contest/${contestId}`)
    } catch (err: any) {
      setError(err.message || "An error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="relative pt-32 pb-20 px-6 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-4xl border border-white/5 bg-[#080808] p-8">
        
        <div className="space-y-2 mb-8">
          <Link to="/code" className="font-mono text-white/30 text-[10px] tracking-widest hover:text-white uppercase transition-colors">
            &lt; Back to Arena
          </Link>
          <h2 className="font-orbitron font-black text-2xl md:text-3xl text-[#F5F5F5] tracking-tight uppercase">
            Create Problem
          </h2>
          <p className="font-inter text-[#D4AF37] text-xs tracking-wide">
            Integrate new challenge into contest
          </p>
        </div>

        {error && (
          <div className="border border-red-500/30 bg-red-500/5 p-4 mb-6">
            <p className="font-mono text-red-500 text-xs uppercase tracking-widest">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Problem Basics */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-mono text-white/50 text-[10px] uppercase tracking-widest">Contest ID</label>
              <input type="number" value={contestId} onChange={(e) => setContestId(e.target.value ? Number(e.target.value) : "")}
                className="w-full bg-[#050505] border border-white/10 text-white p-3 font-mono text-sm focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                placeholder="e.g. 1" required
              />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-white/50 text-[10px] uppercase tracking-widest">Problem Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 text-white p-3 font-inter text-sm focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                placeholder="Two Sum" required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-6">
            <h3 className="font-orbitron font-bold text-[10px] text-[#D4AF37] uppercase tracking-[0.2em] border-l-2 border-[#D4AF37] pl-3">
              Function Metadata
            </h3>
            
            <div className="space-y-2">
              <label className="font-mono text-white/50 text-[10px] uppercase tracking-widest">Function Name</label>
              <input type="text" value={functionName} onChange={(e) => setFunctionName(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 text-white p-3 font-mono text-sm focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                placeholder="e.g. twoSum" required
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-mono text-white/50 text-[10px] uppercase tracking-widest">Parameters</h4>
              {parameters.map((param, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <label className="font-mono text-white/50 text-[10px] uppercase tracking-widest">Name</label>
                    <input type="text" value={param.name} onChange={(e) => handleParameterChange(index, "name", e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 text-white p-2 font-mono text-sm focus:border-[#D4AF37]/50"
                      placeholder="e.g. nums" required
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="font-mono text-white/50 text-[10px] uppercase tracking-widest">Type</label>
                    <select value={param.type} onChange={(e) => handleParameterChange(index, "type", e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 text-white p-2 font-mono text-sm uppercase focus:border-[#D4AF37]/50"
                    >
                      <option value="int">int</option>
                      <option value="string">string</option>
                      <option value="int_array">int_array</option>
                      <option value="string_array">string_array</option>
                    </select>
                  </div>
                  <button type="button" onClick={() => removeParameter(index)} className="font-mono text-red-500/70 p-2 text-xs uppercase mb-1">X</button>
                </div>
              ))}
              <button type="button" onClick={addParameter} className="text-[#D4AF37] font-mono text-[10px] uppercase">+ Add Parameter</button>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-white/50 text-[10px] uppercase tracking-widest">Return Type</label>
              <select value={returnType} onChange={(e) => setReturnType(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 text-white p-3 font-mono text-sm uppercase focus:border-[#D4AF37]/50"
              >
                <option value="int">int</option>
                <option value="string">string</option>
                <option value="int_array">int_array</option>
                <option value="string_array">string_array</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-mono text-white/50 text-[10px] uppercase tracking-widest">Description (Markdown Supported)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
              className="w-full bg-[#050505] border border-white/10 text-white p-3 font-inter text-sm focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
              placeholder="Given an array of integers..." required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-mono text-white/50 text-[10px] uppercase tracking-widest">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 text-white p-3 font-mono text-sm uppercase focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-mono text-white/50 text-[10px] uppercase tracking-widest">Time Limit (ms)</label>
              <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value ? Number(e.target.value) : "")}
                className="w-full bg-[#050505] border border-white/10 text-white p-3 font-mono text-sm focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                placeholder="2000" required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
             <div className="space-y-2 block">
                <label className="font-mono text-white/50 text-[10px] uppercase tracking-widest">Sample Input (Display)</label>
                <textarea value={sampleInput} onChange={(e) => setSampleInput(e.target.value)} rows={2}
                  className="w-full bg-[#050505] border border-white/10 text-white p-3 font-mono text-xs focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                  placeholder="[2,7,11,15]\n9"
                />
             </div>
             <div className="space-y-2 block">
                <label className="font-mono text-white/50 text-[10px] uppercase tracking-widest">Sample Output (Display)</label>
                <textarea value={sampleOutput} onChange={(e) => setSampleOutput(e.target.value)} rows={2}
                  className="w-full bg-[#050505] border border-white/10 text-white p-3 font-mono text-xs focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                  placeholder="[0,1]"
                />
             </div>
          </div>

          {/* Test Cases System */}
          <div className="pt-8 border-t border-white/5 space-y-6">
            <h3 className="font-orbitron text-[#F5F5F5] uppercase tracking-widest border-l-2 border-[#D4AF37] pl-3">
              I/O Test Cases
            </h3>
            
            {testCases.map((tc, index) => (
              <div key={index} className="bg-[#050505] border border-white/10 p-5 space-y-4 relative">
                <div className="absolute top-4 right-4">
                  <button type="button" onClick={() => removeTestCase(index)} className="font-mono text-red-500/70 hover:text-red-500 text-[10px] tracking-widest uppercase">
                    Remove
                  </button>
                </div>
                
                <h4 className="font-mono text-white/40 text-[10px] uppercase tracking-widest">Case #{index + 1}</h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="font-mono text-[#D4AF37] text-[9px] uppercase tracking-widest block mb-2">Input Parameters</label>
                    <div className="space-y-3">
                      {parameters.map((param) => (
                        <div key={param.name} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="font-mono text-white/40 text-[8px] uppercase">{param.name}</label>
                            <span className="font-mono text-white/20 text-[8px] uppercase italic">{param.type}</span>
                          </div>
                          <input
                            type={param.type === "int" ? "number" : "text"}
                            value={tc.parameterValues[param.name] || ""}
                            onChange={(e) => handleParamValueChange(index, param.name, e.target.value)}
                            className="w-full bg-black border border-white/10 text-[#D4AF37] p-2 font-mono text-xs focus:outline-none focus:border-[#D4AF37]/50"
                            placeholder={param.type === "int_array" || param.type === "string_array" ? "e.g. 1, 2, 3" : "e.g. value"}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 flex flex-col">
                    <label className="font-mono text-[#D4AF37] text-[9px] uppercase tracking-widest block mb-2">Expected Output</label>
                    <div className="flex-1">
                       <div className="flex justify-between items-center mb-1">
                          <label className="font-mono text-white/40 text-[8px] uppercase">Value</label>
                          <span className="font-mono text-white/20 text-[8px] uppercase italic">{returnType}</span>
                        </div>
                        <textarea 
                          value={tc.expectedOutput} 
                          onChange={(e) => handleTestCaseChange(index, "expectedOutput", e.target.value)} 
                          rows={parameters.length > 2 ? parameters.length * 2 : 3}
                          className="w-full bg-black border border-white/10 text-[#D4AF37] p-3 font-mono text-xs focus:outline-none focus:border-[#D4AF37]/50" 
                          required
                          placeholder={returnType.includes("array") ? "e.g. 0, 1" : "e.g. 15"}
                        />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                  <input type="checkbox" id={`hidden-${index}`} checked={tc.isHidden} onChange={(e) => handleTestCaseChange(index, "isHidden", e.target.checked)} 
                    className="accent-[#D4AF37] w-4 h-4 bg-black border border-white/20"
                  />
                  <label htmlFor={`hidden-${index}`} className="font-mono text-white/60 text-[10px] uppercase tracking-widest cursor-pointer">
                    Keep Case Hidden from User
                  </label>
                </div>
              </div>
            ))}

            <button type="button" onClick={addTestCase} 
              className="w-full border border-dashed border-[#D4AF37]/30 text-[#D4AF37]/70 py-4 font-mono text-xs uppercase tracking-widest hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all"
            >
              + ADD TEST CASE
            </button>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#D4AF37] text-black font-orbitron font-bold text-sm tracking-[0.2em] uppercase py-4 hover:bg-[#b5952f] transition-all duration-300 disabled:opacity-50 mt-4"
          >
            {loading ? "COMMITTING..." : "PUBLISH PROBLEM"}
          </button>
        </form>
      </div>
    </div>
  )
}
