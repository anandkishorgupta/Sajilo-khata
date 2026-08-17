import { IsDateString, IsIn, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAuditLogDto {
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @IsOptional()
    @IsString()
    entityType?: string;

    @IsOptional()
    @IsString()
    action?: string;

    @IsOptional()
    @Type(() => Number)
    userId?: number;

    @IsOptional()
    @IsDateString()
    fromDate?: string;

    @IsOptional()
    @IsDateString()
    toDate?: string;

    @IsOptional()
    @IsString()
    search?: string;
}
