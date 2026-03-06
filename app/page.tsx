"use client"

import { useState } from "react"
import { useTodos } from "@/hooks/useTodos"
import { useTodoMutations } from "@/hooks/useTodoMutations"
import type { Todo } from "@/types/todo"
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

// Local filter type — no extra API calls needed
type Filter = "all" | "completed" | "pending"

// ─── LoadingSkeleton ───────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 border border-cyan-900/50 bg-cyan-950/10 p-4 rounded-sm"
        >
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
function Toast({
  message,
  visible,
  type,
}: {
  message: string
  visible: boolean
  type: "success" | "error"
}) {
  return (
    <div
      className={`fixed bottom-8 right-8 z-50 flex items-center gap-3
        border bg-black px-5 py-3 font-mono text-xs
        transition-all duration-300 rounded-sm
        ${type === "success" ? "border-cyan-500/70 text-cyan-300" : "border-red-500/70 text-red-400"}
        ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
    >
      <span>{type === "success" ? "▶" : "✕"}</span>
      {message}
    </div>
  )
}

// ─── TodoItem ──────────────────────────────────────────────────────────────
function TodoItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}) {
  return (
    <div
      className={`flex items-center gap-3 border border-cyan-900/40 bg-black p-4 rounded-sm
        transition-all hover:border-cyan-400/60 hover:bg-cyan-950/20
        ${todo.completed ? "opacity-50" : ""}`}
    >
      {/* Checkbox triggers optimistic update */}
      <button
        onClick={() => onToggle(todo.id)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2
          cursor-pointer transition-all
          ${todo.completed
            ? "border-cyan-400 bg-cyan-400"
            : "border-cyan-700 hover:border-cyan-400"
          }`}
      >
        {todo.completed && <span className="text-xs font-bold text-black">✓</span>}
      </button>

      <span
        className={`flex-1 text-sm font-mono select-none
          ${todo.completed ? "line-through text-cyan-800" : "text-cyan-100"}`}
      >
        {todo.todo}
      </span>

      <span className="shrink-0 font-mono text-xs text-cyan-600">
        #{String(todo.id).padStart(3, "0")}
      </span>

      <span
        className={`shrink-0 px-2 py-0.5 text-xs font-mono rounded-sm border
          ${todo.completed ? "border-cyan-700 text-cyan-500" : "border-cyan-900/50 text-cyan-700"}`}
      >
        {todo.completed ? "DONE" : "PENDING"}
      </span>

      {/* Delete button — opens confirm dialog */}
      <button
        onClick={() => onDelete(todo.id)}
        className="shrink-0 border border-transparent px-2 py-1 text-xs font-mono
          text-cyan-600 cursor-pointer transition-all rounded-sm
          hover:border-red-500/60 hover:text-red-400"
      >
        [DEL]
      </button>
    </div>
  )
}

// ─── PAGE ──────────────────────────────────────────────────────────────────
// This component only handles UI state (filter, input, dialog, toast).
// All fetching and mutation logic lives in the custom hooks.
export default function Home() {
  // UI state — belongs in the component
  const [filter, setFilter]             = useState<Filter>("all")
  const [newTodo, setNewTodo]           = useState("")
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [toast, setToast]               = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error",
  })

  // Toast helper — shared between both hooks
  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500)
  }

  // Fetching logic — lives in useTodos
  const { todos, total, page, totalPages, isLoading, error, setPage, retry, setTodos } =
    useTodos()

  // Mutation logic — lives in useTodoMutations
  const { isCreating, handleAdd, handleToggle, handleDeleteConfirm } = useTodoMutations({
    todos,
    setTodos,
    showToast,
  })

  // Local filter — derived from current todos, no API call needed
  const filtered = todos.filter((t) => {
    if (filter === "completed") return t.completed
    if (filter === "pending")   return !t.completed
    return true
  })

  const totalDone    = todos.filter((t) => t.completed).length
  const totalPending = todos.filter((t) => !t.completed).length

  return (
    <div className="min-h-screen bg-black text-cyan-100 font-mono">

      {/* Decorative scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,238,0.03) 2px, rgba(34,211,238,0.03) 4px)",
        }}
      />

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between border-b border-cyan-900/60 bg-black px-10 py-4">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-sm bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span className="text-lg font-bold tracking-widest text-cyan-300 uppercase">TaskFlow</span>
          <span className="text-cyan-700 text-xs">// v1.0</span>
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
          <p className="text-xs text-cyan-600 mb-1 uppercase tracking-widest">
            // task management system
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-cyan-300">MY TASKS</h1>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-2">
          {[
            { label: "TOTAL",     value: todos.length,  color: "text-cyan-300"  },
            { label: "COMPLETED", value: totalDone,     color: "text-green-400" },
            { label: "PENDING",   value: totalPending,  color: "text-red-400"   },
          ].map((s) => (
            <div
              key={s.label}
              className="border border-cyan-900/50 bg-cyan-950/10 px-4 py-3 rounded-sm"
            >
              <p className="text-xs text-cyan-600 tracking-widest mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* New task form */}
        <p className="text-xs text-cyan-600 tracking-widest mb-2 uppercase">// new task</p>
        <div className="mb-8 flex gap-2">
          <input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAdd(newTodo).then(() => setNewTodo(""))
              }
            }}
            placeholder="Enter task description..."
            disabled={isCreating}
            className="flex-1 border border-cyan-900/60 bg-black px-4 py-3 text-sm
              text-cyan-100 placeholder-cyan-800 outline-none rounded-sm cursor-text
              focus:border-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => handleAdd(newTodo).then(() => setNewTodo(""))}
            disabled={isCreating || !newTodo.trim()}
            className="border border-cyan-400 bg-cyan-950/30 px-5 py-3 text-sm font-bold
              text-cyan-300 tracking-widest transition-all rounded-sm cursor-pointer
              hover:bg-cyan-400 hover:text-black
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isCreating ? "..." : "[+] ADD"}
          </button>
        </div>

        {/* Local filters */}
        <p className="text-xs text-cyan-600 tracking-widest mb-2 uppercase">// filter</p>
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
          // {filtered.length} {filtered.length === 1 ? "RECORD" : "RECORDS"} FOUND
        </p>

        {/* Error with retry */}
        {error && (
          <div className="mb-4 border border-red-700/60 bg-red-950/20 p-4 rounded-sm">
            <p className="text-xs text-red-400 mb-3">{error}</p>
            <button
              onClick={retry}
              className="border border-red-700/60 px-3 py-1.5 text-xs text-red-400
                cursor-pointer hover:bg-red-900/30 transition-all rounded-sm"
            >
              [↺ RETRY]
            </button>
          </div>
        )}

        {/* Task list / loading skeleton / empty state */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="flex flex-col gap-1.5">
            {filtered.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalPages > 0 && (
          <div className="mt-8 flex items-center justify-between border-t border-cyan-900/40 pt-6">
            <span className="text-xs text-cyan-600">
              PAGE {page}/{totalPages} — {total} TOTAL RECORDS
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="border border-cyan-900/50 px-4 py-2 text-xs text-cyan-600
                  cursor-pointer transition-all hover:border-cyan-500 hover:text-cyan-300 rounded-sm
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
                className="border border-cyan-900/50 px-4 py-2 text-xs text-cyan-600
                  cursor-pointer transition-all hover:border-cyan-500 hover:text-cyan-300 rounded-sm
                  disabled:opacity-20 disabled:cursor-not-allowed"
              >
                [NEXT →]
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Shadcn confirm dialog — opens when deleteTarget has an id */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
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
              onClick={() => deleteTarget !== null && handleDeleteConfirm(deleteTarget).then(() => setDeleteTarget(null))}
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
