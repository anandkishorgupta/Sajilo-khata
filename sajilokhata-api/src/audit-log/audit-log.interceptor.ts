import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditLogService } from './audit-log.service';
import { Reflector } from '@nestjs/core';

export const AUDIT_LOG_METADATA = 'audit_log';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuditInterceptor.name);

    constructor(
        private readonly auditLogService: AuditLogService,
        private readonly reflector: Reflector,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const method = request.method;

        if (method === 'GET') {
            return next.handle();
        }

        const user = request.user;
        if (!user || !user.shopId) {
            return next.handle();
        }

        const meta = this.reflector.get<{ entityType: string; action: string }>(
            AUDIT_LOG_METADATA,
            context.getHandler(),
        );

        const entityType = meta?.entityType ?? this.guessEntityType(request.url);
        const action = meta?.action ?? this.guessAction(method);

        return next.handle().pipe(
            tap((response) => {
                const description = this.buildDescription(method, request.url, response);

                this.auditLogService.log({
                    shopId: user.shopId,
                    userId: user.userId,
                    userName: user.email,
                    userRole: user.role,
                    action,
                    entityType,
                    entityId: response?.id ?? response?.data?.id ?? null,
                    description,
                    ipAddress: request.ip ?? request.connection?.remoteAddress,
                    userAgent: request.headers['user-agent'],
                }).catch((err) => {
                    this.logger.error('Audit log failed', err);
                });
            }),
        );
    }

    private guessEntityType(url: string): string {
        if (url.includes('/sales')) return 'Sale';
        if (url.includes('/purchases')) return 'Purchase';
        if (url.includes('/products')) return 'Product';
        if (url.includes('/categories')) return 'Category';
        if (url.includes('/customers')) return 'Customer';
        if (url.includes('/expenses')) return 'Expense';
        if (url.includes('/khata')) return 'Khata';
        if (url.includes('/staff')) return 'Staff';
        if (url.includes('/shops')) return 'Shop';
        if (url.includes('/users')) return 'User';
        if (url.includes('/auth')) return 'Auth';
        if (url.includes('/payments')) return 'Payment';
        return 'Other';
    }

    private guessAction(method: string): string {
        switch (method) {
            case 'POST': return 'CREATE';
            case 'PUT':
            case 'PATCH': return 'UPDATE';
            case 'DELETE': return 'DELETE';
            default: return 'OTHER';
        }
    }

    private buildDescription(method: string, url: string, response: any): string {
        const entity = this.guessEntityType(url);
        const action = this.guessAction(method);
        const id = response?.id ?? response?.data?.id;

        const verb = action === 'CREATE' ? 'Created' :
                     action === 'UPDATE' ? 'Updated' :
                     action === 'DELETE' ? 'Deleted' : 'Modified';

        return `${verb} ${entity}${id ? ` #${id}` : ''}`;
    }
}
