import { useEffect } from "react"
import { fetchTodos } from "@/lib/api"
import { useTodoStore } from "@/store/todoStore"

export function useTodos() {
  // subscription
  const currentPage = useTodoStore((state) => state.currentPage)
  const setTodos    = useTodoStore((state) => state.setTodos)
  const setLoading  = useTodoStore((state) => state.setLoading)
  const setError    = useTodoStore((state) => state.setError)

  useEffect(() => {
    // initial fetch + updates
    async function loadTodos() {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchTodos(currentPage)
        setTodos(data.todos, data.total)
      } catch (err) {
        setError("Could not load tasks. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadTodos()
  }, [currentPage])
  // Expose what components need
  const todos       = useTodoStore((state) => state.todos)
  const total       = useTodoStore((state) => state.total)
  const isLoading   = useTodoStore((state) => state.isLoading)
  const error       = useTodoStore((state) => state.error)
  const filter      = useTodoStore((state) => state.filter)
  const setPage     = useTodoStore((state) => state.setPage)
  const setFilter   = useTodoStore((state) => state.setFilter)

  // Local filtering — no extra API calls
  const filteredTodos = todos.filter((todo) => {
    if (filter === "completed") return todo.completed
    if (filter === "pending")   return !todo.completed
    return true // filter === "all"
  })

  const totalPages = Math.ceil(total / 10)

  return {
    todos: filteredTodos,
    isLoading,
    error,
    currentPage,
    totalPages,
    filter,
    setPage,
    setFilter,
  }
}