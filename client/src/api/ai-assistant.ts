import { api } from "@/services/api-client"
import { store } from "@/store/store"

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export type PendingAction = {
  type: string
  data: Record<string, unknown>
}

export type ChartData = {
  type: "bar" | "line" | "pie"
  title: string
  xKey?: string
  yKey?: string
  yLabel?: string
  nameKey?: string
  valueKey?: string
  data: Record<string, unknown>[]
}

export type ChatResponse = {
  message: string
  pendingAction: PendingAction | null
  options: string[] | null
  chart: ChartData | null
  conversationId: number
}

export type Conversation = {
  id: number
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export type StreamEvent =
  | { type: "text"; text: string }
  | { type: "done"; conversationId: number; chart: ChartData | null }
  | { type: "error"; message: string }

export const sendChatMessage = (messages: ChatMessage[], conversationId?: number) =>
  api.post<{ data: ChatResponse }>("/ai-assistant/chat", { messages, conversationId })

export async function* sendChatMessageStream(
  messages: ChatMessage[],
  conversationId?: number,
): AsyncGenerator<StreamEvent> {
  const token = store.getState().auth.token
  const baseUrl = import.meta.env.VITE_API_URL

  const response = await fetch(`${baseUrl}/ai-assistant/chat-stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages, conversationId }),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop()!

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith("data: ")) {
          yield JSON.parse(trimmed.slice(6)) as StreamEvent
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim().startsWith("data: ")) {
      yield JSON.parse(buffer.trim().slice(6)) as StreamEvent
    }
  } finally {
    reader.releaseLock()
  }
}

export const confirmAction = (actionType: string, actionData: unknown) =>
  api.post("/ai-assistant/confirm", { actionType, actionData })

export const getConversations = () =>
  api.get<{ data: Conversation[] }>("/ai-assistant/conversations")

export const getConversation = (id: number) =>
  api.get<{ data: Conversation }>(`/ai-assistant/conversations/${id}`)

export const deleteConversation = (id: number) =>
  api.delete(`/ai-assistant/conversations/${id}`)
