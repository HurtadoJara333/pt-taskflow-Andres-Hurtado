/**
 * Zustand store for todo list. Single source of truth; no Provider needed.
 */
import { create } from "zustand"
import type { Todo } from "@/types/todo"

interface TodoStore {
  todos: Todo[]
  total: number

  setTodos: (todos: Todo[]) => void
  setTotal: (total: number) => void
  addTodo: (todo: Todo) => void
  updateTodo: (id: number, changes: Partial<Todo>) => void
  removeTodo: (id: number) => void
}

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  total: 0,

  setTodos: (todos) => set({ todos }),
  setTotal: (total) => set({ total }),
  addTodo: (todo) => set((state) => ({ todos: [todo, ...state.todos] })),
  updateTodo: (id, changes) =>
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, ...changes } : t)),
    })),

  removeTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    })),
}))
