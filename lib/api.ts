import {
    Todo,
    TodosResponse,
    CreateTodoPayload,
    UpdateTodoPayload,
    DeleteTodoResponse,
  } from "@/types/todo";
  
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  // Wrapper genérico para manejar errores de red y de la API de forma uniforme
  async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
  
    return res.json() as Promise<T>;
  }
  
  // GET /todos?limit=10&skip=0
  export function fetchTodos(page: number, limit = 10): Promise<TodosResponse> {
    const skip = (page - 1) * limit;
    return apiFetch<TodosResponse>(`/todos?limit=${limit}&skip=${skip}`);
  }
  
  // GET /todos/{id}
  export function fetchTodoById(id: number): Promise<Todo> {
    return apiFetch<Todo>(`/todos/${id}`);
  }
  
  // POST /todos/add
  export function createTodo(payload: CreateTodoPayload): Promise<Todo> {
    return apiFetch<Todo>("/todos/add", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  
  // PATCH /todos/{id}
  export function updateTodo(
    id: number,
    payload: UpdateTodoPayload
  ): Promise<Todo> {
    return apiFetch<Todo>(`/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }
  
  // DELETE /todos/{id}
  export function deleteTodo(id: number): Promise<DeleteTodoResponse> {
    return apiFetch<DeleteTodoResponse>(`/todos/${id}`, {
      method: "DELETE",
    });
  }