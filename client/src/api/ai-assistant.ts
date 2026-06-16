import { api } from "@/services/api-client"

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

export const sendChatMessage = (messages: ChatMessage[], conversationId?: number) =>
  api.post<{ data: ChatResponse }>("/ai-assistant/chat", { messages, conversationId })

export const confirmAction = (actionType: string, actionData: unknown) =>
  api.post("/ai-assistant/confirm", { actionType, actionData })

export const getConversations = () =>
  api.get<{ data: Conversation[] }>("/ai-assistant/conversations")

export const getConversation = (id: number) =>
  api.get<{ data: Conversation }>(`/ai-assistant/conversations/${id}`)

export const deleteConversation = (id: number) =>
  api.delete(`/ai-assistant/conversations/${id}`)
