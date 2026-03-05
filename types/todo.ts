export interface Todo {
    id: number;
    todo: string;
    completed: boolean;
    userId: number;
  }
  
  export interface TodosResponse {
    todos: Todo[];
    total: number;
    skip: number;
    limit: number;
  }
  
  export interface CreateTodoPayload {
    todo: string;
    completed: boolean;
    userId: number;
  }
  
  export interface UpdateTodoPayload {
    todo?: string;
    completed?: boolean;
  }
  
  export interface DeleteTodoResponse {
    id: number;
    todo: string;
    completed: boolean;
    userId: number;
    isDeleted: boolean;
    deletedOn: string;
  }