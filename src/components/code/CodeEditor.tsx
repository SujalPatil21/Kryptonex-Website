import Editor from "@monaco-editor/react"

interface CodeEditorProps {
  language: string
  code: string
  onChange: (value: string | undefined) => void
}

export default function CodeEditor({ language, code, onChange }: CodeEditorProps) {
  // Monaco uses lowercase identifiers
  const monacoLanguage = language.toLowerCase() === 'c++' ? 'cpp' : language.toLowerCase()

  return (
    <div className="border border-white/5 bg-[#050505] h-[500px]">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-[#080808]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#C1121F]/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]/50" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
        <span className="font-mono text-white/30 text-[10px] tracking-widest ml-4 uppercase">
           {language} Editor
        </span>
      </div>
      <Editor
        height="calc(100% - 37px)"
        language={monacoLanguage}
        theme="vs-dark"
        value={code}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          padding: { top: 16 },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  )
}
