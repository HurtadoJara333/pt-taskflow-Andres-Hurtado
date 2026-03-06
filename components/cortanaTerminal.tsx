import { useRef, useState } from "react"
import type { TerminalMessage } from "@/hooks/useCortana"

type CortanaTerminalProps = {
  onCommand: (text: string) => void
  isThinking: boolean
  history: TerminalMessage[]
}

export function CortanaTerminal({ onCommand, isThinking, history }: CortanaTerminalProps) {
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  function handleSubmit() {
    const text = input.trim()
    if (!text || isThinking) return
    onCommand(text)
    setInput("")
  }

  return (
    <div className="border border-cyan-700/50 rounded-sm bg-black overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.08)]">
      <div className="flex items-center justify-between border-b border-cyan-900/50 px-4 py-2 bg-cyan-950/20">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
          <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">
            CORTANA // AI INTERFACE
          </span>
        </div>
        <span className="text-xs text-cyan-700">UNSC TACTICAL OS v7.0</span>
      </div>
      <div className="h-48 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {history.length === 0 && (
          <p className="text-xs text-cyan-700 font-mono italic">
            Hello, Chief. I&apos;m online and ready. Tell me what needs to be done.
          </p>
        )}
        {history.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 text-xs font-mono ${
              msg.from === "user" ? "text-cyan-300" : "text-cyan-500"
            }`}
          >
            <span className="shrink-0 text-cyan-700">
              {msg.from === "user" ? "CHIEF >" : "CORTANA >"}
            </span>
            <span>{msg.text}</span>
          </div>
        ))}
        {isThinking && (
          <div className="flex gap-2 text-xs font-mono text-cyan-700">
            <span className="shrink-0">CORTANA &gt;</span>
            <span className="animate-pulse">processing...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 border-t border-cyan-900/50 px-4 py-3">
        <span className="text-cyan-600 text-xs font-mono shrink-0">CHIEF &gt;</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Give me an order..."
          disabled={isThinking}
          className="flex-1 bg-transparent text-xs font-mono text-cyan-200
            placeholder-cyan-800 outline-none disabled:opacity-50 cursor-text"
        />
        <button
          onClick={handleSubmit}
          disabled={isThinking || !input.trim()}
          className="text-xs font-mono text-cyan-600 cursor-pointer border border-cyan-900/50
            px-3 py-1 rounded-sm transition-all hover:border-cyan-500 hover:text-cyan-300
            disabled:opacity-30 disabled:cursor-not-allowed"
        >
          [SEND]
        </button>
      </div>
    </div>
  )
}
