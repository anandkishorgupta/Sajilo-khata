import { useState, useRef, useEffect, useCallback } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type {
  ChatMessage,
  ChartData,
  PendingAction,
  Conversation,
} from "@/api/ai-assistant"
import {
  sendChatMessageStream,
  confirmAction,
  getConversations,
  getConversation,
  deleteConversation,
} from "@/api/ai-assistant"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Bot,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  MessageSquare,
  BarChart3,
  ShoppingCart,
  TrendingUp,
  PieChart,
  Plus,
  History,
  Trash2,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import toast from "react-hot-toast"
import AiChartRenderer from "@/components/shared/AiChartRenderer"

const SUGGESTIONS = [
  {
    icon: BarChart3,
    text: "What are today's total sales?",
  },
  {
    icon: ShoppingCart,
    text: "Which products are low on stock?",
  },
  {
    icon: MessageSquare,
    text: "How do I add a new product?",
  },
  {
    icon: Sparkles,
    text: "Sold 2kg rice and 1L oil to Ram",
  },
  {
    icon: TrendingUp,
    text: "Show me a sales trend for the last 7 days",
  },
  {
    icon: PieChart,
    text: "Which products are the most profitable? Show them in a pie chart.",
  },
]

type UIMessage = {
  role: "user" | "assistant"
  content: string
  pendingAction?: PendingAction | null
  actionStatus?: "pending" | "confirmed" | "cancelled"
  options?: string[] | null
  chart?: ChartData | null
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<number | undefined>()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  // Load conversation list on mount
  const loadConversations = useCallback(async () => {
    try {
      const res = await getConversations()
      const data = res.data?.data ?? res.data
      setConversations(Array.isArray(data) ? data : [])
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const handleNewChat = () => {
    setMessages([])
    setConversationId(undefined)
  }

  const handleLoadConversation = async (id: number) => {
    setLoadingHistory(true)
    try {
      const res = await getConversation(id)
      const data = res.data?.data ?? res.data
      if (data && data.messages) {
        setMessages(
          data.messages.map((m: any) => ({
            role: m.role,
            content: m.content,
            chart: m.chart || null,
            pendingAction: m.pendingAction || null,
            actionStatus: m.pendingAction ? ("confirmed" as const) : undefined,
            options: null, // don't show option buttons for past conversations
          })),
        )
        setConversationId(data.id)
      }
    } catch {
      toast.error("Failed to load conversation")
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleDeleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteConversation(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (conversationId === id) {
        handleNewChat()
      }
      toast.success("Conversation deleted")
    } catch {
      toast.error("Failed to delete conversation")
    }
  }

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || loading) return

    const userMessage: UIMessage = { role: "user", content: messageText }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setLoading(true)

    try {
      const apiMessages: ChatMessage[] = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      let assistantContent = ""
      let doneConversationId: number | undefined
      let doneChart: ChartData | null = null

      // Add empty assistant message placeholder
      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      for await (const event of sendChatMessageStream(apiMessages, conversationId)) {
        if (event.type === "text") {
          assistantContent += event.text
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: "assistant",
              content: assistantContent,
            }
            return updated
          })
        } else if (event.type === "done") {
          doneConversationId = event.conversationId
          doneChart = event.chart
        } else if (event.type === "error") {
          throw new Error(event.message)
        }
      }

      // Finalize with chart data if present
      if (doneChart) {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantContent,
            chart: doneChart,
          }
          return updated
        })
      }

      if (doneConversationId) {
        setConversationId(doneConversationId)
      }

      loadConversations()
    } catch {
      toast.error("Failed to get AI response")
      setMessages((prev) => {
        // Remove empty placeholder if present
        const filtered = prev.filter(
          (m) => !(m.role === "assistant" && m.content === ""),
        )
        return [
          ...filtered,
          {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
          },
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmAction = async (messageIndex: number) => {
    const msg = messages[messageIndex]
    if (!msg.pendingAction) return

    setMessages((prev) =>
      prev.map((m, i) =>
        i === messageIndex ? { ...m, actionStatus: "confirmed" as const } : m,
      ),
    )

    try {
      await confirmAction(msg.pendingAction.type, msg.pendingAction.data)
      toast.success("Action completed successfully!")

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Done! The transaction has been recorded successfully.",
        },
      ])
    } catch {
      toast.error("Failed to execute action")
      setMessages((prev) =>
        prev.map((m, i) =>
          i === messageIndex ? { ...m, actionStatus: "pending" as const } : m,
        ),
      )
    }
  }

  const handleCancelAction = (messageIndex: number) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === messageIndex ? { ...m, actionStatus: "cancelled" as const } : m,
      ),
    )
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Cancelled. No changes were made.",
      },
    ])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatActionSummary = (action: PendingAction): string => {
    const data = action.data as Record<string, any>
    switch (action.type) {
      case "CREATE_SALE": {
        const items = data.items as { productId: number; quantity: number; unitPrice: number }[]
        const total = items.reduce(
          (sum: number, i: { quantity: number; unitPrice: number }) => sum + i.quantity * i.unitPrice,
          0,
        )
        return `Sale: ${items.length} item(s) — Total: Rs ${total}`
      }
      case "CREATE_PURCHASE": {
        const items = data.items as { productId: number; quantity: number; unitPrice: number }[]
        const total = items.reduce(
          (sum: number, i: { quantity: number; unitPrice: number }) => sum + i.quantity * i.unitPrice,
          0,
        )
        return `Purchase: ${items.length} item(s) — Total: Rs ${total}`
      }
      case "CREATE_EXPENSE":
        return `Expense: ${data.title} — Rs ${data.amount}`
      default:
        return `Action: ${action.type}`
    }
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-4">
      {/* Sidebar — Conversation History */}
      {sidebarOpen && (
        <div className="flex w-72 shrink-0 flex-col rounded-2xl border bg-card">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between border-b p-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Chat History</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={handleNewChat}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                title="New chat"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                title="Close sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.length === 0 ? (
              <p className="p-3 text-center text-xs text-muted-foreground">
                No previous chats
              </p>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleLoadConversation(conv.id)}
                    className={`group flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                      conversationId === conv.id
                        ? "bg-accent font-medium"
                        : ""
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{conv.title}</span>
                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      className="hidden shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:block"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Open sidebar"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Ask questions, get insights, or record transactions
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            New Chat
          </Button>
        </div>

        {/* Loading overlay when loading history */}
        {loadingHistory ? (
          <Card className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </Card>
        ) : (
        /* Messages Area */
        <Card className="flex-1 overflow-hidden">
        <CardContent className="flex h-full flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              /* Empty state with suggestions */
              <div className="flex h-full flex-col items-center justify-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-semibold">
                    How can I help you today?
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ask about your business data, app features, or record
                    transactions
                  </p>
                </div>
                <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.text}
                      onClick={() => handleSend(s.text)}
                      className="flex items-center gap-2 rounded-xl border bg-card p-3 text-left text-sm transition-colors hover:bg-accent"
                    >
                      <s.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Chat messages */
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="mb-1 flex items-center gap-1.5">
                          <Bot className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">
                            AI Assistant
                          </span>
                        </div>
                      )}
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-table:border-collapse prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-1.5 prose-th:bg-muted prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-1.5">
                        {msg.role === "assistant" ? (
                          <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                        ) : (
                          <span className="whitespace-pre-wrap">{msg.content}</span>
                        )}
                      </div>

                      {/* Chart visualization */}
                      {msg.chart && (
                        <div className="mt-2 rounded-xl border bg-background p-3">
                          <AiChartRenderer chart={msg.chart} />
                        </div>
                      )}

                      {/* Action confirmation UI */}
                      {msg.pendingAction &&
                        msg.actionStatus === "pending" && (
                          <div className="mt-3 rounded-xl border bg-background p-3">
                            <p className="mb-2 text-xs font-medium text-muted-foreground">
                              Pending Action
                            </p>
                            <p className="mb-3 text-sm font-medium">
                              {formatActionSummary(msg.pendingAction)}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleConfirmAction(i)}
                                className="gap-1.5"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelAction(i)}
                                className="gap-1.5"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                      {msg.actionStatus === "confirmed" && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Action confirmed
                        </div>
                      )}

                      {msg.actionStatus === "cancelled" && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <XCircle className="h-3.5 w-3.5" />
                          Action cancelled
                        </div>
                      )}

                      {/* Option buttons for clarification */}
                      {msg.options && msg.options.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.options.map((option) => (
                            <button
                              key={option}
                              onClick={() => {
                                // Clear options from this message
                                setMessages((prev) =>
                                  prev.map((m, idx) =>
                                    idx === i ? { ...m, options: null } : m,
                                  ),
                                )
                                handleSend(option)
                              }}
                              className="rounded-lg border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
                      <Bot className="h-3.5 w-3.5" />
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t p-4">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                size="icon"
                className="h-11 w-11 shrink-0 rounded-xl"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
        )}
      </div>
    </div>
  )
}
