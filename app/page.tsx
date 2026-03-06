"use client"

import { useEffect, useRef, useState } from "react"
import { fetchTodos, createTodo, updateTodo, deleteTodo } from "@/lib/api"
import type { Todo, TodosResponse } from "@/types/todo"
import type { AgentResponse } from "@/app/api/agent/route"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Filter = "all" | "completed" | "pending"

// Shape of a message in the Cortana terminal history
interface TerminalMessage {
  id: number
  from: "user" | "cortana"
  text: string
}

// ─── LoadingSkeleton ───────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border border-cyan-900/50 bg-cyan-950/10 p-4 rounded-sm">
          <div className="h-5 w-5 shrink-0 animate-pulse rounded-sm bg-cyan-900/50" />
          <div className="h-4 flex-1 animate-pulse rounded-sm bg-cyan-900/50" />
          <div className="h-3 w-14 animate-pulse rounded-sm bg-cyan-900/50" />
        </div>
      ))}
    </div>
  )
}

// ─── EmptyState ────────────────────────────────────────────────────────────
function EmptyState({ filter }: { filter: Filter }) {
  const messages: Record<Filter, string> = {
    all:       "No tasks in the system.",
    completed: "No completed tasks yet.",
    pending:   "No pending tasks. System clean.",
  }
  return (
    <div className="border border-dashed border-cyan-800/50 py-16 text-center rounded-sm">
      <p className="text-4xl mb-4 text-cyan-600">◈</p>
      <h3 className="text-base font-bold text-cyan-300 mb-2 tracking-widest">EMPTY SYSTEM</h3>
      <p className="text-xs text-cyan-600 font-mono">{messages[filter]}</p>
    </div>
  )
}

// ─── Toast ─────────────────────────────────────────────────────────────────
function Toast({ message, visible, type }: { message: string; visible: boolean; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-3
      border bg-black px-5 py-3 font-mono text-xs transition-all duration-300 rounded-sm
      ${type === "success" ? "border-cyan-500/70 text-cyan-300" : "border-red-500/70 text-red-400"}
      ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
    >
      <span>{type === "success" ? "▶" : "✕"}</span>
      {message}
    </div>
  )
}

// ─── TodoItem ──────────────────────────────────────────────────────────────
function TodoItem({ todo, onToggle, onDelete }: { todo: Todo; onToggle: (id: number) => void; onDelete: (id: number) => void }) {
  return (
    <div className={`flex items-center gap-3 border border-cyan-900/40 bg-black p-4 rounded-sm
      transition-all hover:border-cyan-400/60 hover:bg-cyan-950/20 ${todo.completed ? "opacity-50" : ""}`}
    >
      <button
        onClick={() => onToggle(todo.id)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 cursor-pointer transition-all
          ${todo.completed ? "border-cyan-400 bg-cyan-400" : "border-cyan-700 hover:border-cyan-400"}`}
      >
        {todo.completed && <span className="text-xs font-bold text-black">✓</span>}
      </button>
      <span className={`flex-1 text-sm font-mono select-none ${todo.completed ? "line-through text-cyan-800" : "text-cyan-100"}`}>
        {todo.todo}
      </span>
      <span className="shrink-0 font-mono text-xs text-cyan-600">#{String(todo.id).padStart(3, "0")}</span>
      <span className={`shrink-0 px-2 py-0.5 text-xs font-mono rounded-sm border
        ${todo.completed ? "border-cyan-700 text-cyan-500" : "border-cyan-900/50 text-cyan-700"}`}>
        {todo.completed ? "DONE" : "PENDING"}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="shrink-0 border border-transparent px-2 py-1 text-xs font-mono text-cyan-600
          cursor-pointer transition-all rounded-sm hover:border-red-500/60 hover:text-red-400"
      >
        [DEL]
      </button>
    </div>
  )
}

// ─── CortanaTerminal ───────────────────────────────────────────────────────
// Minimalist terminal input with conversation history
function CortanaTerminal({
  onCommand,
  isThinking,
  history,
}: {
  onCommand: (text: string) => void
  isThinking: boolean
  history: TerminalMessage[]
}) {
  const [input, setInput]   = useState("")
  const bottomRef           = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history])

  function handleSubmit() {
    const text = input.trim()
    if (!text || isThinking) return
    onCommand(text)
    setInput("")
  }

  return (
    <div className="border border-cyan-700/50 rounded-sm bg-black overflow-hidden
      shadow-[0_0_30px_rgba(34,211,238,0.08)]">

      {/* Terminal header */}
      <div className="flex items-center justify-between border-b border-cyan-900/50 px-4 py-2 bg-cyan-950/20">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
          <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">
            CORTANA // AI INTERFACE
          </span>
        </div>
        <span className="text-xs text-cyan-700">UNSC TACTICAL OS v7.0</span>
      </div>

      {/* Conversation history */}
      <div className="h-48 overflow-y-auto px-4 py-3 flex flex-col gap-2 scrollbar-thin">
        {history.length === 0 && (
          <p className="text-xs text-cyan-700 font-mono italic">
            Hello, Chief. I&apos;m online and ready. Tell me what needs to be done.
          </p>
        )}
        {history.map((msg) => (
          <div key={msg.id} className={`flex gap-2 text-xs font-mono ${msg.from === "user" ? "text-cyan-300" : "text-cyan-500"}`}>
            <span className="shrink-0 text-cyan-700">
              {msg.from === "user" ? "CHIEF >" : "CORTANA >"}
            </span>
            <span>{msg.text}</span>
          </div>
        ))}
        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex gap-2 text-xs font-mono text-cyan-700">
            <span className="shrink-0">CORTANA &gt;</span>
            <span className="animate-pulse">processing...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
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

// ─── PAGE ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [todos, setTodos]           = useState<Todo[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [isLoading, setIsLoading]   = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [newTodo, setNewTodo]       = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [filter, setFilter]         = useState<Filter>("all")
  const [retryCount, setRetryCount] = useState(0)

  // Cortana state
  const [terminalHistory, setTerminalHistory] = useState<TerminalMessage[]>([])
  const [isThinking, setIsThinking]           = useState(false)
  // Pending agent action that needs user confirmation
  const [pendingAction, setPendingAction]     = useState<AgentResponse | null>(null)

  const [toast, setToast] = useState({ visible: false, message: "", type: "success" as "success" | "error" })

  const LIMIT      = 10
  const totalPages = Math.ceil(total / LIMIT)

  // ── Paginated fetch ─────────────────────────────────────────────────────
  useEffect(() => {
    async function loadTodos() {
      setIsLoading(true)
      setError(null)
      try {
        const data: TodosResponse = await fetchTodos(page, LIMIT)
        setTodos(data.todos)
        setTotal(data.total)
      } catch (err) {
        setError("ERROR: Could not connect to the API.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadTodos()
  }, [page, retryCount])

  const filtered = todos.filter((t) => {
    if (filter === "completed") return t.completed
    if (filter === "pending")   return !t.completed
    return true
  })

  const totalDone    = todos.filter((t) => t.completed).length
  const totalPending = todos.filter((t) => !t.completed).length

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500)
  }

  function addToHistory(from: "user" | "cortana", text: string) {
    setTerminalHistory((prev) => [...prev, { id: Date.now(), from, text }])
  }

  // ── Create todo ─────────────────────────────────────────────────────────
  async function handleAdd(text: string) {
    if (!text.trim()) return
    setIsCreating(true)
    try {
      const created = await createTodo({ todo: text, completed: false, userId: 1 })
      setTodos((prev) => [created, ...prev])
      showToast("TASK ADDED TO SYSTEM", "success")
    } catch {
      showToast("ERROR: Could not create task", "error")
    } finally {
      setIsCreating(false)
    }
  }

  // ── Toggle with optimistic update ───────────────────────────────────────
  async function handleToggle(id: number) {
    const previous = todos.find((t) => t.id === id)
    if (!previous) return
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
    try {
      await updateTodo(id, { completed: !previous.completed })
      showToast(previous.completed ? "TASK REACTIVATED" : "TASK COMPLETED ✓", "success")
    } catch {
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: previous.completed } : t)))
      showToast("ERROR: Could not update task", "error")
    }
  }

  // ── Delete todo ─────────────────────────────────────────────────────────
  async function handleDeleteConfirm() {
    if (deleteTarget === null) return
    try {
      await deleteTodo(deleteTarget)
      setTodos((prev) => prev.filter((t) => t.id !== deleteTarget))
      showToast("RECORD DELETED", "success")
    } catch {
      showToast("ERROR: Could not delete task", "error")
    } finally {
      setDeleteTarget(null)
    }
  }

  // ── Execute confirmed agent action ──────────────────────────────────────
  async function executeAgentAction(action: AgentResponse) {
    const { action: type, payload } = action

    if (type === "create" && payload.todoText) {
      await handleAdd(payload.todoText)
    } else if (type === "toggle" && payload.todoId) {
      await handleToggle(payload.todoId)
    } else if (type === "delete" && payload.todoId) {
      setDeleteTarget(payload.todoId)
    } else if (type === "filter" && payload.filter) {
      setFilter(payload.filter)
    }
  }

  // ── Send command to Cortana ─────────────────────────────────────────────
  async function handleAgentCommand(userMessage: string) {
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

      // Actions that modify data need confirmation before executing
      if (agentResponse.action !== "none") {
        setPendingAction(agentResponse)
      }
    } catch {
      addToHistory("cortana", "I lost connection for a moment. Try again, Chief.")
    } finally {
      setIsThinking(false)
    }
  }

  // ── Confirm pending agent action ────────────────────────────────────────
  async function handleAgentConfirm() {
    if (!pendingAction) return
    await executeAgentAction(pendingAction)
    setPendingAction(null)
  }

  return (
    <div className="min-h-screen bg-black text-cyan-100 font-mono">

      {/* Decorative CRT scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,238,0.03) 2px, rgba(34,211,238,0.03) 4px)" }}
      />

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between border-b border-cyan-900/60 bg-black px-10 py-4">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-sm bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span className="text-lg font-bold tracking-widest text-cyan-300 uppercase">TaskFlow</span>
          <span className="text-cyan-700 text-xs">{`// v1.0`}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-cyan-600">
          <span>SYS:ONLINE</span>
          <span className="text-cyan-400 animate-pulse">●</span>
          <span>API:DUMMYJSON</span>
        </div>
      </header>

      {/* MAIN */}
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-10">

        {/* Title */}
        <div className="mb-10 border-l-2 border-cyan-400 pl-4">
          <p className="text-xs text-cyan-600 mb-1 uppercase tracking-widest">{`// task management system`}</p>
          <h1 className="text-4xl font-bold tracking-tight text-cyan-300">MY TASKS</h1>
        </div>

        {/* Cortana Terminal */}
        <div className="mb-10">
          <p className="text-xs text-cyan-600 tracking-widest mb-2 uppercase">{`// cortana interface`}</p>
          <CortanaTerminal
            onCommand={handleAgentCommand}
            isThinking={isThinking}
            history={terminalHistory}
          />
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-2">
          {[
            { label: "TOTAL",     value: todos.length,  color: "text-cyan-300"  },
            { label: "COMPLETED", value: totalDone,     color: "text-green-400" },
            { label: "PENDING",   value: totalPending,  color: "text-red-400"   },
          ].map((s) => (
            <div key={s.label} className="border border-cyan-900/50 bg-cyan-950/10 px-4 py-3 rounded-sm">
              <p className="text-xs text-cyan-600 tracking-widest mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* New task form */}
        <p className="text-xs text-cyan-600 tracking-widest mb-2 uppercase">{`// new task`}</p>
        <div className="mb-8 flex gap-2">
          <input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { handleAdd(newTodo); setNewTodo("") } }}
            placeholder="Enter task description..."
            disabled={isCreating}
            className="flex-1 border border-cyan-900/60 bg-black px-4 py-3 text-sm
              text-cyan-100 placeholder-cyan-800 outline-none rounded-sm cursor-text
              focus:border-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => { handleAdd(newTodo); setNewTodo("") }}
            disabled={isCreating || !newTodo.trim()}
            className="border border-cyan-400 bg-cyan-950/30 px-5 py-3 text-sm font-bold
              text-cyan-300 tracking-widest transition-all rounded-sm cursor-pointer
              hover:bg-cyan-400 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isCreating ? "..." : "[+] ADD"}
          </button>
        </div>

        {/* Filters */}
        <p className="text-xs text-cyan-600 tracking-widest mb-2 uppercase">{`// filter`}</p>
        <div className="mb-5 flex gap-2">
          {(["all", "completed", "pending"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs tracking-widest border transition-all rounded-sm cursor-pointer
                ${filter === f
                  ? "border-cyan-400 bg-cyan-400 text-black font-bold"
                  : "border-cyan-900/50 text-cyan-600 hover:border-cyan-600 hover:text-cyan-300"
                }`}
            >
              {f === "all" ? "ALL" : f === "completed" ? "COMPLETED" : "PENDING"}
            </button>
          ))}
        </div>

        {/* Results counter */}
        <p className="text-xs text-cyan-600 tracking-widest mb-3">
          {`// ${filtered.length} ${filtered.length === 1 ? "RECORD" : "RECORDS"} FOUND`}
        </p>

        {/* Error with retry */}
        {error && (
          <div className="mb-4 border border-red-700/60 bg-red-950/20 p-4 rounded-sm">
            <p className="text-xs text-red-400 mb-3">{error}</p>
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="border border-red-700/60 px-3 py-1.5 text-xs text-red-400
                cursor-pointer hover:bg-red-900/30 transition-all rounded-sm"
            >
              [↺ RETRY]
            </button>
          </div>
        )}

        {/* Task list / loading / empty */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="flex flex-col gap-1.5">
            {filtered.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalPages > 0 && (
          <div className="mt-8 flex items-center justify-between border-t border-cyan-900/40 pt-6">
            <span className="text-xs text-cyan-600">PAGE {page}/{totalPages} — {total} TOTAL RECORDS</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="border border-cyan-900/50 px-4 py-2 text-xs text-cyan-600 cursor-pointer
                  transition-all hover:border-cyan-500 hover:text-cyan-300 rounded-sm
                  disabled:opacity-20 disabled:cursor-not-allowed"
              >
                [← PREV]
              </button>
              <span className="border border-cyan-400 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-300">
                {page}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="border border-cyan-900/50 px-4 py-2 text-xs text-cyan-600 cursor-pointer
                  transition-all hover:border-cyan-500 hover:text-cyan-300 rounded-sm
                  disabled:opacity-20 disabled:cursor-not-allowed"
              >
                [NEXT →]
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Cortana action confirmation dialog */}
      <AlertDialog open={pendingAction !== null} onOpenChange={() => setPendingAction(null)}>
        <AlertDialogContent className="border border-cyan-700/60 bg-black font-mono">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cyan-300 tracking-widest uppercase">
              ⬡ Cortana requests confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-cyan-600 text-xs">
              Action: <span className="text-cyan-400 uppercase">{pendingAction?.action}</span>
              {pendingAction?.payload.todoText && (
                <span> — &quot;{pendingAction.payload.todoText}&quot;</span>
              )}
              {pendingAction?.payload.todoId && (
                <span> — Task #{String(pendingAction.payload.todoId).padStart(3, "0")}</span>
              )}
              {pendingAction?.payload.filter && (
                <span> — Filter: {pendingAction.payload.filter.toUpperCase()}</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                addToHistory("cortana", "Understood, Chief. Standing by.")
                setPendingAction(null)
              }}
              className="border border-cyan-800 bg-transparent text-cyan-400
                hover:bg-cyan-950 hover:text-cyan-200 font-mono text-xs cursor-pointer"
            >
              [ABORT]
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAgentConfirm}
              className="border border-cyan-500 bg-cyan-950/40 text-cyan-300
                hover:bg-cyan-900/50 hover:text-cyan-100 font-mono text-xs cursor-pointer"
            >
              [EXECUTE]
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Manual delete confirmation dialog */}
      <AlertDialog
        open={deleteTarget !== null && pendingAction === null}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent className="border border-cyan-900/60 bg-black font-mono">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cyan-300 tracking-widest uppercase">
              ⚠ Confirm deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-cyan-600 text-xs">
              This operation cannot be undone. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-cyan-800 bg-transparent text-cyan-400
              hover:bg-cyan-950 hover:text-cyan-200 font-mono text-xs cursor-pointer">
              [CANCEL]
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="border border-red-700 bg-red-950/40 text-red-400
                hover:bg-red-900/50 hover:text-red-200 font-mono text-xs cursor-pointer"
            >
              [DELETE]
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toast message={toast.message} visible={toast.visible} type={toast.type} />

    </div>
  )
}
