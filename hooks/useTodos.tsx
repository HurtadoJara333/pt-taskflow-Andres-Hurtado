/**
 * Fetches todos from API, syncs to Zustand store, handles pagination and retry.
 */
import { useEffect, useState } from "react"
import { fetchTodos } from "@/lib/api"
import { useTodoStore } from "@/store/todoStore"
import type { Todo, TodosResponse } from "@/types/todo"

interface UseTodosReturn {
  todos: Todo[]
  total: number
  page: number
  totalPages: number
  isLoading: boolean
  error: string | null
  setPage: (page: number) => void
  retry: () => void
  setTodos: (todos: Todo[]) => void
}

const LIMIT = 10

export function useTodos(): UseTodosReturn {
  const todos    = useTodoStore((state) => state.todos)
  const setTodos = useTodoStore((state) => state.setTodos)
  const setTotal = useTodoStore((state) => state.setTotal)
  const total    = useTodoStore((state) => state.total)

  const [page, setPage]             = useState(1)
  const [isLoading, setIsLoading]   = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const totalPages = Math.ceil(total / LIMIT)

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
  }, [page, retryCount, setTodos, setTotal])

  return {
    todos,
    total,
    page,
    totalPages,
    isLoading,
    error,
    setPage,
    retry: () => setRetryCount((c) => c + 1),
    setTodos,
  }
}
