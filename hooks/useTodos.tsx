import { useEffect, useState } from "react"
import { fetchTodos } from "@/lib/api"
import type { Todo, TodosResponse } from "@/types/todo"

// Return type — everything the UI needs from this hook
interface UseTodosReturn {
  todos: Todo[]
  total: number
  page: number
  totalPages: number
  isLoading: boolean
  error: string | null
  setPage: (page: number) => void
  retry: () => void
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
}

const LIMIT = 10

export function useTodos(): UseTodosReturn {
  const [todos, setTodos]         = useState<Todo[]>([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  // retryCount increments on every retry — guarantees useEffect re-runs
  // even when page hasn't changed (setPage(p => p) would NOT work)
  const [retryCount, setRetryCount] = useState(0)

  const totalPages = Math.ceil(total / LIMIT)

  useEffect(() => {
    // initial fetch + updates
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
