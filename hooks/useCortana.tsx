import { useState } from "react"
import type { AgentResponse } from "@/app/api/agent/route"
import type { Todo } from "@/types/todo"

export type TerminalMessage = {
  id: number
  from: "user" | "cortana"
  text: string
}

type CortanaOptions = {
  todos: Todo[]
  onCreateTodo: (text: string) => Promise<void>
  onToggleTodo: (id: number) => Promise<void>
  onDeleteTodo: (id: number) => void
  onFilter: (filter: "all" | "completed" | "pending") => void
}

export function useCortana({ todos, onCreateTodo, onDeleteTodo, onFilter, onToggleTodo }: CortanaOptions) {
  const [terminalHistory, setTerminalHistory] = useState<TerminalMessage[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [pendingAction, setPendingAction] = useState<AgentResponse | null>(null)

  function addToHistory(from: "user" | "cortana", text: string) {
    setTerminalHistory((prev) => [...prev, { id: Date.now(), from, text }])
  }

  async function handleCommand(userMessage: string) {
    addToHistory("user", userMessage)
    setIsThinking(true)

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage, todos }),
      })

      const agentResponse: AgentResponse = await res.json()
      addToHistory("cortana", agentResponse.message)

      if (agentResponse.action !== "none") {
        setPendingAction(agentResponse)
      }
    } catch {
      addToHistory("cortana", "I lost connection for a moment. Try again, Chief.")
    } finally {
      setIsThinking(false)
    }
  }

  async function handleConfirm() {
    if (!pendingAction) return

    const { action, payload } = pendingAction

    if (action === "create" && payload.todoText) {
      await onCreateTodo(payload.todoText)
    } else if (action === "toggle" && payload.todoId) {
      await onToggleTodo(payload.todoId)
    } else if (action === "delete" && payload.todoId) {
      onDeleteTodo(payload.todoId)
    } else if (action === "filter" && payload.filter) {
      onFilter(payload.filter)
    }

    setPendingAction(null)
  }

  function cancelPendingAction() {
    addToHistory("cortana", "Understood, Chief. Standing by.")
    setPendingAction(null)
  }

  return {
    terminalHistory,
    isThinking,
    pendingAction,
    handleCommand,
    handleConfirm,
    cancelPendingAction,
    setPendingAction,
  }
}
