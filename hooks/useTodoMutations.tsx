/**
 * CRUD mutations for todos. Requires setTodos from useTodos for shared state.
 */
import { useState } from "react"
import { createTodo, updateTodo, deleteTodo } from "@/lib/api"
import type { Todo } from "@/types/todo"

interface UseTodoMutationsProps {
  todos: Todo[]
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
  showToast: (message: string, type: "success" | "error") => void
}

interface UseTodoMutationsReturn {
  isCreating: boolean
  handleAdd: (text: string) => Promise<void>
  handleToggle: (id: number) => Promise<void>
  handleDeleteConfirm: (id: number) => Promise<void>
}

export function useTodoMutations({
  todos,
  setTodos,
  showToast,
}: UseTodoMutationsProps): UseTodoMutationsReturn {
  const [isCreating, setIsCreating] = useState(false)

  async function handleAdd(text: string): Promise<void> {
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

  async function handleToggle(id: number): Promise<void> {
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

  async function handleDeleteConfirm(id: number): Promise<void> {
    try {
      await deleteTodo(id)
      setTodos((prev) => prev.filter((t) => t.id !== id))
      showToast("RECORD DELETED", "success")
    } catch {
      showToast("ERROR: Could not delete task", "error")
    }
  }

  return {
    isCreating,
    handleAdd,
    handleToggle,
    handleDeleteConfirm,
  }
}
