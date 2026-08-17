import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@Injectable()
export class AuditLogService {
    private readonly logger = new Logger(AuditLogService.name);

    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepo: Repository<AuditLog>,
    ) {}

    async log(dto: CreateAuditLogDto): Promise<void> {
        try {
            const entry = this.auditLogRepo.create({
                shopId: dto.shopId,
                userId: dto.userId ?? null,
                userName: dto.userName ?? null,
                userRole: dto.userRole ?? null,
                action: dto.action,
                entityType: dto.entityType,
                entityId: dto.entityId ?? null,
                description: dto.description ?? null,
                oldValues: dto.oldValues ?? null,
                newValues: dto.newValues ?? null,
                ipAddress: dto.ipAddress ?? null,
                userAgent: dto.userAgent ?? null,
            });
            await this.auditLogRepo.save(entry);
        } catch (err) {
            this.logger.error('Failed to write audit log', err);
        }
    }

    async findAll(shopId: number, query: QueryAuditLogDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;

        const qb = this.auditLogRepo
            .createQueryBuilder('log')
            .where('log.shop_id = :shopId', { shopId });

        if (query.entityType) {
            qb.andWhere('log.entity_type = :entityType', {
                entityType: query.entityType,
            });
        }

        if (query.action) {
            qb.andWhere('log.action = :action', {
                action: query.action,
            });
        }

        if (query.userId) {
            qb.andWhere('log.user_id = :userId', {
                userId: query.userId,
            });
        }

        if (query.fromDate) {
            const from = new Date(query.fromDate);
            from.setHours(0, 0, 0, 0);
            qb.andWhere('log.created_at >= :from', { from });
        }

        if (query.toDate) {
            const to = new Date(query.toDate);
            to.setHours(23, 59, 59, 999);
            qb.andWhere('log.created_at <= :to', { to });
        }

        if (query.search) {
            qb.andWhere(
                new Brackets((sub) => {
                    sub
                        .where('log.description ILIKE :search', {
                            search: `%${query.search}%`,
                        })
                        .orWhere('log.user_name ILIKE :search', {
                            search: `%${query.search}%`,
                        });
                }),
            );
        }

        qb.orderBy('log.created_at', 'DESC');
        qb.skip((page - 1) * limit).take(limit);

        const [data, total] = await qb.getManyAndCount();
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getStats(shopId: number) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 6);

        const result = await this.auditLogRepo
            .createQueryBuilder('log')
            .where('log.shop_id = :shopId', { shopId })
            .select('COUNT(log.id)', 'total')
            .addSelect(
                `COUNT(CASE WHEN log.created_at >= :today THEN 1 END)`,
                'todayCount',
            )
            .addSelect(
                `COUNT(CASE WHEN log.created_at >= :weekAgo THEN 1 END)`,
                'weekCount',
            )
            .setParameters({ today, weekAgo })
            .getRawOne();

        const byEntity = await this.auditLogRepo
            .createQueryBuilder('log')
            .where('log.shop_id = :shopId', { shopId })
            .select('log.entity_type', 'entityType')
            .addSelect('COUNT(log.id)', 'count')
            .groupBy('log.entity_type')
            .orderBy('count', 'DESC')
            .getRawMany();

        const byUser = await this.auditLogRepo
            .createQueryBuilder('log')
            .where('log.shop_id = :shopId', { shopId })
            .andWhere('log.user_name IS NOT NULL')
            .select('log.user_name', 'userName')
            .addSelect('log.user_role', 'userRole')
            .addSelect('COUNT(log.id)', 'count')
            .groupBy('log.user_name')
            .addGroupBy('log.user_role')
            .orderBy('count', 'DESC')
            .limit(10)
            .getRawMany();

        return {
            total: Number(result.total),
            todayCount: Number(result.todayCount),
            weekCount: Number(result.weekCount),
            byEntity,
            byUser,
        };
    }
}
