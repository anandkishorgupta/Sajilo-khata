export class CreateAuditLogDto {
    shopId: number;
    userId?: number;
    userName?: string;
    userRole?: string;
    action: string;
    entityType: string;
    entityId?: number;
    description?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
