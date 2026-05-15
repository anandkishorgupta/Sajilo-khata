import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateProductDto {
    @IsString()
    name: string;  // product name

    @IsString()
    sku: string;

    @IsOptional()
    @IsString()
    barcode?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @Type(() => Number)
    @IsNumber()
    purchasePrice: number;

    @Type(() => Number)
    @IsNumber()
    sellingPrice: number;

    @Type(() => Number)
    @IsNumber()
    stock: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    lowStockLimit?: number;
}