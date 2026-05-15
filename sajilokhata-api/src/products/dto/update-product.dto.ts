import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsNumber()
    purchasePrice?: number;

    @IsOptional()
    @IsNumber()
    sellingPrice?: number;

    @IsOptional()
    @IsNumber()
    stock?: number;

    @IsOptional()
    @IsNumber()
    lowStockLimit?: number;
}