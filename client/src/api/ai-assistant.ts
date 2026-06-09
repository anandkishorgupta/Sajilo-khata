import { api } from "@/services/api-client"

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export type PendingAction = {
  type: string
  data: Record<string, unknown>
}

export type ChatResponse = {
  message: string
  pendingAction: PendingAction | null
}

export const sendChatMessage = (messages: ChatMessage[]) =>
  api.post<{ data: ChatResponse }>("/ai-assistant/chat", { messages })

export const confirmAction = (actionType: string, actionData: unknown) =>
  api.post("/ai-assistant/confirm", { actionType, actionData })
