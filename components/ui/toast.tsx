import * as React from "react"

interface ToastProps {
  message: string
  visible: boolean
  type: "success" | "error"
}

export function Toast({ message, visible, type }: ToastProps) {
  return (
    <div
      className={`fixed bottom-8 right-8 z-50 flex items-center gap-3
        border bg-black px-5 py-3 font-mono text-xs transition-all duration-300 rounded-sm
        ${
          type === "success"
            ? "border-cyan-500/70 text-cyan-300"
            : "border-red-500/70 text-red-400"
        }
        ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
    >
      <span>{type === "success" ? "▶" : "✕"}</span>
      {message}
    </div>
  )
}
