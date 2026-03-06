"use client"

import { useEffect, useState } from "react"
import { fetchTodos, createTodo, updateTodo, deleteTodo } from "@/lib/api"
import type { Todo, TodosResponse } from "@/types/todo"
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
      <h3 className="text-base font-bold text-cyan-300 mb-2 tracking-widest">EMPTY SYSTEM</h3>
      <p className="text-xs text-cyan-600 font-mono">No tasks in the system.</p>
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
// Receives onToggle to change completed state
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
      {/* Checkbox with optimistic update */}
      <button
        onClick={() => onToggle(todo.id)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 transition-all
          ${todo.completed
            ? "border-cyan-400 bg-cyan-400"
            : "border-cyan-700 hover:border-cyan-400"
          }`}
      >
        {todo.completed && <span className="text-xs font-bold text-black">✓</span>}
      </button>

      <span
        className={`flex-1 text-sm font-mono
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

      {/* Delete button — opens ConfirmDialog */}
      <button
        onClick={() => onDelete(todo.id)}
        className="shrink-0 border border-transparent px-2 py-1 text-xs font-mono text-cyan-600
          transition-all hover:border-red-500/60 hover:text-red-400 rounded-sm"
      >
        [DEL]
      </button>
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

  // deleteTarget stores the id of the task the user wants to delete.
  // If null, dialog is closed. If a number, dialog is open.
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error",
  })

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
  }, [page])

  // ── Helper toast ────────────────────────────────────────────────────────
  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500)
  }

  // ── Create task ──────────────────────────────────────────────────────────
  async function handleAdd() {
    const text = newTodo.trim()
    if (!text) return
    setIsCreating(true)
    try {
      const created = await createTodo({ todo: text, completed: false, userId: 1 })
      setTodos((prev) => [created, ...prev])
      setNewTodo("")
      showToast("TASK ADDED TO SYSTEM", "success")
    } catch {
      showToast("ERROR: Could not create task", "error")
    } finally {
      setIsCreating(false)
    }
  }

  // ── Toggle with optimistic update ────────────────────────────────────────
  async function handleToggle(id: number) {
    const previous = todos.find((t) => t.id === id)
    if (!previous) return

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )

    try {
      await updateTodo(id, { completed: !previous.completed })
      showToast(previous.completed ? "TASK REACTIVATED" : "TASK COMPLETED ✓", "success")
    } catch {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: previous.completed } : t))
      )
      showToast("ERROR: Could not update task", "error")
    }
  }

  // ── Delete task ──────────────────────────────────────────────────────────
  // We only remove from local state when the API confirms.
  // Unlike toggle, we do NOT use optimistic update here because
  // delete is a destructive action — better to wait for confirmation.
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

        {/* New task form */}
        <p className="text-xs text-cyan-600 tracking-widest mb-2 uppercase">// new task</p>
        <div className="mb-8 flex gap-2">
          <input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Enter task description..."
            disabled={isCreating}
            className="flex-1 border border-cyan-900/60 bg-black px-4 py-3 text-sm
              text-cyan-100 placeholder-cyan-800 outline-none rounded-sm
              focus:border-cyan-400 transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleAdd}
            disabled={isCreating || !newTodo.trim()}
            className="border border-cyan-400 bg-cyan-950/30 px-5 py-3 text-sm font-bold
              text-cyan-300 tracking-widest transition-all rounded-sm
              hover:bg-cyan-400 hover:text-black
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isCreating ? "..." : "[+] ADD"}
          </button>
        </div>

        {/* Counter */}
        <p className="text-xs text-cyan-600 tracking-widest mb-3">
          // {total} TOTAL RECORDS
        </p>

        {/* Error with retry */}
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

      {/* ConfirmDialog from shadcn/ui
          Opens when deleteTarget has an id (not null)
          Closes when deleteTarget is set back to null */}
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
              hover:bg-cyan-950 hover:text-cyan-200 font-mono text-xs">
              [CANCEL]
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="border border-red-700 bg-red-950/40 text-red-400
                hover:bg-red-900/50 hover:text-red-200 font-mono text-xs"
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
