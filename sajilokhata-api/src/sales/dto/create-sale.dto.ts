import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { Type } from 'class-transformer';

import { SaleItemDto } from './sale-item.dto';

export enum PaymentMethod {
  CASH = 'cash',
  QR = 'qr',
  BANK = 'bank',
  CREDIT = 'credit',
  MIXED = 'mixed',
}

export class CreateSaleDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  customerId?: number;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  paidAmount?: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  note?: string;
}