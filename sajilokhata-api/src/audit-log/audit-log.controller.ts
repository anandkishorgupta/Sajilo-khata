import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuditLogService } from './audit-log.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@Controller('audit-log')
@Roles('owner')
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) {}

    @Get()
    findAll(@CurrentUser() user: any, @Query() query: QueryAuditLogDto) {
        return this.auditLogService.findAll(user.shopId, query);
    }

    @Get('stats')
    getStats(@CurrentUser() user: any) {
        return this.auditLogService.getStats(user.shopId);
    }
}
