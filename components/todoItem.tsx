/**
 * Single todo row: checkbox, text, status badge, delete button.
 */
import { Todo } from "@/types/todo"

interface TodoItemProps {
  todo: Todo
  onToggle: (id: number, completed: boolean) => void
  onDelete: (id: number) => void
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id, !todo.completed)}
        className="w-5 h-5 rounded cursor-pointer accent-blue-500"
      />

      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${todo.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
          {todo.todo}
        </p>
        <span className="text-xs text-gray-400">User #{todo.userId}</span>
      </div>

      <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${
        todo.completed
          ? "bg-green-100 text-green-600"
          : "bg-yellow-100 text-yellow-600"
      }`}>
        {todo.completed ? "Completed" : "Pending"}
      </span>

      <button
        onClick={() => onDelete(todo.id)}
        className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
        aria-label="Delete task"
      >
        ✕
      </button>
    </div>
  )
}