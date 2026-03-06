"use client"

import { useEffect, useState } from "react"
import { fetchTodos } from "@/lib/api"
import type { Todo, TodosResponse } from "@/types/todo"

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
function EmptyState() {
  return (
    <div className="border border-dashed border-cyan-800/50 py-16 text-center rounded-sm">
      <p className="text-4xl mb-4 text-cyan-600">◈</p>
      <h3 className="text-base font-bold text-cyan-300 mb-2 tracking-widest">
        EMPTY SYSTEM
      </h3>
      <p className="text-xs text-cyan-600 font-mono">No tasks in the system.</p>
    </div>
  )
}

// ─── TodoItem ──────────────────────────────────────────────────────────────
function TodoItem({ todo }: { todo: Todo }) {
  return (
    <div className="flex items-center gap-3 border border-cyan-900/40 bg-black p-4 rounded-sm
      transition-all hover:border-cyan-400/60 hover:bg-cyan-950/20">

      {/* Status indicator */}
      <div className={`h-2 w-2 rounded-sm shrink-0
        ${todo.completed ? "bg-cyan-400" : "bg-cyan-900"}`}
      />

      {/* Text */}
      <span className={`flex-1 text-sm font-mono
        ${todo.completed ? "line-through text-cyan-800" : "text-cyan-100"}`}>
        {todo.todo}
      </span>

      {/* ID */}
      <span className="shrink-0 font-mono text-xs text-cyan-600">
        #{String(todo.id).padStart(3, "0")}
      </span>

      {/* Status badge */}
      <span className={`shrink-0 px-2 py-0.5 text-xs font-mono rounded-sm border
        ${todo.completed
          ? "border-cyan-700 text-cyan-500"
          : "border-cyan-900/50 text-cyan-700"
        }`}>
        {todo.completed ? "DONE" : "PENDING"}
      </span>
    </div>
  )
}

// ─── PAGE ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [todos, setTodos]   = useState<Todo[]>([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const LIMIT      = 10
  const totalPages = Math.ceil(total / LIMIT)

  // ── Fetch from API ───────────────────────────────────────────────────────
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
  }, [page])

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
          <span className="text-lg font-bold tracking-widest text-cyan-300 uppercase">
            TaskFlow
          </span>
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
          <h1 className="text-4xl font-bold tracking-tight text-cyan-300">
            MY TASKS
          </h1>
        </div>

        {/* Counter */}
        <p className="text-xs text-cyan-600 tracking-widest mb-3">
          // {total} TOTAL RECORDS
        </p>

        {/* Error with retry button */}
        {error && (
          <div className="mb-4 border border-red-700/60 bg-red-950/20 p-4 rounded-sm">
            <p className="text-xs text-red-400 mb-3">{error}</p>
            <button
              onClick={() => setPage((p) => p)}
              className="border border-red-700/60 px-3 py-1.5 text-xs text-red-400
                hover:bg-red-900/30 transition-all rounded-sm"
            >
              [↺ RETRY]
            </button>
          </div>
        )}

        {/* List / Loading / Empty */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : todos.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-1.5">
            {todos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalPages > 0 && (
          <div className="mt-8 flex items-center justify-between border-t border-cyan-900/40 pt-6">
            <span className="text-xs text-cyan-600">
              PG {page}/{totalPages} — {total} RECORDS
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border border-cyan-900/50 px-4 py-2 text-xs text-cyan-600
                  transition-all hover:border-cyan-500 hover:text-cyan-300 rounded-sm
                  disabled:opacity-20 disabled:cursor-not-allowed"
              >
                [← PREV]
              </button>
              <span className="border border-cyan-400 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-300">
                {page}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border border-cyan-900/50 px-4 py-2 text-xs text-cyan-600
                  transition-all hover:border-cyan-500 hover:text-cyan-300 rounded-sm
                  disabled:opacity-20 disabled:cursor-not-allowed"
              >
                [NEXT →]
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
