import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from "class-transformer";
export class UpdateProductDto {
    @IsOptional()
    @IsString()
    name?: string;

    // @IsOptional()
    // @IsString()
    // sku?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    categoryId?: number;

    @IsOptional()
    @IsString()
    barcode?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    purchasePrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    sellingPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    stock?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    lowStockLimit?: number;
}