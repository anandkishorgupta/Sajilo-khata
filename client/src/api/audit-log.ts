import { api } from "@/services/api-client"

export interface AuditLogEntry {
  id: number
  shopId: number
  userId: number | null
  userName: string | null
  userRole: string | null
  action: string
  entityType: string
  entityId: number | null
  description: string | null
  oldValues: Record<string, any> | null
  newValues: Record<string, any> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export interface AuditLogFilters {
  page?: number
  limit?: number
  entityType?: string
  action?: string
  userId?: number
  fromDate?: string
  toDate?: string
  search?: string
}

export interface AuditLogResponse {
  data: AuditLogEntry[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AuditLogStats {
  total: number
  todayCount: number
  weekCount: number
  byEntity: { entityType: string; count: number }[]
  byUser: { userName: string; userRole: string; count: number }[]
}

export async function getAuditLogs(filters?: AuditLogFilters): Promise<AuditLogResponse> {
  const params = new URLSearchParams()
  if (filters?.page) params.set("page", String(filters.page))
  if (filters?.limit) params.set("limit", String(filters.limit))
  if (filters?.entityType) params.set("entityType", filters.entityType)
  if (filters?.action) params.set("action", filters.action)
  if (filters?.userId) params.set("userId", String(filters.userId))
  if (filters?.fromDate) params.set("fromDate", filters.fromDate)
  if (filters?.toDate) params.set("toDate", filters.toDate)
  if (filters?.search) params.set("search", filters.search)

  const res = await api.get(`/audit-log?${params.toString()}`)
  return {
    data: res.data.data ?? [],
    total: res.data.meta?.total ?? 0,
    page: res.data.meta?.page ?? 1,
    limit: res.data.meta?.limit ?? 15,
    totalPages: res.data.meta?.totalPages ?? 0,
  }
}

export async function getAuditLogStats(): Promise<AuditLogStats> {
  const res = await api.get("/audit-log/stats")
  return res.data.data
}
