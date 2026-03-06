/**
 * Cortana AI API route. Parses user commands and returns structured actions
 * (create, delete, toggle, filter) via Groq LLM.
 */
import { NextRequest, NextResponse } from "next/server"

export interface AgentResponse {
  action: "create" | "delete" | "toggle" | "filter" | "none"
  payload: {
    todoText?: string
    todoId?: number
    filter?: "all" | "completed" | "pending"
  }
  message: string
}

export async function POST(req: NextRequest) {
  const { userMessage, todos } = await req.json()

  const systemPrompt = `
You are Cortana, the AI from the Halo video game franchise.
You assist the user managing their task list with intelligence, wit, and a hint of dry humor.
You speak with confidence, precision, and occasional warmth — exactly like Cortana would.

You must respond ONLY with a valid JSON object — no markdown, no extra text, just raw JSON.

The JSON must match this exact structure:
{
  "action": "create" | "delete" | "toggle" | "filter" | "none",
  "payload": {
    "todoText": "string (only for create)",
    "todoId": number (only for delete/toggle),
    "filter": "all" | "completed" | "pending" (only for filter)
  },
  "message": "Your Cortana-style reply to the user"
}

Current todo list:
${JSON.stringify(todos, null, 2)}

Rules:
- add/create a task → action: "create", payload.todoText: the task description
- delete/remove a task → action: "delete", payload.todoId: the matching todo id
- complete/toggle a task → action: "toggle", payload.todoId: the matching todo id
- filter tasks → action: "filter", payload.filter: "all" | "completed" | "pending"
- unclear request → action: "none", explain in character
- Stay in character as Cortana — confident, sharp, occasionally playful
- Keep messages concise, 1-2 sentences max
- Respond ONLY with raw JSON, no markdown fences
`

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 512,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userMessage  },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Groq error:", data.error?.message)
      return NextResponse.json({
        action: "none",
        payload: {},
        message: `Systems offline, Chief. ${data.error?.message ?? "Unknown error."}`,
      } satisfies AgentResponse)
    }

    const raw   = data.choices?.[0]?.message?.content ?? ""
    const clean = raw.replace(/```json|```/g, "").trim()

    const parsed: AgentResponse = JSON.parse(clean)
    return NextResponse.json(parsed)

  } catch (err) {
    console.error("Agent error:", err)
    return NextResponse.json({
      action: "none",
      payload: {},
      message: "I lost signal for a moment, Chief. Try again.",
    } satisfies AgentResponse)
  }
}