import { IsOptional, IsEnum, IsNumber } from "class-validator";
import { Type } from "class-transformer";

export enum StockMovementType {
  IN = "in",
  OUT = "out",
}

export class GetStockMovementsDto {
  @IsOptional()
  @IsEnum(StockMovementType)
  type?: StockMovementType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  productId?: number;
}