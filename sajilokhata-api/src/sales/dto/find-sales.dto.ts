import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import type{ PaymentMethod, PaymentStatus } from '../entities';

export class FindSalesDto {
  // Date range filter (YYYY-MM-DD strings, inclusive)
  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  // Quick range shortcut — overrides fromDate/toDate if provided
  @IsOptional()
  @IsIn(['today', 'yesterday', 'week', 'month'])
  range?: 'today' | 'yesterday' | 'week' | 'month';

  @IsOptional()
  @IsEnum(['cash', 'qr', 'bank', 'credit', 'mixed'])
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsEnum(['paid', 'partial', 'due'])
  paymentStatus?: PaymentStatus;

  // Search by invoice number or customer name
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}