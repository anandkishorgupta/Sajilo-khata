import { SetMetadata } from '@nestjs/common';
import { AUDIT_LOG_METADATA } from './audit-log.interceptor';

export const AuditLog = (entityType: string, action: string) =>
    SetMetadata(AUDIT_LOG_METADATA, { entityType, action });
