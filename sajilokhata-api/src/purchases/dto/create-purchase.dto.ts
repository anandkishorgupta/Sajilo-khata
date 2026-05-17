
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from "class-validator";
import { CreatePurchaseItemDto } from "./create-puchase-item.dto";


export enum PurchasePaymentMethod {
  CASH = "cash",
  BANK = "bank",
  CREDIT = "credit",
  MIXED = "mixed",
}

export class CreatePurchaseDto {
  // ✅ ADD THIS (IMPORTANT)
  @IsOptional()
  @IsString()
  supplierName?: string;

  // =========================
  // ITEMS
  // =========================
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true }) // ⭐ IMPORTANT FIX
  @Type(() => CreatePurchaseItemDto)
  items: CreatePurchaseItemDto[];

  // =========================
  // DISCOUNT / TAX
  // =========================
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tax?: number;

  // =========================
  // PAYMENT
  // =========================
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  paidAmount?: number;

  @IsEnum(PurchasePaymentMethod)
  paymentMethod: PurchasePaymentMethod;

  // =========================
  // EXTRA
  // =========================
  @IsOptional()
  @IsString()
  note?: string;
}



