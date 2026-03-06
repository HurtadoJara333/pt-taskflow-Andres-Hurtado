# Taskflow

A modern task management application with an AI-powered conversational interface. Manage your todos through a sleek, Halo-inspired Cortana terminal or traditional CRUD controls.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)

---

## Project Description

**Taskflow** is a full-stack todo application that combines classic task management with natural language control. Users can:

- **Create, update, and delete** tasks via the UI or by chatting with Cortana
- **Filter** tasks by status (all, completed, pending)
- **Paginate** through large task lists
- **Interact with an AI assistant** (Cortana) that understands commands like "add buy groceries", "complete task 5", or "show only pending tasks"

The app uses a DummyJSON-compatible API for todo data and integrates with Groq's LLM API for the conversational AI interface.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19, Tailwind CSS 4 |
| **State** | Zustand |
| **Components** | Radix UI, shadcn/ui |
| **AI** | Groq API (Llama 3.3 70B) |

---

## Installation

### Prerequisites

- **Node.js** 18+ 
- **pnpm** (recommended) or npm/yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/HurtadoJara333/pt-taskflow-Andres-Hurtado
   cd taskflow
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the project root:

   ```env
   # Todo API base URL (DummyJSON-compatible)
   NEXT_PUBLIC_API_BASE_URL=https://dummyjson.com

   # Groq API key (required for Cortana AI chat)
   GROQ_API_KEY=your_groq_api_key_here
   ```

   - Get a Groq API key at [console.groq.com](https://console.groq.com)
   - `NEXT_PUBLIC_API_BASE_URL` defaults to DummyJSON if omitted; use your own API URL for production

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

### Basic Operations

- **Add a task**: Type in the input field and press Enter, or click the add button
- **Toggle completion**: Click the checkbox next to a task
- **Delete a task**: Click the `[DEL]` button on a task row
- **Filter tasks**: Use the filter buttons (All / Completed / Pending)
- **Paginate**: Use the pagination controls when more than 10 tasks exist

### Cortana AI Terminal

Use natural language to control your tasks:

| Command example | Action |
|-----------------|--------|
| "Add buy milk" | Creates a new task |
| "Complete task 5" | Toggles task with id 5 |
| "Delete task 3" | Removes task with id 3 |
| "Show only pending" | Filters to pending tasks |
| "Show all tasks" | Clears filter |

---

## Folder Structure

```
taskflow/
├── app/
│   ├── api/
│   │   └── agent/
│   │       └── route.tsx      # Cortana AI API route (Groq)
│   ├── layout.tsx
│   └── page.tsx               # Main todo UI
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   │   ├── alert-dialog.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   └── input.tsx
│   ├── loading-skeleton.tsx
│   └── todo-item.tsx
├── hooks/
│   ├── useTodos.tsx           # Fetch & paginate todos
│   └── useTodoMutations.tsx
├── lib/
│   ├── api.ts                 # Todo API client
│   └── utils.ts
├── store/
│   └── todoStore.ts           # Zustand store
├── types/
│   └── todo.ts                # Todo interfaces
├── .env.local                 # Environment variables (create this)
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Run production server |
| `pnpm lint` | Run ESLint |

---

## License

Private project.
